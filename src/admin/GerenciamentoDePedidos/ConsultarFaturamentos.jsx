import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import ApiService from '../../services/ApiService';
import './ConsultarFaturamentos.css';
// import './GerenciarPedidos.css';
import axios from 'axios';
// import { toast } from 'react-toastify';
// import moment from 'moment';
// import { formatCurrency } from '../../utils/formatters';
// import { enviarNotificacaoPedido } from '../../utils/notificacoes';

function ConsultarFaturamentos() {
    const [faturamentos, setFaturamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tipoFiltro, setTipoFiltro] = useState('todos');
    const [numeroPedido, setNumeroPedido] = useState('');
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [visualizandoDetalhes, setVisualizandoDetalhes] = useState(null);

    useEffect(() => {
        carregarFaturamentos();
    }, []); 

    // Função para navegar para a tela de faturar com pedido pré-selecionado
    const navegarParaFaturar = (pedidoId) => {
        window.location.href = `/admin/faturarPedido?pedido=${pedidoId}`;
    };
    
    // Determina a classe CSS com base na porcentagem faturada
    const getStatusFaturamentoClass = (pedido) => {
        if (!pedido || pedido.valorTotal <= 0) return '';
        
        let percentual = 0;
        if (pedido.porcentagemFaturada !== undefined) {
            percentual = pedido.porcentagemFaturada;
        } else if (pedido.valorFaturado !== undefined && pedido.valorTotal > 0) {
            percentual = (pedido.valorFaturado / pedido.valorTotal) * 100;
        }
        
        if (percentual >= 100) return 'faturado-completo';
        if (percentual > 0) return 'faturado-parcial';
        return 'nao-faturado';
    };
    
    // Renderiza o status de faturamento como texto
    const getStatusFaturamentoTexto = (pedido) => {
        if (!pedido || pedido.valorTotal <= 0) return 'N/D';
        
        let percentual = 0;
        if (pedido.porcentagemFaturada !== undefined) {
            percentual = pedido.porcentagemFaturada;
        } else if (pedido.valorFaturado !== undefined && pedido.valorTotal > 0) {
            percentual = (pedido.valorFaturado / pedido.valorTotal) * 100;
        }
        
        if (percentual >= 100) return '100% Faturado';
        if (percentual > 0) return `${percentual.toFixed(2)}% Faturado`;
        return 'Não Faturado';
    };

    const carregarFaturamentos = async (filtrosPersonalizados = null) => {
        try {
            setLoading(true);
            setError(null);
            console.log("Carregando faturamentos...");
            
            // Use filtros personalizados ou os do estado
            const filtros = filtrosPersonalizados || {
                tipo: tipoFiltro,
                numeroPedido,
                dataInicial,
                dataFinal
            };
            
            console.log("Filtros aplicados:", filtros);
            
            // Buscar dados dos pedidos consolidados
            const resposta = await ApiService.buscarPedidosConsolidados(filtros);
            console.log("Dados recebidos da API:", resposta);
            
            if (!resposta || !resposta.pedidos || resposta.pedidos.length === 0) {
                setError('Nenhum faturamento encontrado com os filtros selecionados.');
                setFaturamentos([]);
                setLoading(false);
                return;
            }
            
            // Mapear os pedidos para o formato esperado pela interface
            const faturamentosProcessados = resposta.pedidos.map(pedido => {
                // Extrair nome do fornecedor
                let fornecedorNome = 'N/D';
                if (pedido.fornecedor) {
                    fornecedorNome = typeof pedido.fornecedor === 'object' 
                        ? pedido.fornecedor.nome || pedido.fornecedor.razao_social 
                        : pedido.fornecedor;
                }
                
                // Gerar número do pedido com prefixo baseado no tipo
                let prefixo = '';
                switch (pedido.tipo) {
                    case 'compra': prefixo = 'PC'; break;
                    case 'locacao': prefixo = 'PL'; break;
                    case 'servico': prefixo = 'PS'; break;
                    default: prefixo = 'P'; break;
                }
                
                // Calcular percentual faturado se disponível
                let porcentagemFaturada = 0;
                if (parseFloat(pedido.valor_total) > 0 && pedido.valor_faturado) {
                    // Se valor_faturado estiver em percentual (0-100)
                    if (pedido.valor_faturado <= 100) {
                        porcentagemFaturada = pedido.valor_faturado;
                    } else {
                        // Se for valor absoluto, calcular percentual
                        porcentagemFaturada = (pedido.valor_faturado / parseFloat(pedido.valor_total)) * 100;
                    }
                }
                
                return {
                    id: pedido.id,
                    numeroPedido: pedido.id,
                    numero: `${prefixo}-${pedido.id}`,
                    tipoPedido: pedido.tipo,
                    valorTotal: parseFloat(pedido.valor_total),
                    // Se valor_faturado for percentual (0-100), converter para valor monetário
                    valorFaturado: pedido.valor_faturado <= 100 
                        ? (pedido.valor_faturado / 100) * parseFloat(pedido.valor_total)
                        : parseFloat(pedido.valor_faturado),
                    valorAFaturar: Math.max(0, parseFloat(pedido.valor_total) - (pedido.valor_faturado <= 100 
                        ? (pedido.valor_faturado / 100) * parseFloat(pedido.valor_total)
                        : parseFloat(pedido.valor_faturado))),
                    dataFaturamento: pedido.data,
                    dataVencimento: pedido.data_vencimento,
                    fornecedor: fornecedorNome,
                    cliente: pedido.cliente_id ? `Cliente #${pedido.cliente_id}` : 'N/D',
                    status: pedido.status,
                    metodoPagamento: pedido.pagamento || 'N/D',
                    porcentagemFaturada: porcentagemFaturada,
                };
            });
            
            console.log("Faturamentos processados:", faturamentosProcessados);
            setFaturamentos(faturamentosProcessados);
        } catch (error) {
            console.error('Erro ao carregar faturamentos:', error);
            setFaturamentos([]);
            setError('Erro ao carregar faturamentos. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        carregarFaturamentos();
    };

    const handleLimparFiltros = () => {
        setTipoFiltro('todos');
        setNumeroPedido('');
        setDataInicial('');
        setDataFinal('');
        // Recarregar sem filtros
        carregarFaturamentos({
            tipo: 'todos'
        });
    };
    
    const formatarData = (data) => {
        if (!data) return 'N/D';
        
        try {
            return new Date(data).toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data inválida';
        }
    };

    const formatarValor = (valor) => {
        if (valor === null || valor === undefined) return 'N/D';
        
        try {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(valor);
        } catch (error) {
            console.error('Erro ao formatar valor:', error);
            return 'Valor inválido';
        }
    };
    
    const obterNomeTipoPedido = (tipo) => {
        switch (tipo) {
            case 'compra': return 'Pedido de Compra';
            case 'locacao': return 'Pedido de Locação';
            case 'servico': return 'Pedido de Serviço';
            default: return tipo || 'N/D';
        }
    };

    const abrirDetalhes = (faturamento) => {
        setVisualizandoDetalhes(faturamento);
    };

    const fecharDetalhes = () => {
        setVisualizandoDetalhes(null);
    };

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-containerFaturamentos">
                    <div className="tabs-navigation">
                        <div className="tab" onClick={() => window.location.href = '/admin/faturarPedido'}>
                            Faturar Pedido
                        </div>
                        <div className="tab active">
                            Consultar Faturamentos
                        </div>
                    </div>
                    
                    <h1>CONSULTA DE FATURAMENTOS</h1>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleBuscar} className="filtro-container">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Número do Pedido:</label>
                                <input
                                    type="text"
                                    value={numeroPedido}
                                    onChange={(e) => setNumeroPedido(e.target.value)}
                                    placeholder="Digite o número do pedido"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tipo de Pedido:</label>
                                <select 
                                    value={tipoFiltro} 
                                    onChange={(e) => setTipoFiltro(e.target.value)}
                                    className="filtro-select"
                                >
                                    <option value="todos">Todos os Pedidos</option>
                                    <option value="compra">Pedido de Compra</option>
                                    <option value="locacao">Pedido de Locação</option>
                                    <option value="servico">Pedido de Serviço</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Data Inicial:</label>
                                <input
                                    type="date"
                                    value={dataInicial}
                                    onChange={(e) => setDataInicial(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Data Final:</label>
                                <input
                                    type="date"
                                    value={dataFinal}
                                    onChange={(e) => setDataFinal(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="action-button search-button">
                                {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                            
                            <button 
                                type="button" 
                                className="action-button clear-button"
                                onClick={handleLimparFiltros}
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </form>

                    {loading ? (
                        <div className="loading-container">
                            <p>Carregando faturamentos...</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            {faturamentos.length === 0 ? (
                                <div className="no-data-message">
                                    {error || "Nenhum faturamento encontrado"}
                                </div>
                            ) : (
                                <table className="itens-table">
                                    <thead>
                                        <tr>
                                            <th>Nº Pedido</th>
                                            <th>Tipo</th>
                                            <th>Fornecedor</th>
                                            <th>Valor Total do Pedido</th>
                                            <th>Valor Faturado</th>
                                            <th>Valor a Faturar</th>
                                            <th>Status Faturamento</th>
                                            <th>Status</th>
                                            <th>Data de Criação</th>
                                            <th>Data de Vencimento</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faturamentos.map((faturamento) => (
                                            <tr 
                                                key={faturamento.id} 
                                                className={getStatusFaturamentoClass(faturamento)}
                                            >
                                                <td>{faturamento.numero || `${faturamento.tipoPedido.toUpperCase().charAt(0)}${faturamento.tipoPedido === 'compra' ? 'C' : faturamento.tipoPedido === 'locacao' ? 'L' : 'S'}-${faturamento.numeroPedido}`}</td>
                                                <td>{obterNomeTipoPedido(faturamento.tipoPedido)}</td>
                                                <td>{faturamento.fornecedor || 'N/D'}</td>
                                                <td>{formatarValor(faturamento.valorTotal)}</td>
                                                <td>{formatarValor(faturamento.valorFaturado)}</td>
                                                <td>{formatarValor(faturamento.valorAFaturar)}</td>
                                                <td className={`status-cell ${getStatusFaturamentoClass(faturamento)}`}>
                                                    {getStatusFaturamentoTexto(faturamento)}
                                                </td>
                                                <td>{faturamento.status || 'N/D'}</td>
                                                <td>{formatarData(faturamento.dataFaturamento)}</td>
                                                <td>{formatarData(faturamento.dataVencimento)}</td>
                                                <td className="acoes-cell">
                                                    <button 
                                                        onClick={() => abrirDetalhes(faturamento)}
                                                        className="action-button view-button"
                                                        title="Ver detalhes"
                                                    >
                                                        Detalhes
                                                    </button>
                                                    
                                                    {faturamento.valorAFaturar > 0 && (
                                                        <button 
                                                            onClick={() => navegarParaFaturar(faturamento.id)}
                                                            className="action-button faturar-button"
                                                            title="Faturar pedido"
                                                        >
                                                            Faturar
                                                        </button>
                                                    )}
                                                    
                                                    {faturamento.arquivoNF && (
                                                        <button 
                                                            onClick={() => window.open(faturamento.arquivoNF, '_blank')}
                                                            className="action-button view-button"
                                                            title="Visualizar NF"
                                                        >
                                                            Ver NF
                                                        </button>
                                                    )}
                                                    
                                                    {faturamento.metodoPagamento === 'boleto' && faturamento.arquivoBoleto && (
                                                        <button 
                                                            onClick={() => window.open(faturamento.arquivoBoleto, '_blank')}
                                                            className="action-button view-button"
                                                            title="Visualizar Boleto"
                                                        >
                                                            Ver Boleto
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    
                    {visualizandoDetalhes && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h2>Detalhes do Pedido</h2>
                                
                                <div className="detalhes-container">
                                    <div className="detalhes-item">
                                        <strong>Número do Pedido:</strong>
                                        <span>{visualizandoDetalhes.numero || `${visualizandoDetalhes.tipoPedido.toUpperCase().charAt(0)}${visualizandoDetalhes.tipoPedido === 'compra' ? 'C' : visualizandoDetalhes.tipoPedido === 'locacao' ? 'L' : 'S'}-${visualizandoDetalhes.id}`}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Tipo de Pedido:</strong>
                                        <span>{obterNomeTipoPedido(visualizandoDetalhes.tipoPedido)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Status:</strong>
                                        <span>{visualizandoDetalhes.status || 'N/D'}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Fornecedor:</strong>
                                        <span>{visualizandoDetalhes.fornecedor || 'N/D'}</span>
                                    </div>
                                    
                                    {visualizandoDetalhes.cliente && (
                                        <div className="detalhes-item">
                                            <strong>Cliente:</strong>
                                            <span>{visualizandoDetalhes.cliente}</span>
                                        </div>
                                    )}
                                    
                                    <div className="detalhes-item">
                                        <strong>Valor Total do Pedido:</strong>
                                        <span>{formatarValor(visualizandoDetalhes.valorTotal)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Valor Faturado:</strong>
                                        <span>{formatarValor(visualizandoDetalhes.valorFaturado)} 
                                        {visualizandoDetalhes.porcentagemFaturada !== undefined && (
                                            <span className="porcentagem-info"> ({visualizandoDetalhes.porcentagemFaturada.toFixed(2)}%)</span>
                                        )}
                                        </span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Valor a Faturar:</strong>
                                        <span>{formatarValor(visualizandoDetalhes.valorAFaturar)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Data de Criação:</strong>
                                        <span>{formatarData(visualizandoDetalhes.dataFaturamento)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Data de Vencimento:</strong>
                                        <span>{formatarData(visualizandoDetalhes.dataVencimento)}</span>
                                    </div>
                                    
                                    {visualizandoDetalhes.numeroNF && (
                                        <div className="detalhes-item">
                                            <strong>Número da NF:</strong>
                                            <span>{visualizandoDetalhes.numeroNF}</span>
                                        </div>
                                    )}
                                    
                                    {visualizandoDetalhes.metodoPagamento && (
                                        <div className="detalhes-item">
                                            <strong>Método de Pagamento:</strong>
                                            <span>{visualizandoDetalhes.metodoPagamento}</span>
                                        </div>
                                    )}
                                    
                                    {visualizandoDetalhes.metodoPagamento === 'boleto' && visualizandoDetalhes.codigoBoleto && (
                                        <div className="detalhes-item">
                                            <strong>Código do Boleto:</strong>
                                            <span>{visualizandoDetalhes.codigoBoleto}</span>
                                        </div>
                                    )}
                                    
                                    {(visualizandoDetalhes.metodoPagamento === 'pix' || visualizandoDetalhes.metodoPagamento === 'ted') && visualizandoDetalhes.dadosConta && (
                                        <div className="detalhes-item">
                                            <strong>Dados da Conta:</strong>
                                            <span>{visualizandoDetalhes.dadosConta}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="modal-buttons">
                                    {visualizandoDetalhes.valorAFaturar > 0 && (
                                        <button 
                                            onClick={() => {
                                                fecharDetalhes();
                                                navegarParaFaturar(visualizandoDetalhes.id);
                                            }}
                                            className="action-button faturar-button"
                                        >
                                            Faturar Pedido
                                        </button>
                                    )}
                                    
                                    {visualizandoDetalhes.arquivoNF && (
                                        <button 
                                            onClick={() => window.open(visualizandoDetalhes.arquivoNF, '_blank')}
                                            className="action-button view-button"
                                        >
                                            Visualizar NF
                                        </button>
                                    )}
                                    
                                    {visualizandoDetalhes.metodoPagamento === 'boleto' && visualizandoDetalhes.arquivoBoleto && (
                                        <button 
                                            onClick={() => window.open(visualizandoDetalhes.arquivoBoleto, '_blank')}
                                            className="action-button view-button"
                                        >
                                            Visualizar Boleto
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={fecharDetalhes}
                                        className="action-button close-button"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ConsultarFaturamentos; 