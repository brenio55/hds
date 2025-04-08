import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import ApiService from '../../services/ApiService';
import './ConsultarCentroCusto.css';

function ConsultarCentroCusto() {
    // Estados para controle de dados e UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [propostas, setPropostas] = useState([]);
    const [propostaId, setPropostaId] = useState('');
    const [centroCusto, setCentroCusto] = useState(null);

    // Carregar lista de propostas ao iniciar
    useEffect(() => {
        carregarPropostas();
    }, []);

    // Função para carregar propostas (centros de custo)
    const carregarPropostas = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ApiService.buscarPropostas();
            console.log('Propostas carregadas:', response);
            
            if (response && Array.isArray(response.propostas)) {
                setPropostas(response.propostas);
            } else if (Array.isArray(response)) {
                setPropostas(response);
            } else {
                console.warn('Formato de resposta inesperado:', response);
                setPropostas([]);
            }
        } catch (error) {
            console.error('Erro ao carregar propostas:', error);
            setError('Não foi possível carregar a lista de propostas.');
        } finally {
            setLoading(false);
        }
    };

    // Buscar dados do centro de custo selecionado
    const buscarDadosCentroCusto = async () => {
        if (!propostaId) {
            alert('Selecione um centro de custo');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const dados = await ApiService.buscarCentroCusto(propostaId);
            console.log('Dados do centro de custo:', dados);
            
            if (dados.erro) {
                setError(dados.mensagem || 'Erro ao buscar dados do centro de custo');
                setCentroCusto(null);
            } else {
                setCentroCusto(dados);
            }
        } catch (error) {
            console.error('Erro ao buscar centro de custo:', error);
            setError('Não foi possível carregar os dados do centro de custo selecionado.');
            setCentroCusto(null);
        } finally {
            setLoading(false);
        }
    };

    // Formatar valor monetário para exibição
    const formatarValor = (valor) => {
        if (!valor && valor !== 0) return 'R$ 0,00';
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    // Extrair descrição da proposta para exibição
    const getDescricaoProposta = (proposta) => {
        if (!proposta) return '';
        const cliente = proposta.client_info?.nome || proposta.client_info?.razao_social || 'Cliente não especificado';
        return `#${proposta.id} - ${cliente} - ${proposta.descricao || proposta.titulo || 'Sem descrição'}`;
    };

    // Calcular total de pedidos de um tipo
    const calcularTotalPedidos = (pedidos) => {
        if (!pedidos || !Array.isArray(pedidos)) return 0;
        return pedidos.length;
    };

    // Obter valor total de materiais em um pedido de compra
    const getValorTotalMaterial = (pedido) => {
        if (!pedido || !pedido.materiais) return 0;
        
        // Converter materiais para array se for string JSON
        let materiais = pedido.materiais;
        if (typeof materiais === 'string') {
            try {
                materiais = JSON.parse(materiais);
            } catch (error) {
                console.error('Erro ao parsear materiais:', error);
                materiais = [];
            }
        }
        
        // Se não for array, retorna 0
        if (!Array.isArray(materiais)) return 0;
        
        // Calcular soma dos valores totais
        return materiais.reduce((total, material) => {
            return total + parseFloat(material.valor_total || 0);
        }, 0);
    };

    // Obter valor total de um pedido de locação
    const getValorTotalLocacao = (pedido) => {
        return parseFloat(pedido.total_final || pedido.total_bruto || 0);
    };

    // Obter valor total de itens em um pedido de serviço
    const getValorTotalServico = (pedido) => {
        if (!pedido || !pedido.itens) return 0;
        
        // Converter itens para objeto se for string JSON
        let itens = pedido.itens;
        if (typeof itens === 'string') {
            try {
                itens = JSON.parse(itens);
            } catch (error) {
                console.error('Erro ao parsear itens:', error);
                itens = {};
            }
        }
        
        // Se é um array, somar os valores totais
        if (Array.isArray(itens)) {
            return itens.reduce((total, item) => {
                return total + parseFloat(item.valor_total || 0);
            }, 0);
        }
        
        // Se é um objeto com itens numerados como propriedades
        if (itens && typeof itens === 'object') {
            // Verificar se tem uma propriedade '0' com valor_total
            if (itens['0'] && itens['0'].valor_total) {
                return parseFloat(itens['0'].valor_total);
            }
            
            // Verificar se tem valor_total direto no objeto
            if (itens.valor_total) {
                return parseFloat(itens.valor_total);
            }
        }
        
        return 0;
    };

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="centro-custo-container">
                    <h1>Consulta de Centro de Custo</h1>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="filtro-container">
                        <div className="form-group">
                            <label>Selecione o Centro de Custo:</label>
                            <select 
                                value={propostaId} 
                                onChange={(e) => setPropostaId(e.target.value)}
                                className="select-proposta"
                            >
                                <option value="">Selecione...</option>
                                {propostas.map(proposta => (
                                    <option key={proposta.id} value={proposta.id}>
                                        {getDescricaoProposta(proposta)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            className="action-button"
                            onClick={buscarDadosCentroCusto}
                            disabled={loading || !propostaId}
                        >
                            {loading ? 'Carregando...' : 'Consultar'}
                        </button>
                    </div>
                    
                    {centroCusto && (
                        <div className="resultado-container">
                            <div className="resumo-box">
                                <h2>Resumo do Centro de Custo #{centroCusto.proposta_id}</h2>
                                
                                <div className="resumo-grid">
                                    <div className="resumo-item">
                                        <h3>Valor da Proposta</h3>
                                        <p className="valor">{formatarValor(centroCusto.valor_proposta)}</p>
                                    </div>
                                    
                                    <div className="resumo-item">
                                        <h3>Valor Total em Pedidos</h3>
                                        <p className="valor">{formatarValor(centroCusto.valor_somado)}</p>
                                    </div>
                                    
                                    <div className="resumo-item">
                                        <h3>Pedidos de Compra</h3>
                                        <p>
                                            <span className="contador">{calcularTotalPedidos(centroCusto.pedidos.compra)}</span>
                                            <span className="valor">{formatarValor(centroCusto.valor_pedidos.compra)}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="resumo-item">
                                        <h3>Pedidos de Locação</h3>
                                        <p>
                                            <span className="contador">{calcularTotalPedidos(centroCusto.pedidos.locacao)}</span>
                                            <span className="valor">{formatarValor(centroCusto.valor_pedidos.locacao)}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="resumo-item">
                                        <h3>Pedidos de Serviço</h3>
                                        <p>
                                            <span className="contador">{calcularTotalPedidos(centroCusto.pedidos.servico)}</span>
                                            <span className="valor">{formatarValor(centroCusto.valor_pedidos.servico)}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="resumo-item">
                                        <h3>Saldo</h3>
                                        <p className="valor">{formatarValor(parseFloat(centroCusto.valor_proposta) - centroCusto.valor_somado)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Seção de Pedidos de Compra */}
                            {centroCusto.pedidos.compra && centroCusto.pedidos.compra.length > 0 && (
                                <div className="pedidos-section">
                                    <h2>Pedidos de Compra</h2>
                                    <div className="table-container">
                                        <table className="itens-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Materiais</th>
                                                    <th>Valor Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {centroCusto.pedidos.compra.map(pedido => (
                                                    <tr key={`compra-${pedido.id}`}>
                                                        <td>{pedido.id}</td>
                                                        <td>
                                                            {Array.isArray(pedido.materiais) && pedido.materiais.length > 0 
                                                                ? pedido.materiais.map((material, idx) => (
                                                                    <div key={idx}>
                                                                        {material.descricao || 'Material'} (x{material.quantidade})
                                                                    </div>
                                                                ))
                                                                : 'Sem materiais detalhados'
                                                            }
                                                        </td>
                                                        <td>{formatarValor(getValorTotalMaterial(pedido))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            
                            {/* Seção de Pedidos de Locação */}
                            {centroCusto.pedidos.locacao && centroCusto.pedidos.locacao.length > 0 && (
                                <div className="pedidos-section">
                                    <h2>Pedidos de Locação</h2>
                                    <div className="table-container">
                                        <table className="itens-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Valor Bruto</th>
                                                    <th>Valor Final</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {centroCusto.pedidos.locacao.map(pedido => (
                                                    <tr key={`locacao-${pedido.id}`}>
                                                        <td>{pedido.id}</td>
                                                        <td>{formatarValor(pedido.total_bruto)}</td>
                                                        <td>{formatarValor(pedido.total_final)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            
                            {/* Seção de Pedidos de Serviço */}
                            {centroCusto.pedidos.servico && centroCusto.pedidos.servico.length > 0 && (
                                <div className="pedidos-section">
                                    <h2>Pedidos de Serviço</h2>
                                    <div className="table-container">
                                        <table className="itens-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Descrição</th>
                                                    <th>Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {centroCusto.pedidos.servico.map(pedido => (
                                                    <tr key={`servico-${pedido.id}`}>
                                                        <td>{pedido.id}</td>
                                                        <td>
                                                            {(() => {
                                                                if (!pedido.itens) return 'Sem descrição';
                                                                
                                                                // Se é um array, mostrar descrição do primeiro item
                                                                if (Array.isArray(pedido.itens) && pedido.itens.length > 0) {
                                                                    return pedido.itens[0].descricao || 'Serviço sem descrição';
                                                                }
                                                                
                                                                // Se é um objeto com itens como propriedades numeradas
                                                                if (typeof pedido.itens === 'object' && pedido.itens['0']) {
                                                                    return pedido.itens['0'].descricao || 'Serviço sem descrição';
                                                                }
                                                                
                                                                // Se é um objeto com descrição direta
                                                                if (typeof pedido.itens === 'object' && pedido.itens.descricao) {
                                                                    return pedido.itens.descricao;
                                                                }
                                                                
                                                                return 'Serviço sem descrição detalhada';
                                                            })()}
                                                        </td>
                                                        <td>{formatarValor(getValorTotalServico(pedido))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {loading && (
                        <div className="loading-message">
                            <p>Carregando dados, por favor aguarde...</p>
                        </div>
                    )}
                    
                    {!loading && !centroCusto && !error && (
                        <div className="instrucoes-message">
                            <p>Selecione um centro de custo para visualizar os dados detalhados.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ConsultarCentroCusto; 