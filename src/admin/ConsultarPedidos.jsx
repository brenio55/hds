import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsultarPedidos.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function ConsultarPedidos() {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [visualizandoId, setVisualizandoId] = useState(null);
    const [filtros, setFiltros] = useState({
        id: '',
        tipo: '',
        centroCusto: '',
        dataDecrescente: true
    });

    useEffect(() => {
        buscarTodosPedidos();
    }, []);

    const ordenarPedidosPorData = (pedidos) => {
        return [...pedidos].sort((a, b) => {
            const dataA = new Date(a.created_at || a.data_criacao);
            const dataB = new Date(b.created_at || b.data_criacao);
            return dataB - dataA; // Ordem decrescente (mais recente primeiro)
        });
    };

    const buscarTodosPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Iniciando busca de pedidos consolidados...");
            let data;
            try {
                // Usar o método de pedidos consolidados para obter todos os tipos de pedidos
                data = await ApiService.buscarPedidosConsolidados();
                console.log("Resposta da API pedidos consolidados:", data);
            } catch (apiError) {
                console.error('Erro ao buscar pedidos consolidados:', apiError);
                try {
                    console.log("Tentando fallback para buscarPedidosCompra...");
                    data = await ApiService.buscarPedidosCompra();
                } catch (fallbackError) {
                    console.error('Erro no fallback para pedidos de compra:', fallbackError);
                    console.warn('Usando dados de exemplo como último recurso');
                    data = await ApiService.carregarDadosExemplo();
                }
            }
            
            // Se a resposta for um array direto, usamos ele, senão procuramos a propriedade pedidos
            const pedidosData = Array.isArray(data) ? data : (data.pedidos || []);
            console.log(`Pedidos encontrados: ${pedidosData.length}`);
            
            if (pedidosData.length === 0) {
                console.warn("Nenhum pedido encontrado na resposta");
            }
            
            const pedidosProcessados = processarPedidos(pedidosData);
            const pedidosOrdenados = ordenarPedidosPorData(pedidosProcessados);
            setPedidos(pedidosOrdenados);
        } catch (error) {
            setError('Erro ao carregar pedidos. Por favor, tente novamente.');
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Função para processar os pedidos e calcular valores totais
    const processarPedidos = (pedidosData) => {
        return pedidosData.map(pedido => {
            console.log("Processando pedido:", pedido);
            
            // Pedidos consolidados já vêm com o campo tipo definido
            const tipo = pedido.tipo || 'compra';
            
            // Calcular o valor total baseado na estrutura do pedido
            let valorTotal = 0;
            
            if (pedido.valor_total) {
                // Se já tiver valor_total, usamos ele diretamente
                valorTotal = parseFloat(pedido.valor_total) || 0;
            } else if (pedido.materiais && Array.isArray(pedido.materiais)) {
                // Para pedidos de compra, somamos os materiais
                valorTotal = pedido.materiais.reduce((total, item) => {
                    return total + (parseFloat(item.valor_total) || 0);
                }, 0);
            } else if (pedido.itens && Array.isArray(pedido.itens)) {
                // Para pedidos de locação ou serviço, somamos os itens
                valorTotal = pedido.itens.reduce((total, item) => {
                    return total + (parseFloat(item.valor_total) || 0);
                }, 0);
            }
            
            // Estruturar dados formatados para exibição
            return {
                ...pedido,
                valor_total: valorTotal,
                tipo: tipo,
                data_formatada: formatarData(pedido.created_at || pedido.data_criacao || pedido.data),
                fornecedor_nome: pedido.fornecedor?.nome || pedido.fornecedor?.razao_social || 'N/A'
            };
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const filtrosValidos = Object.fromEntries(
                Object.entries(filtros).filter(([key, value]) => value !== '' && key !== 'dataDecrescente')
            );
            
            console.log("Buscando pedidos com filtros:", filtrosValidos);
            let data;
            try {
                // Usar o método de pedidos consolidados que retorna todos os tipos
                data = await ApiService.buscarPedidosConsolidados(filtrosValidos);
                console.log("Resposta da API com filtros:", data);
            } catch (apiError) {
                console.error('Erro ao buscar pedidos consolidados com filtros:', apiError);
                
                try {
                    console.log("Tentando fallback para buscarPedidosCompra...");
                    data = await ApiService.buscarPedidosCompra(filtrosValidos);
                } catch (fallbackError) {
                    console.error('Erro no fallback para pedidos de compra:', fallbackError);
                    console.warn('Usando dados de exemplo como último recurso');
                    data = await ApiService.carregarDadosExemplo();
                    
                    // Aplicar filtros manualmente aos dados de exemplo
                    if (Object.keys(filtrosValidos).length > 0) {
                        data = data.filter(pedido => {
                            let match = true;
                            if (filtrosValidos.id && pedido.id.toString() !== filtrosValidos.id.toString()) {
                                match = false;
                            }
                            if (filtrosValidos.tipo && pedido.tipo !== filtrosValidos.tipo) {
                                match = false;
                            }
                            if (filtrosValidos.centroCusto && pedido.proposta_id.toString() !== filtrosValidos.centroCusto.toString()) {
                                match = false;
                            }
                            return match;
                        });
                    }
                }
            }
            
            const pedidosData = Array.isArray(data) ? data : (data.pedidos || []);
            console.log(`Pedidos filtrados encontrados: ${pedidosData.length}`);
            
            const pedidosProcessados = processarPedidos(pedidosData);
            
            let pedidosOrdenados = pedidosProcessados;
            if (filtros.dataDecrescente) {
                pedidosOrdenados = ordenarPedidosPorData(pedidosProcessados);
            }
            
            setPedidos(pedidosOrdenados);
        } catch (error) {
            setError('Erro ao buscar pedidos. Por favor, tente novamente.');
            console.error('Erro na busca:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleVisualizarPedido = async (id, tipo) => {
        try {
            setVisualizandoId(id);
            console.log(`Visualizando pedido ${id} do tipo ${tipo}`);
            
            // Escolher o método correto com base no tipo de pedido
            if (tipo === 'servico') {
                await ApiService.visualizarPedidoServicoPdf(id);
            } else if (tipo === 'locacao') {
                await ApiService.visualizarPedidoLocacaoPdf(id);
            } else {
                // Default para pedidos de compra
                await ApiService.visualizarPedidoPdf(id);
            }
        } catch (error) {
            console.error('Erro ao visualizar PDF do pedido:', error);
            alert('Erro ao visualizar o PDF do pedido. Por favor, tente novamente.');
        } finally {
            setVisualizandoId(null);
        }
    };

    const handleDownloadPedido = async (id, tipo) => {
        try {
            setDownloadingId(id);
            console.log(`Baixando pedido ${id} do tipo ${tipo}`);
            
            // Escolher o método correto com base no tipo de pedido
            if (tipo === 'servico') {
                await ApiService.downloadPedidoServicoPdf(id);
            } else if (tipo === 'locacao') {
                await ApiService.downloadPedidoLocacaoPdf(id);
            } else {
                // Default para pedidos de compra
                await ApiService.downloadPedidoPdf(id);
            }
        } catch (error) {
            console.error('Erro ao baixar PDF do pedido:', error);
            alert('Erro ao baixar o PDF do pedido. Por favor, tente novamente.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleEditarPedido = (id) => {
        // Implementar edição do pedido
        navigate(`/admin/pedidos/${id}/editar`);
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const formatarValor = (valor) => {
        if (!valor && valor !== 0) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const getTipoPedido = (tipo) => {
        const tipos = {
            'Compra de Material': 'compra',
            'Serviço': 'servico',
            'Locação': 'locacao',
            
        };
        return tipos[tipo] || tipo || '-';
    };

    return (
        <>
            <HeaderAdmin />
            <div className="consultar-propostas-container">
                <h2>Consultar Pedidos C-L-S</h2>
                
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="tipo">Tipo de Pedido</label>
                        <select
                            id="tipo"
                            name="tipo"
                            value={filtros.tipo}
                            onChange={handleInputChange}
                        >
                            <option value="">Todos</option>
                            <option value="material">Compra de Material</option>
                            <option value="servico">Serviço</option>
                            <option value="locacao">Locação</option>
                            
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="id">ID do Pedido</label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            placeholder="ID do Pedido"
                            value={filtros.id}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="centroCusto">Centro de Custo</label>
                        <input
                            type="text"
                            id="centroCusto"
                            name="centroCusto"
                            placeholder="Centro de Custo"
                            value={filtros.centroCusto}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="dataDecrescente"
                                checked={filtros.dataDecrescente}
                                onChange={handleCheckboxChange}
                            />
                            Data Decrescente
                        </label>
                    </div>
                    <button type="submit" className="search-button" disabled={loading}>
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="table-container">
                    {loading ? (
                        <div className="loading">Carregando pedidos...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tipo</th>
                                    <th>Fornecedor</th>
                                    <th>Cliente ID</th>
                                    <th>Proposta ID</th>
                                    <th>Valor Total</th>
                                    <th>Data Criação</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="no-data">
                                            Nenhum pedido encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    pedidos.map((pedido) => (
                                        <tr key={pedido.id}>
                                            <td>{pedido.id}</td>
                                            <td>{getTipoPedido(pedido.tipo)}</td>
                                            <td>{pedido.fornecedor_nome || `ID: ${pedido.fornecedor_id || pedido.fornecedores_id}` || '-'}</td>
                                            <td>{pedido.cliente_id || pedido.clientinfo_id || '-'}</td>
                                            <td>{pedido.proposta_id || '-'}</td>
                                            <td>{formatarValor(pedido.valor_total)}</td>
                                            <td>{pedido.data_formatada || formatarData(pedido.created_at || pedido.data_criacao)}</td>
                                            <td className="actions-column">
                                                <div className="action-buttons">
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => handleVisualizarPedido(pedido.id, pedido.tipo)}
                                                        disabled={visualizandoId === pedido.id}
                                                    >
                                                        {visualizandoId === pedido.id ? 'Abrindo...' : 'Visualizar'}
                                                    </button>
                                                    <button 
                                                        className="download-button"
                                                        onClick={() => handleDownloadPedido(pedido.id, pedido.tipo)}
                                                        disabled={downloadingId === pedido.id}
                                                    >
                                                        {downloadingId === pedido.id ? 'Baixando...' : 'Download'}
                                                    </button>
                                                    <button 
                                                        className="edit-button"
                                                        onClick={() => handleEditarPedido(pedido.id)}
                                                    >
                                                        Editar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}

export default ConsultarPedidos; 