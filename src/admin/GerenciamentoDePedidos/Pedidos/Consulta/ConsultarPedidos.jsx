import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsultarPedidos.css';
import HeaderAdmin from '../../../CommonComponents/HeaderAdmin';
import ApiService from '../../../../services/ApiService';
import '../../../../App.css';

function ConsultarPedidos() {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [visualizandoId, setVisualizandoId] = useState(null);
    const [filtros, setFiltros] = useState({
        id: '',
        tipo: '',
        fornecedor: '',
        data_vencimento: '',
        valor_total: '',
        dataDecrescente: true
    });

    useEffect(() => {
        buscarTodosPedidos();
    }, []);

    useEffect(() => {
        aplicarFiltrosLocais();
    }, [filtros, pedidos]);

    const ordenarPedidosPorData = (pedidos) => {
        return [...pedidos].sort((a, b) => {
            const dataA = new Date(a.created_at || a.data_criacao || a.data);
            const dataB = new Date(b.created_at || b.data_criacao || b.data);
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
            setPedidosFiltrados(pedidosOrdenados);
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

    const getTipoPedido = (tipo) => {
        // Obter descrição adequada para display com base no tipo do backend
        const tiposDisplay = {
            'compra': 'Compra de Material',
            'servico': 'Serviço',
            'locacao': 'Locação',
            'material': 'Compra de Material'
        };
        return tiposDisplay[tipo] || tipo || '-';
    };

    const getTipoBackend = (tipoFrontend) => {
        // Mapear os valores do frontend para os valores esperados pelo backend
        const tiposBackend = {
            'material': 'compra', // Frontend usa 'material', backend usa 'compra'
            'servico': 'servico',
            'locacao': 'locacao'
        };
        return tiposBackend[tipoFrontend] || tipoFrontend;
    };

    // Função para normalizar strings para comparação
    const normalizar = (texto) => {
        if (texto == null) return '';
        texto = String(texto);
        return texto.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    // Função para normalizar números (remover pontos, traços, parênteses, espaços)
    const normalizarNumero = (texto) => {
        if (texto == null) return '';
        return String(texto).replace(/[^0-9.,]/g, '');
    };

    const aplicarFiltrosLocais = () => {
        // Pular se o filtro de ID estiver ativo, pois ele usa requisição específica
        if (filtros.id.trim() !== '') {
            // Implementaremos a filtragem por ID depois
            return;
        }

        // Normalizar os filtros uma vez antes de aplicar
        const filtrosNormalizados = {
            tipo: normalizar(filtros.tipo),
            fornecedor: normalizar(filtros.fornecedor),
            data_vencimento: filtros.data_vencimento, // Datas são tratadas separadamente
            valor_total: normalizarNumero(filtros.valor_total)
        };

        // Aplicar filtros nos campos
        let resultado = pedidos.filter(pedido => {
            // Para cada campo de filtro
            return Object.entries(filtrosNormalizados).every(([campo, valorFiltro]) => {
                // Ignorar campos vazios
                if (!valorFiltro) return true;

                let valorCampo;
                
                // Tratamento especial para tipo de pedido
                if (campo === 'tipo') {
                    const tipoPedido = normalizar(getTipoPedido(pedido.tipo));
                    return tipoPedido.includes(valorFiltro);
                }
                // Tratamento especial para fornecedor
                else if (campo === 'fornecedor') {
                    const nomeFornecedor = normalizar(pedido.fornecedor_nome || '');
                    const idFornecedor = normalizar(String(pedido.fornecedor_id || pedido.fornecedores_id || ''));
                    // Buscar tanto no nome quanto no ID do fornecedor
                    return nomeFornecedor.includes(valorFiltro) || idFornecedor.includes(valorFiltro);
                }
                // Tratamento para data de vencimento
                else if (campo === 'data_vencimento') {
                    // Verificar se a data do pedido contém a data do filtro (formato YYYY-MM-DD)
                    const dataPedidoFormatada = pedido.data_vencimento ? pedido.data_vencimento.split('T')[0] : '';
                    return dataPedidoFormatada === valorFiltro;
                }
                // Tratamento para valor
                else if (campo === 'valor_total') {
                    // Normalizar valor do pedido para comparação
                    const valorPedidoNormalizado = normalizarNumero(String(pedido.valor_total || '0'));
                    return valorPedidoNormalizado.includes(valorFiltro);
                }
                // Campos de texto normais - normalizar e buscar por inclusão
                else {
                    valorCampo = normalizar(pedido[campo]);
                    return valorCampo.includes(valorFiltro);
                }
            });
        });
        
        // Aplicar ordenação por data se necessário
        if (filtros.dataDecrescente) {
            resultado = ordenarPedidosPorData(resultado);
        }
        
        setPedidosFiltrados(resultado);
    };

    const buscarPedidoPorId = async (id) => {
        if (!id || id.trim() === '') {
            await buscarTodosPedidos();
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Buscamos todos os pedidos e depois filtramos pelo ID
            let data;
            try {
                data = await ApiService.buscarPedidosConsolidados();
            } catch (apiError) {
                console.error('Erro ao buscar pedidos consolidados:', apiError);
                data = await ApiService.buscarPedidosCompra();
            }
            
            const pedidosData = Array.isArray(data) ? data : (data.pedidos || []);
            const pedidosProcessados = processarPedidos(pedidosData);
            
            const pedidoEncontrado = pedidosProcessados.find(p => p.id.toString() === id.toString());
            
            if (pedidoEncontrado) {
                setPedidosFiltrados([pedidoEncontrado]);
            } else {
                setPedidosFiltrados([]);
                setError('Pedido não encontrado com o ID informado.');
            }
        } catch (error) {
            setError(`Erro ao buscar pedido: ${error.message}`);
            setPedidosFiltrados([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        // Se o ID estiver preenchido, busca específica por ID
        if (filtros.id.trim() !== '') {
            await buscarPedidoPorId(filtros.id);
        } else {
            // Se não, aplica filtros locais
            aplicarFiltrosLocais();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpar outros filtros se estiver preenchendo o ID
        if (name === 'id' && value.trim() !== '') {
            setFiltros(prev => ({
                ...prev,
                tipo: '',
                fornecedor: '',
                data_vencimento: '',
                valor_total: ''
            }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const limparFiltros = () => {
        setFiltros({
            id: '',
            tipo: '',
            fornecedor: '',
            data_vencimento: '',
            valor_total: '',
            dataDecrescente: true
        });
        buscarTodosPedidos();
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
        // navigate(`/admin/pedidos/${id}/editar`);
        alert("Esta função por este botão está desabilitada no momento, por favor, tente novamente em outro momento, ou contate a equipe de TI.")
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

    return (
        <>
            <HeaderAdmin />
            <div className="consultar-propostas-container pt-[var(--std-topSpace-navbar)] px-8 mx-auto">
                <h2>Consultar Pedidos C-L-S</h2>
                
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-row">
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
                            <label htmlFor="tipo">Tipo de Pedido</label>
                            <select
                                id="tipo"
                                name="tipo"
                                value={filtros.tipo}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            >
                                <option value="">Todos</option>
                                <option value="material">Compra de Material</option>
                                <option value="servico">Serviço</option>
                                <option value="locacao">Locação</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="fornecedor">Fornecedor</label>
                            <input
                                type="text"
                                id="fornecedor"
                                name="fornecedor"
                                placeholder="Nome ou ID do Fornecedor"
                                value={filtros.fornecedor}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="data_vencimento">Data de Vencimento</label>
                            <input
                                type="date"
                                id="data_vencimento"
                                name="data_vencimento"
                                value={filtros.data_vencimento}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="valor_total">Valor Total</label>
                            <input
                                type="text"
                                id="valor_total"
                                name="valor_total"
                                placeholder="Valor Total"
                                value={filtros.valor_total}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
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
                    </div>
                    <div className="">
                        <button 
                            type="button" 
                            className="clear-button"
                            onClick={limparFiltros}
                        >
                            Limpar Filtros
                        </button>
                        <button type="submit" className="search-button" disabled={loading}>
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
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
                                {pedidosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="no-data">
                                            Nenhum pedido encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    pedidosFiltrados.map((pedido) => (
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