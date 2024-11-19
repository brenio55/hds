import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container pedidosDeCompra">
                <div className="pedido-wrapper">
                    <div className="pedido-container">
                        <h1>Pedido de Compra de Material</h1>
                        <form className="pedido-form">
                        <div className="form-group">
                            <label>Código:</label>
                            <input type="text" placeholder="00" />
                        </div>

                        <div className="form-group">
                            <label>Fornecedor:</label>
                            <input type="text" placeholder="EMPRESA EXEMPLO, LTDA" />
                        </div>

                        <div className="form-group">
                            <label>CNPJ:</label>
                            <input type="text" placeholder="00.000.000/0000-00" />
                        </div>

                        <div className="form-group">
                            <label>Endereço:</label>
                            <input type="text" placeholder="RUA ... NUMERO ..." />
                        </div>

                        <div className="form-group">
                            <label>CEP:</label>
                            <input type="text" placeholder="00000-000" />
                        </div>

                        <div className="form-group">
                            <label>Contato:</label>
                            <input type="text" placeholder="(XX) X-XXXX-XXXX" />
                        </div>

                        <div className="form-group">
                            <label>Pedido:</label>
                            <input type="text" placeholder="0000000000" />
                        </div>

                        <div className="form-group">
                            <label>Data Vencto:</label>
                            <input type="text" placeholder="R$ VALOR,00" />
                        </div>

                        <div className="form-group">
                            <label>Cond. Pagto:</label>
                            <input type="text" placeholder="38DDl" />
                        </div>

                        <div className="form-group">
                            <label>Centro de Custo:</label>
                            <input type="text" placeholder="Galpão" />
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
