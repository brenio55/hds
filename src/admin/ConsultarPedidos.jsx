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
            let data;
            try {
                data = await ApiService.buscarPedidosCompra();
            } catch (apiError) {
                console.warn('Erro ao buscar pedidos da API, usando dados de exemplo:', apiError);
                data = await ApiService.carregarDadosExemplo();
            }
            
            // Se a resposta for um array direto, usamos ele, senão procuramos a propriedade pedidos
            const pedidosData = Array.isArray(data) ? data : (data.pedidos || []);
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
            // Calcular o valor total somando todos os itens
            const valorTotal = pedido.materiais?.reduce((total, item) => {
                return total + (parseFloat(item.valor_total) || 0);
            }, 0) || 0;

            // Determinar o tipo de pedido (assumindo que é material por padrão)
            const tipo = pedido.tipo || 'material';

            return {
                ...pedido,
                valor_total: valorTotal,
                tipo: tipo
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
            
            let data;
            try {
                data = await ApiService.buscarPedidosCompra(filtrosValidos);
            } catch (apiError) {
                console.warn('Erro ao buscar pedidos da API, usando dados de exemplo:', apiError);
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
            
            const pedidosData = Array.isArray(data) ? data : (data.pedidos || []);
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

    const handleVisualizarPedido = async (id) => {
        try {
            setVisualizandoId(id);
            await ApiService.visualizarPedidoPdf(id);
        } catch (error) {
            console.error('Erro ao visualizar PDF do pedido:', error);
            alert('Erro ao visualizar o PDF do pedido. Por favor, tente novamente.');
        } finally {
            setVisualizandoId(null);
        }
    };

    const handleDownloadPedido = async (id) => {
        try {
            setDownloadingId(id);
            await ApiService.downloadPedidoPdf(id);
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
            'material': 'Material',
            'servico': 'Serviço',
            'locacao': 'Locação',
            'faturamento': 'Faturamento'
        };
        return tipos[tipo] || tipo || '-';
    };

    return (
        <>
            <HeaderAdmin />
            <div className="consultar-propostas-container">
                <h2>Consultar Pedidos C-L-S e Faturamentos</h2>
                
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
                            <option value="material">Material</option>
                            <option value="servico">Serviço</option>
                            <option value="locacao">Locação</option>
                            <option value="faturamento">Faturamento</option>
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
                                            <td>{pedido.fornecedor_nome || `ID: ${pedido.fornecedores_id}` || '-'}</td>
                                            <td>{pedido.clientinfo_id || '-'}</td>
                                            <td>{pedido.proposta_id || '-'}</td>
                                            <td>{formatarValor(pedido.valor_total)}</td>
                                            <td>{formatarData(pedido.created_at || pedido.data_criacao)}</td>
                                            <td className="actions-column">
                                                <div className="action-buttons">
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => handleVisualizarPedido(pedido.id)}
                                                        disabled={visualizandoId === pedido.id}
                                                    >
                                                        {visualizandoId === pedido.id ? 'Abrindo...' : 'Visualizar'}
                                                    </button>
                                                    <button 
                                                        className="download-button"
                                                        onClick={() => handleDownloadPedido(pedido.id)}
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