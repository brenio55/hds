import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import ApiService from '../../services/ApiService';

function FaturarPedido() {
    const [pedidoSelecionado, setPedidoSelecionado] = useState('');
    const [pedidosAtivos, setPedidosAtivos] = useState([]);
    const [valorTotal, setValorTotal] = useState(0);
    const [valorFaturado, setValorFaturado] = useState('<VALOR>');
    const [novoValorFaturamento, setNovoValorFaturamento] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [numeroNF, setNumeroNF] = useState('');
    const [arquivoNF, setArquivoNF] = useState(null);
    const [numeroBoleto, setNumeroBoleto] = useState('');
    const [arquivoBoleto, setArquivoBoleto] = useState(null);
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [dadosConta, setDadosConta] = useState('');
    const [porcentagemFaturada, setPorcentagemFaturada] = useState(0);

    useEffect(() => {
        carregarPedidosAtivos();
    }, []);

    const carregarPedidosAtivos = async () => {
        try {
            const pedidos = await ApiService.consultarPedidos();
            setPedidosAtivos(pedidos.filter(p => p.tipo === 'compra' && p.status === 'ativo'));
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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

        try {
            await ApiService.faturarPedidoCompra(formData);
            alert('Faturamento registrado com sucesso!');
            // Limpar formulário ou redirecionar
        } catch (error) {
            console.error('Erro ao registrar faturamento:', error);
            alert('Erro ao registrar faturamento. Tente novamente.');
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-container">
                    <h1>FATURAR PEDIDO DE COMPRA</h1>
                    <form onSubmit={handleSubmit} className="pedido-form">
                        <div className="form-group" style={{gridColumn: 'span 2'}}>
                            <label>SELECIONE O PEDIDO DE COMPRA</label>
                            <select 
                                value={pedidoSelecionado} 
                                onChange={(e) => setPedidoSelecionado(e.target.value)}
                                required
                            >
                                <option value="">Selecione um pedido...</option>
                                {pedidosAtivos.map(pedido => (
                                    <option key={pedido.id} value={pedido.id}>
                                        {pedido.numero} - {pedido.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>VALOR TOTAL DO PEDIDO</label>
                            <input type="text" value={valorTotal} disabled />
                        </div>

                        <div className="form-group">
                            <label>VALOR JÁ FATURADO ({porcentagemFaturada}%)</label>
                            <input type="text" value={valorFaturado} disabled />
                        </div>

                        <div className="form-group">
                            <label>VALOR A FATURAR</label>
                            <input 
                                type="number" 
                                value={novoValorFaturamento}
                                onChange={(e) => setNovoValorFaturamento(e.target.value)}
                                placeholder="Digite o valor líquido"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>DATA DE VENCIMENTO</label>
                            <input 
                                type="date" 
                                value={dataVencimento}
                                onChange={(e) => setDataVencimento(e.target.value)}
                                required
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
                            />
                        </div>

                        <div className="form-group">
                            <label>ANEXAR NF (OPCIONAL)</label>
                            <input 
                                type="file" 
                                onChange={(e) => setArquivoNF(e.target.files[0])}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        <div className="form-group" style={{gridColumn: 'span 2'}}>
                            <label>MÉTODO DE PAGAMENTO</label>
                            <select 
                                value={metodoPagamento}
                                onChange={(e) => setMetodoPagamento(e.target.value)}
                                required
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
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ANEXAR BOLETO</label>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setArquivoBoleto(e.target.files[0])}
                                        accept=".pdf"
                                        required
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
                                />
                            </div>
                        )}

                        <button type="submit">REGISTRAR FATURAMENTO</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default FaturarPedido; 