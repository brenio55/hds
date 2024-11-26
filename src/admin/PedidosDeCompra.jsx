import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preencherPedidoCompra } from '../utils/excelHandler';
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setItemAtual((prev) => ({
            ...prev,
            [name]: value,
            valorTotal: prev.quantidade && prev.valorUnitario ? 
                (prev.quantidade * prev.valorUnitario).toFixed(2) : ''
        }));
    };

    const handleAddItem = () => {
        setItens((prev) => [...prev, itemAtual]);
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
        const formatted = formatCNPJ(e.target.value);
        setCnpj(formatted);
    };

    const handleCEPChange = (e) => {
        const formatted = formatCEP(e.target.value);
        setCep(formatted);
    };

    const handleContatoChange = (e) => {
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

        try {
            // Gera o arquivo Excel e obtém a URL do blob
            const excelUrl = await preencherPedidoCompra(formData, itens);
            
            // Navega para a página de preview
            navigate('/pedido-gerado', { 
                state: { 
                    pedidoData: formData,
                    excelUrl: excelUrl
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
            <div className="admin-container pedidosDeCompra">
                <div className="pedido-wrapper">
                    <div className="pedido-container">
                        <h1>Pedido de Compra de Material</h1>
                        <form className="pedido-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Código:</label>
                                <input type="text" name="codigo" placeholder="00" />
                            </div>

                            <div className="form-group">
                                <label>Fornecedor:</label>
                                <input type="text" name="fornecedor" placeholder="EMPRESA EXEMPLO, LTDA" />
                            </div>

                            <div className="form-group">
                                <label>CNPJ:</label>
                                <input 
                                    type="text" 
                                    name="cnpj"
                                    value={cnpj}
                                    onChange={handleCNPJChange}
                                    placeholder="XX.XXX.XXX/XXXX-XX"
                                    maxLength={18}
                                />
                            </div>

                            <div className="form-group">
                                <label>Endereço:</label>
                                <input type="text" name="endereco" placeholder="RUA ... NUMERO ..." />
                            </div>

                            <div className="form-group">
                                <label>CEP:</label>
                                <input 
                                    type="text" 
                                    name="cep"
                                    value={cep}
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
                                    value={contato}
                                    onChange={handleContatoChange}
                                    placeholder="(XX) X XXXX-XXXX"
                                    maxLength={16}
                                />
                            </div>

                            <div className="form-group">
                                <label>Pedido:</label>
                                <input type="text" name="pedido" placeholder="0000000000" />
                            </div>

                            <div className="form-group">
                                <label>Data de Vencimento:</label>
                                <input 
                                    type="date" 
                                    name="dataVencto" 
                                    min={minDate}
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>Cond. Pagto:</label>
                                <input type="text" name="condPagto" placeholder="38DDl" />
                            </div>

                            <div className="form-group">
                                <label>Centro de Custo:</label>
                                <input type="text" name="centroCusto" placeholder="Galpão" />
                            </div>

                            <button type="submit">Gerar Pedido de Compra de Material</button>
                        </form>
                    </div>

                    <div className="itens-container">
                        <h2>Adicionar Itens ao Pedido</h2>
                        <form className="itens-form">
                            <input
                                type="text"
                                name="item"
                                placeholder="Item"
                                value={itemAtual.item}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="descricao"
                                placeholder="Descrição do Material"
                                value={itemAtual.descricao}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="unidade"
                                placeholder="Un"
                                value={itemAtual.unidade}
                                onChange={handleInputChange}
                            />
                            <input
                                type="number"
                                name="quantidade"
                                placeholder="Quantidade"
                                value={itemAtual.quantidade}
                                onChange={handleInputChange}
                            />
                            <input
                                type="number"
                                name="ipi"
                                placeholder="IPI"
                                value={itemAtual.ipi}
                                onChange={handleInputChange}
                            />
                            <input
                                type="number"
                                name="valorUnitario"
                                placeholder="Valor Unitário"
                                value={itemAtual.valorUnitario}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="valorTotal"
                                placeholder="Valor Total"
                                value={itemAtual.valorTotal}
                                disabled
                            />
                            <input
                                type="number"
                                name="desconto"
                                placeholder="Desconto (%)"
                                value={itemAtual.desconto}
                                onChange={handleInputChange}
                            />
                            <input
                                type="date"
                                name="previsaoEntrega"
                                value={itemAtual.previsaoEntrega}
                                onChange={handleInputChange}
                            />
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
