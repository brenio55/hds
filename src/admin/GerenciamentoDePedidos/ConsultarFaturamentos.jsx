import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import ApiService from '../../services/ApiService';
import './ConsultarFaturamentos.css';

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
            
            // Fator importante: não faça várias chamadas simultâneas que possam interferir uma na outra
            // Primeiro buscar todos os faturamentos
            const faturamentosDetalhados = await ApiService.consultarFaturamentos(filtros);
            console.log("Faturamentos recebidos:", faturamentosDetalhados);
            
            if (faturamentosDetalhados.length === 0) {
                setError('Nenhum faturamento encontrado com os filtros selecionados.');
                setFaturamentos([]);
                setLoading(false);
                return;
            }
            
            // Depois, buscar detalhes dos pedidos relacionados a esses faturamentos
            const pedidosFaturados = await ApiService.consultarPedidosFaturados(filtros);
            console.log("Pedidos faturados recebidos:", pedidosFaturados);
            
            // Combinar as informações
            const faturamentosCompletos = faturamentosDetalhados.map(faturamento => {
                // Encontrar o pedido correspondente
                const pedidoRelacionado = pedidosFaturados.find(
                    p => p.id.toString() === faturamento.numeroPedido.toString() && 
                         p.tipo === faturamento.tipoPedido
                );
                
                // Extrair nome do fornecedor do pedido relacionado
                let fornecedorNome = 'N/D';
                if (pedidoRelacionado && pedidoRelacionado.fornecedor) {
                    if (typeof pedidoRelacionado.fornecedor === 'object') {
                        fornecedorNome = pedidoRelacionado.fornecedor.nome || pedidoRelacionado.fornecedor.razao_social;
                    } else {
                        fornecedorNome = pedidoRelacionado.fornecedor;
                    }
                }
                
                // Usar valores do faturamento, complementando com os do pedido quando necessário
                return {
                    ...faturamento,
                    // Adicionar informações extras do pedido se disponíveis
                    cliente: pedidoRelacionado?.cliente || 'N/D',
                    fornecedor: fornecedorNome,
                    numero: pedidoRelacionado?.numero || `${faturamento.tipoPedido.toUpperCase().substring(0,1)}C-${faturamento.numeroPedido}`
                };
            });
            
            console.log("Faturamentos com dados combinados:", faturamentosCompletos);
            setFaturamentos(faturamentosCompletos);
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
                                            <th>Valor Total do Pedido</th>
                                            <th>Valor Faturado</th>
                                            <th>Valor a Faturar</th>
                                            <th>Data de Faturamento</th>
                                            <th>Data de Vencimento</th>
                                            <th>Método de Pagamento</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faturamentos.map((faturamento) => (
                                            <tr key={faturamento.id}>
                                                <td>{faturamento.numeroPedido || 'N/D'}</td>
                                                <td>{obterNomeTipoPedido(faturamento.tipoPedido)}</td>
                                                <td>{formatarValor(faturamento.valorTotal)}</td>
                                                <td>{formatarValor(faturamento.valorFaturado)}</td>
                                                <td>{formatarValor(faturamento.valorAFaturar)}</td>
                                                <td>{formatarData(faturamento.dataFaturamento)}</td>
                                                <td>{formatarData(faturamento.dataVencimento)}</td>
                                                <td>{faturamento.metodoPagamento || 'N/D'}</td>
                                                <td className="acoes-cell">
                                                    <button 
                                                        onClick={() => abrirDetalhes(faturamento)}
                                                        className="action-button view-button"
                                                        title="Ver detalhes"
                                                    >
                                                        Detalhes
                                                    </button>
                                                    
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
                                <h2>Detalhes do Faturamento</h2>
                                
                                <div className="detalhes-container">
                                    <div className="detalhes-item">
                                        <strong>Número do Pedido:</strong>
                                        <span>{visualizandoDetalhes.numeroPedido || 'N/D'}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Tipo de Pedido:</strong>
                                        <span>{obterNomeTipoPedido(visualizandoDetalhes.tipoPedido)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Valor Total do Pedido:</strong>
                                        <span>{formatarValor(visualizandoDetalhes.valorTotal)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Valor Faturado:</strong>
                                        <span>{formatarValor(visualizandoDetalhes.valorFaturado)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Valor a Faturar:</strong>
                                        <span>{formatarValor(visualizandoDetalhes.valorAFaturar)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Data de Faturamento:</strong>
                                        <span>{formatarData(visualizandoDetalhes.dataFaturamento)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Data de Vencimento:</strong>
                                        <span>{formatarData(visualizandoDetalhes.dataVencimento)}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Número da NF:</strong>
                                        <span>{visualizandoDetalhes.numeroNF || 'N/D'}</span>
                                    </div>
                                    
                                    <div className="detalhes-item">
                                        <strong>Método de Pagamento:</strong>
                                        <span>{visualizandoDetalhes.metodoPagamento || 'N/D'}</span>
                                    </div>
                                    
                                    {visualizandoDetalhes.metodoPagamento === 'boleto' && (
                                        <div className="detalhes-item">
                                            <strong>Código do Boleto:</strong>
                                            <span>{visualizandoDetalhes.codigoBoleto || 'N/D'}</span>
                                        </div>
                                    )}
                                    
                                    {(visualizandoDetalhes.metodoPagamento === 'pix' || visualizandoDetalhes.metodoPagamento === 'ted') && (
                                        <div className="detalhes-item">
                                            <strong>Dados da Conta:</strong>
                                            <span>{visualizandoDetalhes.dadosConta || 'N/D'}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="modal-buttons">
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