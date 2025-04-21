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
    // Novos estados para a modal de resultado
    const [mostrarModalResultado, setMostrarModalResultado] = useState(false);
    const [resultadoFaturamento, setResultadoFaturamento] = useState({
        sucesso: false,
        pedidoInfo: null,
        mensagem: ''
    });

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
    
    // Verificar se há um ID de pedido na URL para pré-selecionar
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pedidoParam = urlParams.get('pedido');
        
        if (pedidoParam) {
            console.log(`Pedido recebido via URL: ${pedidoParam}`);
            setPedidoSelecionado(pedidoParam);
        }
    }, []);
    
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
            console.log("Carregando todos os pedidos ativos...");
            
            const response = await ApiService.buscarPedidosConsolidados();
            console.log("Pedidos consolidados recebidos:", response);
            
            if (response && Array.isArray(response.pedidos)) {
                // Filtrar apenas pedidos com status "ok"
                const pedidosAtivados = response.pedidos.filter(p => p.status === 'ok');
                console.log(`Total de pedidos ativos encontrados: ${pedidosAtivados.length}`);
                
                // Mapear para o formato esperado pelo componente
                const pedidosFormatados = pedidosAtivados.map(pedido => {
                    // Extrair nome do fornecedor se disponível
                    let fornecedorNome = 'Fornecedor não especificado';
                    if (pedido.fornecedor) {
                        fornecedorNome = typeof pedido.fornecedor === 'object' 
                            ? pedido.fornecedor.nome || pedido.fornecedor.razao_social
                            : pedido.fornecedor;
                    }
                    
                    // Determinar o tipo de pedido para o prefixo
                    let prefixo = '';
                    switch (pedido.tipo) {
                        case 'compra': prefixo = 'PC'; break;
                        case 'locacao': prefixo = 'PL'; break;
                        case 'servico': prefixo = 'PS'; break;
                        default: prefixo = 'P'; break;
                    }
                    
                    // Converter valores para números onde necessário
                    const valorTotal = typeof pedido.valor_total === 'string'
                        ? parseFloat(pedido.valor_total)
                        : parseFloat(pedido.valor_total || 0);
                    
                    // Criar descrição significativa com os dados disponíveis
                    let descricao = '';
                    if (pedido.proposta && pedido.proposta.descricao) {
                        descricao = pedido.proposta.descricao;
                    } else {
                        descricao = `Pedido de ${pedido.tipo} para ${fornecedorNome}`;
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
                        numero: `${prefixo}-${pedido.id}`,
                        descricao: `${descricao}${dataFormatada}`,
                        tipo: pedido.tipo,
                        valor_total: valorTotal,
                        valor_faturado: typeof pedido.valor_faturado === 'string'
                            ? parseFloat(pedido.valor_faturado)
                            : parseFloat(pedido.valor_faturado || 0),
                        valor_a_faturar: typeof pedido.valor_a_faturar === 'string'
                            ? parseFloat(pedido.valor_a_faturar)
                            : parseFloat(pedido.valor_a_faturar || 0),
                        status: pedido.status,
                        fornecedor: fornecedorNome,
                        data: pedido.data,
                        data_vencimento: pedido.data_vencimento
                    };
                });
                
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
            
            // Encontrar o pedido nos pedidos já carregados
            const pedidoEncontrado = pedidosAtivos.find(p => p.id.toString() === pedidoId.toString());
            
            if (!pedidoEncontrado) {
                console.error("Pedido não encontrado nos pedidos ativos");
                setError("Pedido não encontrado ou indisponível");
                setValorTotal(0);
                setValorFaturado(0);
                setPorcentagemFaturada(0);
                setNovoValorFaturamento('');
                setLoading(false);
                return;
            }
            
            console.log("Usando dados do pedido já carregado:", pedidoEncontrado);
            
            // Usar o valor total já disponível no pedido
            const valorTotalPedido = pedidoEncontrado.valor_total;
            console.log(`Valor total do pedido: ${valorTotalPedido}`);
            setValorTotal(valorTotalPedido);
            
            // Usar valor faturado já disponível no pedido
            const totalFaturado = pedidoEncontrado.valor_faturado;
            console.log(`Valor já faturado do pedido: ${totalFaturado}`);
            setValorFaturado(totalFaturado);
            
            // Calcular porcentagem faturada
            if (valorTotalPedido > 0) {
                const porcentagem = (totalFaturado / valorTotalPedido) * 100;
                setPorcentagemFaturada(Math.min(porcentagem, 100).toFixed(2));
            } else {
                setPorcentagemFaturada(0);
            }
            
            // Usar valor a faturar já disponível no pedido
            const valorRestante = pedidoEncontrado.valor_a_faturar;
            if (valorRestante > 0) {
                setNovoValorFaturamento(valorRestante.toFixed(2));
            } else {
                setNovoValorFaturamento('');
            }
            
            setError(null);
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
        return valor.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1$2$3');
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

    const formatarData = (data) => {
        if (!data) return '';
        try {
            return new Date(data).toLocaleDateString('pt-BR');
        } catch (e) {
            console.error('Erro ao formatar data:', e);
            return '';
        }
    };

    // Função para fechar a modal de resultado
    const fecharModalResultado = () => {
        setMostrarModalResultado(false);
    };

    // Função para navegar para a tela de consulta de faturamentos
    const navegarParaConsultarFaturamentos = () => {
        window.location.href = '/admin/consultarFaturamentos';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pedidoSelecionado) {
            setError('Selecione um pedido válido para faturar');
            return;
        }

        // Encontrar o pedido selecionado nos pedidos ativos
        const pedido = pedidosAtivos.find(p => p.id.toString() === pedidoSelecionado.toString());
        if (!pedido) {
            setError('Pedido selecionado inválido');
            return;
        }

        // Verificar se o valor de faturamento é válido
        let valorFaturamentoNumerico = 0;
        
        try {
            // Normalizar o valor (substituir vírgulas por pontos para parsing)
            valorFaturamentoNumerico = parseFloat(novoValorFaturamento.replace(',', '.'));
            
            if (isNaN(valorFaturamentoNumerico) || valorFaturamentoNumerico <= 0) {
                setError('Informe um valor de faturamento válido');
                return;
            }
        } catch (e) {
            setError('Formato de valor inválido');
            return;
        }

        // Calcular valor restante disponível para faturamento
        const valorRestante = valorTotal - valorFaturado;
        
        // Verificar se o valor de faturamento excede o valor restante
        if (valorFaturamentoNumerico > valorRestante) {
            setError(`O valor de faturamento (${valorFaturamentoNumerico.toLocaleString('pt-BR', {
                style: 'currency', 
                currency: 'BRL'
            })}) não pode exceder o valor restante disponível (${valorRestante.toLocaleString('pt-BR', {
                style: 'currency', 
                currency: 'BRL'
            })})`);
            return;
        }

        if (!metodoPagamento) {
            setError('Selecione um método de pagamento');
            return;
        }

        if (metodoPagamento === 'boleto' && !numeroBoleto) {
            setError('O número do boleto é obrigatório');
            return;
        }

        if ((metodoPagamento === 'pix' || metodoPagamento === 'ted') && !dadosConta) {
            setError('Os dados da conta são obrigatórios');
            return;
        }

        if (!dataVencimento) {
            setError('Informe a data de vencimento');
            return;
        }

        if (!numeroNF) {
            setError('O número da NF é obrigatório');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setMensagemSucesso('');
            
            // Preparar os dados do faturamento
            const formData = new FormData();
            
            // Informações básicas do pedido
            formData.append('pedidoId', pedidoSelecionado);
            formData.append('tipoPedido', pedido.tipo);
            
            // Informações financeiras 
            // Valor total do pedido agora é necessário para o cálculo de valor_a_faturar no backend
            formData.append('valorTotal', valorTotal);
            formData.append('valorFaturamento', valorFaturamentoNumerico.toString());
            
            // Informações da NF
            formData.append('dataVencimento', dataVencimento);
            formData.append('numeroNF', numeroNF);
            
            // Método de pagamento e dados relacionados
            formData.append('metodoPagamento', metodoPagamento);
            
            if (metodoPagamento === 'boleto') {
                formData.append('numeroBoleto', numeroBoleto);
                if (arquivoBoleto) formData.append('arquivoBoleto', arquivoBoleto);
            } else if (metodoPagamento === 'pix' || metodoPagamento === 'ted') {
                formData.append('dadosConta', dadosConta);
            }
    
            if (arquivoNF) formData.append('arquivoNF', arquivoNF);
    
            console.log(`Enviando dados de faturamento para pedido ${pedido.numero} (tipo: ${pedido.tipo})...`);
            console.log(`Valor a faturar: ${valorFaturamentoNumerico}`);
            
            const resultado = await ApiService.faturarPedidoCompra(formData);
            
            console.log("Faturamento registrado com sucesso:", resultado);
            
            // Configurar os dados de sucesso para a modal
            setResultadoFaturamento({
                sucesso: true,
                pedidoInfo: {
                    id: pedido.id,
                    numero: pedido.numero,
                    tipo: pedido.tipo,
                    fornecedor: pedido.fornecedor,
                    valorFaturado: valorFaturamentoNumerico
                },
                mensagem: 'Faturamento registrado com sucesso!'
            });
            
            // Exibir a modal
            setMostrarModalResultado(true);
            
            // Manter a mensagem de sucesso para backup
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
            // Extrair a mensagem de erro mais específica
            let mensagemErro = error.message || 'Tente novamente.';
            // Remover prefixos técnicos para mensagem mais limpa
            mensagemErro = mensagemErro.replace('Error: Erro ao faturar pedido: ', '');
            
            // Configurar os dados de erro para a modal
            setResultadoFaturamento({
                sucesso: false,
                pedidoInfo: pedido ? {
                    id: pedido.id,
                    numero: pedido.numero,
                    tipo: pedido.tipo,
                    fornecedor: pedido.fornecedor
                } : null,
                mensagem: 'Erro ao registrar faturamento: ' + mensagemErro
            });
            
            // Exibir a modal
            setMostrarModalResultado(true);
            
            // Manter mensagem de erro para backup
            setError('Erro ao registrar faturamento: ' + mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-container">
                    <div className="tabs-navigation">
                        <div className="tab active">Faturar Pedido</div>
                        <div className="tab" onClick={() => window.location.href = '/admin/consultarFaturamentos'}>
                            Consultar Faturamentos
                        </div>
                    </div>
                    
                    <h1>FATURAR PEDIDO</h1>
                    
                    {error && <div className="error-message">{error}</div>}
                    {mensagemSucesso && <div className="success-message">{mensagemSucesso}</div>}
                    
                    <form onSubmit={handleSubmit} className="pedido-form">
                        <div className="form-group full-width">
                            <label>BUSCAR PEDIDO</label>
                            <input 
                                type="text"
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                placeholder="Digite o número, fornecedor ou descrição"
                                className="search-input"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group full-width">
                            <label>SELECIONE O PEDIDO PARA FATURAR</label>
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
                                        <option key={pedido.id} value={pedido.id} className={`pedido-tipo-${pedido.tipo}`}>
                                            {pedido.numero} | {pedido.fornecedor} | {pedido.descricao}
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
                                {pedidosFiltrados.length > 0 && 
                                    `${pedidosFiltrados.length} pedido(s) encontrado(s) | Compra: ${pedidosFiltrados.filter(p => p.tipo === 'compra').length} | 
                                    Locação: ${pedidosFiltrados.filter(p => p.tipo === 'locacao').length} | 
                                    Serviço: ${pedidosFiltrados.filter(p => p.tipo === 'servico').length}`
                                }
                            </p>
                        </div>

                        <div className="form-group">
                            <label>VALOR TOTAL DO PEDIDO</label>
                            <input 
                                type="text" 
                                value={formatarValor(valorTotal)} 
                                disabled 
                                className="input-valor-readonly"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>VALOR JÁ FATURADO</label>
                            <input 
                                type="text" 
                                value={formatarValor(valorFaturado)} 
                                disabled 
                                className="input-valor-readonly"
                            />
                            <small>{porcentagemFaturada}% do valor total já faturado</small>
                        </div>

                        <div className="form-group">
                            <label>VALOR DISPONÍVEL PARA FATURAMENTO</label>
                            <input 
                                type="text" 
                                value={formatarValor(Math.max(0, valorTotal - valorFaturado))} 
                                disabled 
                                className="input-valor-readonly valor-disponivel"
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
                            <div className="form-group full-width">
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

            {/* Modal de Resultado do Faturamento */}
            {mostrarModalResultado && (
                <div className="modal-overlay">
                    <div className={`modal-resultado ${resultadoFaturamento.sucesso ? 'sucesso' : 'erro'}`}>
                        <div className="modal-header">
                            <h3>{resultadoFaturamento.sucesso ? 'Faturamento Concluído' : 'Erro no Faturamento'}</h3>
                        </div>
                        
                        <div className="modal-body">
                            {resultadoFaturamento.pedidoInfo && (
                                <div className="pedido-info">
                                    <p><strong>Pedido:</strong> {resultadoFaturamento.pedidoInfo.numero}</p>
                                    <p><strong>Tipo:</strong> {resultadoFaturamento.pedidoInfo.tipo === 'compra' 
                                        ? 'Pedido de Compra' 
                                        : resultadoFaturamento.pedidoInfo.tipo === 'locacao' 
                                            ? 'Pedido de Locação' 
                                            : 'Pedido de Serviço'}</p>
                                    <p><strong>Fornecedor:</strong> {resultadoFaturamento.pedidoInfo.fornecedor}</p>
                                    {resultadoFaturamento.sucesso && resultadoFaturamento.pedidoInfo.valorFaturado && (
                                        <p><strong>Valor Faturado:</strong> {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(resultadoFaturamento.pedidoInfo.valorFaturado)}</p>
                                    )}
                                </div>
                            )}
                            
                            <div className="mensagem">
                                <p>{resultadoFaturamento.mensagem}</p>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                onClick={fecharModalResultado}
                                className="btn-fechar"
                            >
                                FECHAR
                            </button>
                            
                            <button 
                                onClick={navegarParaConsultarFaturamentos}
                                className="btn-consultar"
                            >
                                CONSULTAR FATURAMENTOS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default FaturarPedido; 