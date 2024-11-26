import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { preencherPedidoCompra } from '../utils/pdfHandler';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { formatCNPJ, formatCEP, formatTelefone } from '../utils/formatters';

import HeaderAdmin from './HeaderAdmin';

function PedidosDeCompra() {
    const navigate = useNavigate();
    const [itens, setItens] = useState([]);
    const [itemAtual, setItemAtual] = useState({
        item: '',
        descricao: '',
        unidade: '',
        quantidade: '',
        ipi: '',
        valorUnitario: '',
        valorTotal: '',
        desconto: '',
        previsaoEntrega: '',
    });
    const [minDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    });
    const [cnpj, setCnpj] = useState('');
    const [cep, setCep] = useState('');
    const [contato, setContato] = useState('');
    const [devMode, setDevMode] = useState(false);

    const dadosTeste = {
        codigo: '001',
        fornecedor: 'Empresa Teste LTDA',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua Teste, 123',
        cep: '12345-678',
        contato: '(11) 9 9999-9999',
        pedido: '0123456789',
        dataVencto: new Date().toISOString().split('T')[0],
        condPagto: '30DDL',
        centroCusto: 'TESTE'
    };

    const itemTeste = {
        item: 'ITEM001',
        descricao: 'Material de Teste',
        unidade: 'UN',
        quantidade: '10',
        ipi: '10',
        valorUnitario: '100',
        valorTotal: '1000',
        desconto: '5',
        previsaoEntrega: new Date().toISOString().split('T')[0]
    };

    useEffect(() => {
        if (devMode) {
            setCnpj(dadosTeste.cnpj);
            setCep(dadosTeste.cep);
            setContato(dadosTeste.contato);
            setItemAtual(itemTeste);
        } else {
            setCnpj('');
            setCep('');
            setContato('');
            setItemAtual({
                item: '',
                descricao: '',
                unidade: '',
                quantidade: '',
                ipi: '',
                valorUnitario: '',
                valorTotal: '',
                desconto: '',
                previsaoEntrega: '',
            });
        }
    }, [devMode]);

    const handleInputChange = (e) => {
        if (devMode) {
            // No devMode, não alteramos os valores
            return;
        }
        
        const { name, value } = e.target;
        setItemAtual(prev => ({
            ...prev,
            [name]: value,
            valorTotal: name === 'quantidade' || name === 'valorUnitario' ?
                (prev.quantidade && prev.valorUnitario ? 
                    (parseFloat(prev.quantidade) * parseFloat(prev.valorUnitario)).toFixed(2) : '') :
                prev.valorTotal
        }));
    };

    const handleAddItem = () => {
        if (devMode) {
            setItens(prev => [...prev, itemTeste]);
        } else {
            setItens(prev => [...prev, itemAtual]);
        }
        
        setItemAtual({
            item: '',
            descricao: '',
            unidade: '',
            quantidade: '',
            ipi: '',
            valorUnitario: '',
            valorTotal: '',
            desconto: '',
            previsaoEntrega: '',
        });
    };

    const handleEditItem = (index) => {
        setItemAtual(itens[index]);
        setItens((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDeleteItem = (index) => {
        setItens((prev) => prev.filter((_, i) => i !== index));
    };

    const handleGenerateBuyRequest = () => {
        const pedidosDeCompraRequest = {
            itens: [...itens],
        };
        console.log('Pedido de Compra Gerado:', JSON.stringify(pedidosDeCompraRequest, null, 2));
        alert('Pedido de compra gerado com sucesso! Confira o console.');
    };

    const formatarData = (data) => {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleCNPJChange = (e) => {
        if (devMode) return;
        const formatted = formatCNPJ(e.target.value);
        setCnpj(formatted);
    };

    const handleCEPChange = (e) => {
        if (devMode) return;
        const formatted = formatCEP(e.target.value);
        setCep(formatted);
    };

    const handleContatoChange = (e) => {
        if (devMode) return;
        const formatted = formatTelefone(e.target.value);
        setContato(formatted);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const formData = {
            codigo: event.target.codigo.value,
            fornecedor: event.target.fornecedor.value,
            cnpj: cnpj,
            endereco: event.target.endereco.value,
            cep: cep,
            contato: contato,
            pedido: event.target.pedido.value,
            dataVencto: formatarData(event.target.dataVencto.value),
            condPagto: event.target.condPagto.value,
            centroCusto: event.target.centroCusto.value
        };

        console.log('Dados do formulário:', formData);
        console.log('Itens:', itens);

        try {
            // Gera o PDF e obtém a URL do blob
            const pdfUrl = await preencherPedidoCompra(formData, itens);
            
            console.log('PDF URL recebida:', pdfUrl);

            // Navega para a página de preview com a URL do PDF
            navigate('/pedido-gerado', { 
                state: { 
                    pedidoData: formData,
                    pdfUrl: pdfUrl
                }
            });
        } catch (error) {
            console.error('Erro ao gerar pedido:', error);
            alert('Erro ao gerar o pedido. Por favor, tente novamente.');
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="dev-mode-toggle">
                <button 
                    onClick={() => setDevMode(!devMode)}
                    className={`dev-mode-button ${devMode ? 'active' : ''}`}
                >
                    Dev Mode: {devMode ? 'ON' : 'OFF'}
                </button>
            </div>
            <div className="admin-container pedidosDeCompra">
                <div className="pedido-wrapper">
                    <div className="pedido-container">
                        <h1>Pedido de Compra de Material</h1>
                        <form className="pedido-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Código:</label>
                                <input 
                                    type="text" 
                                    name="codigo" 
                                    placeholder="00" 
                                    defaultValue={devMode ? dadosTeste.codigo : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label>Fornecedor:</label>
                                <input 
                                    type="text" 
                                    name="fornecedor" 
                                    placeholder="EMPRESA EXEMPLO, LTDA" 
                                    defaultValue={devMode ? dadosTeste.fornecedor : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label>CNPJ:</label>
                                <input 
                                    type="text" 
                                    name="cnpj"
                                    value={devMode ? dadosTeste.cnpj : cnpj}
                                    onChange={handleCNPJChange}
                                    placeholder="XX.XXX.XXX/XXXX-XX"
                                    maxLength={18}
                                />
                            </div>

                            <div className="form-group">
                                <label>Endereço:</label>
                                <input 
                                    type="text" 
                                    name="endereco" 
                                    placeholder="RUA ... NUMERO ..." 
                                    defaultValue={devMode ? dadosTeste.endereco : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label>CEP:</label>
                                <input 
                                    type="text" 
                                    name="cep"
                                    value={devMode ? dadosTeste.cep : cep}
                                    onChange={handleCEPChange}
                                    placeholder="XXXXX-XXX"
                                    maxLength={9}
                                />
                            </div>

                            <div className="form-group">
                                <label>Contato:</label>
                                <input 
                                    type="text" 
                                    name="contato"
                                    value={devMode ? dadosTeste.contato : contato}
                                    onChange={handleContatoChange}
                                    placeholder="(XX) X XXXX-XXXX"
                                    maxLength={16}
                                />
                            </div>

                            <div className="form-group">
                                <label>Pedido:</label>
                                <input 
                                    type="text" 
                                    name="pedido" 
                                    placeholder="0000000000" 
                                    defaultValue={devMode ? dadosTeste.pedido : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label>Data de Vencimento:</label>
                                <input 
                                    type="date" 
                                    name="dataVencto" 
                                    min={minDate}
                                    required 
                                    defaultValue={devMode ? dadosTeste.dataVencto : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label>Cond. Pagto:</label>
                                <input 
                                    type="text" 
                                    name="condPagto" 
                                    placeholder="38DDl" 
                                    defaultValue={devMode ? dadosTeste.condPagto : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label>Centro de Custo:</label>
                                <input 
                                    type="text" 
                                    name="centroCusto" 
                                    placeholder="Galpão" 
                                    defaultValue={devMode ? dadosTeste.centroCusto : ''}
                                />
                            </div>

                            <button type="submit">Gerar Pedido de Compra de Material</button>
                        </form>
                    </div>

                    <div className="itens-container">
                        <h2>Adicionar Itens ao Pedido</h2>
                        <form className="itens-form">
                            <div className="form-group">
                                <label>Item:</label>
                                <input 
                                    type="text" 
                                    name="item"
                                    value={devMode ? itemTeste.item : itemAtual.item}
                                    onChange={handleInputChange}
                                    placeholder="ITEM001"
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição:</label>
                                <input 
                                    type="text" 
                                    name="descricao"
                                    value={devMode ? itemTeste.descricao : itemAtual.descricao}
                                    onChange={handleInputChange}
                                    placeholder="Descrição do item"
                                />
                            </div>

                            <div className="form-group">
                                <label>Unidade:</label>
                                <input 
                                    type="text" 
                                    name="unidade"
                                    value={devMode ? itemTeste.unidade : itemAtual.unidade}
                                    onChange={handleInputChange}
                                    placeholder="UN"
                                />
                            </div>

                            <div className="form-group">
                                <label>Quantidade:</label>
                                <input 
                                    type="text" 
                                    name="quantidade"
                                    value={devMode ? itemTeste.quantidade : itemAtual.quantidade}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>IPI:</label>
                                <input 
                                    type="text" 
                                    name="ipi"
                                    value={devMode ? itemTeste.ipi : itemAtual.ipi}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Valor Unitário:</label>
                                <input 
                                    type="text" 
                                    name="valorUnitario"
                                    value={devMode ? itemTeste.valorUnitario : itemAtual.valorUnitario}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Valor Total:</label>
                                <input 
                                    type="text" 
                                    name="valorTotal"
                                    value={devMode ? itemTeste.valorTotal : itemAtual.valorTotal}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Desconto:</label>
                                <input 
                                    type="text" 
                                    name="desconto"
                                    value={devMode ? itemTeste.desconto : itemAtual.desconto}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Previsão de Entrega:</label>
                                <input 
                                    type="date" 
                                    name="previsaoEntrega"
                                    value={devMode ? itemTeste.previsaoEntrega : itemAtual.previsaoEntrega}
                                    onChange={handleInputChange}
                                    min={minDate}
                                />
                            </div>

                            <button type="button" onClick={handleAddItem}>
                                Adicionar Item
                            </button>
                        </form>

                        
                    </div>
                    <div className="itensAdicionados">
                            <h2>Itens Adicionados</h2>
                            <table className="itens-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Descrição</th>
                                        <th>Un</th>
                                        <th>Qtd</th>
                                        <th>IPI</th>
                                        <th>Valor Unitário</th>
                                        <th>Valor Total</th>
                                        <th>Desconto</th>
                                        <th>Entrega</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itens.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.item}</td>
                                            <td>{item.descricao}</td>
                                            <td>{item.unidade}</td>
                                            <td>{item.quantidade}</td>
                                            <td>{item.ipi}</td>
                                            <td>{item.valorUnitario}</td>
                                            <td>{item.valorTotal}</td>
                                            <td>{item.desconto}</td>
                                            <td>{item.previsaoEntrega}</td>
                                            <td>
                                                <button onClick={() => handleEditItem(index)}>Editar</button>
                                                <button onClick={() => handleDeleteItem(index)}>Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                </div>
            </div>
        </>
    );
}

export default PedidosDeCompra;
