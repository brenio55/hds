import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import ApiService from '../../services/ApiService';
import './FaturarPedido.css';

function FaturarPedido() {
    const [pedidoSelecionado, setPedidoSelecionado] = useState('');
    const [pedidosAtivos, setPedidosAtivos] = useState([]);
    const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [valorTotal, setValorTotal] = useState(0);
    const [valorFaturado, setValorFaturado] = useState(0);
    const [novoValorFaturamento, setNovoValorFaturamento] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [numeroNF, setNumeroNF] = useState('');
    const [arquivoNF, setArquivoNF] = useState(null);
    const [numeroBoleto, setNumeroBoleto] = useState('');
    const [arquivoBoleto, setArquivoBoleto] = useState(null);
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [dadosConta, setDadosConta] = useState('');
    const [porcentagemFaturada, setPorcentagemFaturada] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    useEffect(() => {
        carregarPedidosAtivos();
    }, []);

    useEffect(() => {
        if (pedidoSelecionado) {
            carregarDetalhesPedido(pedidoSelecionado);
        } else {
            // Reseta valores quando nenhum pedido está selecionado
            setValorTotal(0);
            setValorFaturado(0);
            setPorcentagemFaturada(0);
            setNovoValorFaturamento('');
        }
    }, [pedidoSelecionado]);
    
    // Filtrar pedidos quando o termo de busca mudar
    useEffect(() => {
        filtrarPedidos();
    }, [termoBusca, pedidosAtivos]);
    
    // Função para filtrar pedidos baseado no termo de busca
    const filtrarPedidos = () => {
        if (!termoBusca.trim()) {
            // Se não houver termo de busca, mostrar todos os pedidos ativos
            setPedidosFiltrados(pedidosAtivos);
            return;
        }
        
        const termo = termoBusca.toLowerCase();
        
        // Filtrar pedidos que contêm o termo na descrição, número, ID ou fornecedor
        const filtrados = pedidosAtivos.filter(pedido => 
            (pedido.numero && pedido.numero.toString().toLowerCase().includes(termo)) ||
            (pedido.descricao && pedido.descricao.toLowerCase().includes(termo)) ||
            (pedido.id && pedido.id.toString().toLowerCase().includes(termo)) ||
            (pedido.fornecedor && pedido.fornecedor.toLowerCase().includes(termo))
        );
        
        console.log(`Filtro aplicado com termo "${termo}": ${filtrados.length} resultados`);
        setPedidosFiltrados(filtrados);
    };

    const carregarPedidosAtivos = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Carregando pedidos ativos...");
            
            const response = await ApiService.buscarPedidosConsolidados();
            console.log("Pedidos consolidados recebidos:", response);
            
            if (response && Array.isArray(response.pedidos)) {
                // Filtrar apenas pedidos de compra com status "ok"
                const pedidosCompra = response.pedidos.filter(p => 
                    p.tipo === 'compra' && p.status === 'ok'
                );
                
                // Mapear para o formato esperado pelo componente
                const pedidosFormatados = pedidosCompra.map(pedido => {
                    // Extrair nome do fornecedor se disponível
                    const fornecedorNome = pedido.fornecedor ? pedido.fornecedor.nome : 'Fornecedor não especificado';
                    
                    // Criar descrição significativa com os dados disponíveis
                    let descricao = '';
                    if (pedido.proposta && pedido.proposta.descricao) {
                        descricao = pedido.proposta.descricao;
                    } else {
                        descricao = `Pedido para ${fornecedorNome}`;
                    }
                    
                    // Formatar data se disponível
                    let dataFormatada = '';
                    if (pedido.data_vencimento) {
                        try {
                            dataFormatada = ` - Venc: ${new Date(pedido.data_vencimento).toLocaleDateString('pt-BR')}`;
                        } catch (e) {
                            console.error("Erro ao formatar data:", e);
                        }
                    }
                    
                    return {
                        id: pedido.id,
                        numero: `PC-${pedido.id}`,
                        descricao: `${descricao}${dataFormatada}`,
                        valor_total: pedido.valor_total || 0,
                        status: pedido.status,
                        fornecedor: fornecedorNome,
                        data: pedido.data
                    };
                });
                
                console.log(`${pedidosFormatados.length} pedidos de compra ativos encontrados:`, pedidosFormatados);
                setPedidosAtivos(pedidosFormatados);
                setPedidosFiltrados(pedidosFormatados);
                setError(null);
            } else {
                console.error("A resposta da API não contém um array de pedidos:", response);
                setPedidosAtivos([]);
                setPedidosFiltrados([]);
                setError("Erro ao carregar pedidos: formato de resposta inválido");
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            setError("Erro ao carregar pedidos. Por favor, tente novamente.");
            setPedidosAtivos([]);
            setPedidosFiltrados([]);
        } finally {
            setLoading(false);
        }
    };

    const carregarDetalhesPedido = async (pedidoId) => {
        try {
            setLoading(true);
            console.log(`Carregando detalhes do pedido ${pedidoId}...`);
            
            // Buscar detalhes do pedido para obter valor total
            const pedido = await ApiService.buscarPedidoCompraPorId(pedidoId);
            console.log("Detalhes do pedido:", pedido);
            
            if (pedido) {
                const valorTotalPedido = parseFloat(pedido.valor_total) || 0;
                setValorTotal(valorTotalPedido);
                
                // Buscar faturamentos existentes para este pedido
                const faturamentos = await ApiService.consultarFaturamentos({ 
                    tipo: 'compra',
                    numeroPedido: pedidoId 
                });
                
                console.log("Faturamentos para este pedido:", faturamentos);
                
                // Calcular valor já faturado
                const totalFaturado = faturamentos.reduce(
                    (total, fat) => total + parseFloat(fat.valorFaturado || 0), 
                    0
                );
                
                setValorFaturado(totalFaturado);
                
                // Calcular porcentagem faturada
                if (valorTotalPedido > 0) {
                    const porcentagem = (totalFaturado / valorTotalPedido) * 100;
                    setPorcentagemFaturada(Math.min(porcentagem, 100).toFixed(2));
                } else {
                    setPorcentagemFaturada(0);
                }
                
                // Sugerir valor restante para faturamento
                const valorRestante = valorTotalPedido - totalFaturado;
                if (valorRestante > 0) {
                    setNovoValorFaturamento(valorRestante.toFixed(2));
                } else {
                    setNovoValorFaturamento('');
                }
                
                setError(null);
            } else {
                console.error("Pedido não encontrado");
                setError("Pedido não encontrado ou indisponível");
                setValorTotal(0);
                setValorFaturado(0);
                setPorcentagemFaturada(0);
                setNovoValorFaturamento('');
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do pedido:', error);
            setError("Erro ao carregar detalhes do pedido");
            setValorTotal(0);
            setValorFaturado(0);
            setPorcentagemFaturada(0);
            setNovoValorFaturamento('');
        } finally {
            setLoading(false);
        }
    };

    const formatarNF = (valor) => {
        // Formato padrão NF: 999.999.999
        return valor.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    };

    const formatarBoleto = (valor) => {
        // Formato básico de boleto (simplificado)
        return valor.replace(/\D/g, '').replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})/, '$1.$2.$3.$4.$5');
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);
            setMensagemSucesso('');
            
            // Validações básicas
            if (!pedidoSelecionado) {
                setError("Selecione um pedido para faturar");
                return;
            }
            
            if (!novoValorFaturamento || parseFloat(novoValorFaturamento) <= 0) {
                setError("O valor a faturar deve ser maior que zero");
                return;
            }
            
            if (!dataVencimento) {
                setError("A data de vencimento é obrigatória");
                return;
            }
            
            if (!numeroNF) {
                setError("O número da NF é obrigatório");
                return;
            }
            
            if (!metodoPagamento) {
                setError("Selecione um método de pagamento");
                return;
            }
            
            if (metodoPagamento === 'boleto' && !numeroBoleto) {
                setError("O número do boleto é obrigatório");
                return;
            }
            
            if ((metodoPagamento === 'pix' || metodoPagamento === 'ted') && !dadosConta) {
                setError("Os dados da conta são obrigatórios");
                return;
            }
            
            const formData = new FormData();
            formData.append('pedidoId', pedidoSelecionado);
            formData.append('valorFaturamento', novoValorFaturamento);
            formData.append('dataVencimento', dataVencimento);
            formData.append('numeroNF', numeroNF);
            formData.append('metodoPagamento', metodoPagamento);
            
            if (metodoPagamento === 'boleto') {
                formData.append('numeroBoleto', numeroBoleto);
                if (arquivoBoleto) formData.append('arquivoBoleto', arquivoBoleto);
            } else if (metodoPagamento === 'pix' || metodoPagamento === 'ted') {
                formData.append('dadosConta', dadosConta);
            }
    
            if (arquivoNF) formData.append('arquivoNF', arquivoNF);
    
            console.log("Enviando dados de faturamento...");
            await ApiService.faturarPedidoCompra(formData);
            
            console.log("Faturamento registrado com sucesso!");
            setMensagemSucesso('Faturamento registrado com sucesso!');
            
            // Limpar formulário
            setPedidoSelecionado('');
            setNovoValorFaturamento('');
            setDataVencimento('');
            setNumeroNF('');
            setArquivoNF(null);
            setNumeroBoleto('');
            setArquivoBoleto(null);
            setMetodoPagamento('');
            setDadosConta('');
            
            // Recarregar pedidos ativos
            carregarPedidosAtivos();
        } catch (error) {
            console.error('Erro ao registrar faturamento:', error);
            setError('Erro ao registrar faturamento: ' + (error.message || 'Tente novamente.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-container">
                    <h1>FATURAR PEDIDO DE COMPRA</h1>
                    
                    {error && <div className="error-message">{error}</div>}
                    {mensagemSucesso && <div className="success-message">{mensagemSucesso}</div>}
                    
                    <form onSubmit={handleSubmit} className="pedido-form">
                        <div className="form-group" style={{gridColumn: 'span 2'}}>
                            <label>BUSCAR PEDIDO DE COMPRA</label>
                            <input 
                                type="text"
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                placeholder="Digite o número ou descrição do pedido"
                                className="search-input"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group" style={{gridColumn: 'span 2'}}>
                            <label>SELECIONE O PEDIDO DE COMPRA</label>
                            <select 
                                value={pedidoSelecionado} 
                                onChange={(e) => {
                                    console.log(`Pedido selecionado: ID=${e.target.value}`);
                                    setPedidoSelecionado(e.target.value);
                                }}
                                required
                                disabled={loading}
                            >
                                <option value="">Selecione um pedido...</option>
                                {pedidosFiltrados && pedidosFiltrados.length > 0 ? (
                                    pedidosFiltrados.map(pedido => (
                                        <option key={pedido.id} value={pedido.id}>
                                            {pedido.numero} - {pedido.fornecedor ? `${pedido.fornecedor} - ` : ''}{pedido.descricao || 'Sem descrição'}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Nenhum pedido disponível</option>
                                )}
                            </select>
                            {pedidosFiltrados.length === 0 && !loading && (
                                <p className="no-results-message">
                                    {termoBusca ? 
                                        'Nenhum pedido encontrado com este termo' : 
                                        'Nenhum pedido ativo disponível'
                                    }
                                </p>
                            )}
                            <p className="info-message">
                                {pedidosFiltrados.length > 0 && `${pedidosFiltrados.length} pedido(s) encontrado(s)`}
                            </p>
                        </div>

                        <div className="form-group">
                            <label>VALOR TOTAL DO PEDIDO</label>
                            <input 
                                type="text" 
                                value={formatarValor(valorTotal)} 
                                disabled 
                                className="read-only-field"
                            />
                        </div>

                        <div className="form-group">
                            <label>VALOR JÁ FATURADO ({porcentagemFaturada}%)</label>
                            <input 
                                type="text" 
                                value={formatarValor(valorFaturado)} 
                                disabled 
                                className="read-only-field"
                            />
                        </div>

                        <div className="form-group">
                            <label>VALOR A FATURAR</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={novoValorFaturamento}
                                onChange={(e) => setNovoValorFaturamento(e.target.value)}
                                placeholder="Digite o valor líquido"
                                required
                                disabled={loading || !pedidoSelecionado}
                            />
                        </div>

                        <div className="form-group">
                            <label>DATA DE VENCIMENTO</label>
                            <input 
                                type="date" 
                                value={dataVencimento}
                                onChange={(e) => setDataVencimento(e.target.value)}
                                required
                                disabled={loading || !pedidoSelecionado}
                            />
                        </div>

                        <div className="form-group">
                            <label>NÚMERO DA NF</label>
                            <input 
                                type="text" 
                                value={numeroNF}
                                onChange={(e) => setNumeroNF(formatarNF(e.target.value))}
                                placeholder="000.000.000"
                                required
                                disabled={loading || !pedidoSelecionado}
                            />
                        </div>

                        <div className="form-group">
                            <label>ANEXAR NF (OPCIONAL)</label>
                            <input 
                                type="file" 
                                onChange={(e) => setArquivoNF(e.target.files[0])}
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={loading || !pedidoSelecionado}
                            />
                        </div>

                        <div className="form-group" style={{gridColumn: 'span 2'}}>
                            <label>MÉTODO DE PAGAMENTO</label>
                            <select 
                                value={metodoPagamento}
                                onChange={(e) => setMetodoPagamento(e.target.value)}
                                required
                                disabled={loading || !pedidoSelecionado}
                            >
                                <option value="">Selecione o método...</option>
                                <option value="boleto">Boleto</option>
                                <option value="pix">PIX</option>
                                <option value="ted">TED</option>
                            </select>
                        </div>

                        {metodoPagamento === 'boleto' && (
                            <>
                                <div className="form-group">
                                    <label>NÚMERO DO BOLETO</label>
                                    <input 
                                        type="text" 
                                        value={numeroBoleto}
                                        onChange={(e) => setNumeroBoleto(formatarBoleto(e.target.value))}
                                        placeholder="00000.00000.00000.000000.00000"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ANEXAR BOLETO</label>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setArquivoBoleto(e.target.files[0])}
                                        accept=".pdf"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}

                        {(metodoPagamento === 'pix' || metodoPagamento === 'ted') && (
                            <div className="form-group" style={{gridColumn: 'span 2'}}>
                                <label>DADOS DA CONTA</label>
                                <input 
                                    type="text" 
                                    value={dadosConta}
                                    onChange={(e) => setDadosConta(e.target.value)}
                                    placeholder="Digite os dados da conta"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading || !pedidoSelecionado}
                        >
                            {loading ? 'PROCESSANDO...' : 'REGISTRAR FATURAMENTO'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default FaturarPedido; 