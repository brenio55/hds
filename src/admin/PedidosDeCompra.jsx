import React, { useState, useEffect } from 'react';
import { formatCNPJ, formatCEP, formatTelefone } from '../utils/formatters';
import HeaderAdmin from './HeaderAdmin';
import './PedidosDeCompra.css';

function PedidosDeCompra() {
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
    const [dadosPedido, setDadosPedido] = useState({
        valorFrete: '0,00',
        outrasDespesas: '0,00',
        informacoesImportantes: '',
        condPagto: '',
        prazoEntrega: '',
        frete: ''
    });

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
            return;
        }
        
        const { name, value } = e.target;
        
        // Create a copy of the current state
        const updatedItem = { ...itemAtual };
        updatedItem[name] = value;

        // Calculate total value when quantity or unit value changes
        if (name === 'quantidade' || name === 'valorUnitario') {
            const quantidade = parseFloat(updatedItem.quantidade.replace(',', '.')) || 0;
            const valorUnitario = parseFloat(updatedItem.valorUnitario.replace(',', '.')) || 0;
            
            // Calculate total and format to 2 decimal places
            const total = (quantidade * valorUnitario).toFixed(2);
            updatedItem.valorTotal = total.toString().replace('.', ',');
        }

        setItemAtual(updatedItem);
    };

    const handleAddItem = () => {
        if (devMode) {
            // Criar uma cópia do itemTeste com valores calculados
            const novoItem = { ...itemTeste };
            const quantidade = parseFloat(novoItem.quantidade.toString().replace(',', '.')) || 0;
            const valorUnitario = parseFloat(novoItem.valorUnitario.toString().replace(',', '.')) || 0;
            novoItem.valorTotal = (quantidade * valorUnitario).toFixed(2).toString();
            setItens(prev => [...prev, novoItem]);
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

    const calcularTotalIPI = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            const ipi = parseFloat(item.ipi.toString().replace(',', '.')) || 0;
            const ipiValor = valorTotal * (ipi / 100);
            total += ipiValor;
            console.log(`IPI calculado para item: ${ipiValor} (${ipi}% de ${valorTotal})`);
        });
        console.log(`Total IPI final: ${total}`);
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalDescontos = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            const desconto = parseFloat(item.desconto.toString().replace(',', '.')) || 0;
            const descontoValor = valorTotal * (desconto / 100);
            total += descontoValor;
            console.log(`Desconto calculado para item: ${descontoValor} (${desconto}% de ${valorTotal})`);
        });
        console.log(`Total descontos final: ${total}`);
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalBruto = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            total += valorTotal;
            console.log(`Somando ao total bruto: ${valorTotal}`);
        });
        console.log(`Total bruto final: ${total}`);
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalFinal = () => {
        const totalBruto = parseFloat(calcularTotalBruto().replace(',', '.'));
        const ipiTotal = parseFloat(calcularTotalIPI().replace(',', '.'));
        const totalDescontos = parseFloat(calcularTotalDescontos().replace(',', '.'));
        const frete = parseFloat(dadosPedido.valorFrete.replace(',', '.')) || 0;
        const outras = parseFloat(dadosPedido.outrasDespesas.replace(',', '.')) || 0;

        console.log('Valores para cálculo final:', {
            totalBruto,
            ipiTotal,
            totalDescontos,
            frete,
            outras
        });

        const total = totalBruto + ipiTotal - totalDescontos + frete + outras;
        console.log(`Total final calculado: ${total}`);
        return total.toFixed(2).replace('.', ',');
    };

    const handleGerarPedido = async () => {
        try {
            // Calcula todos os totais
            const totalBruto = calcularTotalBruto();
            const ipiTotal = calcularTotalIPI();
            const totalDescontos = calcularTotalDescontos();
            const totalFinal = calcularTotalFinal();

            // Formata os valores monetários
            const formatarValorMonetario = (valor) => {
                if (!valor) return '0,00';
                return typeof valor === 'string' ? valor : valor.toString().replace('.', ',');
            };

            // Formata a data para o padrão brasileiro
            const formatarData = (data) => {
                if (!data) return '';
                const [ano, mes, dia] = data.split('-');
                return `${dia}/${mes}/${ano}`;
            };

            // Lê o template HTML
            const response = await fetch('/docs/admin/pedidoDeCompraTemplateCode.html');
            let templateHtml = await response.text();

            // Obtém o caminho absoluto base da aplicação
            const baseUrl = window.location.origin;

            // Substitui a referência da imagem no template com o caminho absoluto
            templateHtml = templateHtml.replace(
                /<img src="[^"]*" alt="Logo" class="logo"[^>]*>/,
                `<img src="${baseUrl}/img/LOGO.png" alt="Logo" class="logo" style="height: 80px;">`
            );
            
            // Substitui os valores no template
            const hoje = new Date();
            const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
            
            // Substitui os dados do pedido
            templateHtml = templateHtml.replace('20000001', document.querySelector('[name="pedido"]').value || '');
            templateHtml = templateHtml.replace('12/12/2024', dataFormatada);

            // Substitui os dados do fornecedor
            templateHtml = templateHtml.replace('12345', document.querySelector('[name="codigo"]').value || '');
            templateHtml = templateHtml.replace('Fornecedor XYZ', document.querySelector('[name="fornecedor"]').value || '');
            templateHtml = templateHtml.replace('00.000.000/0000-00', cnpj || '');
            templateHtml = templateHtml.replace('Rua Exemplo, 123', document.querySelector('[name="endereco"]').value || '');
            templateHtml = templateHtml.replace('12000-000', cep || '');
            templateHtml = templateHtml.replace('(12) 3456-7890', contato || '');

            // Substitui os dados adicionais
            templateHtml = templateHtml.replace('001', document.querySelector('[name="pedido"]').value || '');
            templateHtml = templateHtml.replace('01/01/2024', formatarData(document.querySelector('[name="dataVencto"]').value) || '');
            templateHtml = templateHtml.replace('À vista', document.querySelector('[name="condPagto"]').value || '');
            templateHtml = templateHtml.replace('Financeiro', document.querySelector('[name="centroCusto"]').value || '');

            // Substitui os totais
            templateHtml = templateHtml.replace('R$ 100,00', `R$ ${formatarValorMonetario(totalDescontos)}`);
            templateHtml = templateHtml.replace('R$ 50,00', `R$ ${formatarValorMonetario(dadosPedido.valorFrete)}`);
            templateHtml = templateHtml.replace('R$ 30,00', `R$ ${formatarValorMonetario(dadosPedido.outrasDespesas)}`);
            templateHtml = templateHtml.replace('R$ 1.100,00', `R$ ${formatarValorMonetario(totalBruto)}`);
            templateHtml = templateHtml.replace('R$ 1.080,00', `R$ ${formatarValorMonetario(totalFinal)}`);

            // Substitui a tabela de itens
            let itensHtml = '';
            itens.forEach(item => {
                itensHtml += `
                <tr>
                    <td>${item.descricao}</td>
                    <td>${item.unidade}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${formatarValorMonetario(item.valorUnitario)}</td>
                    <td>R$ ${formatarValorMonetario(item.valorTotal)}</td>
                    <td>${item.ipi}%</td>
                    <td>${formatarData(item.previsaoEntrega)}</td>
                </tr>`;
            });

            // Encontra a tabela de materiais e substitui os itens de exemplo
            const materiaisPattern = /<tr>\s*<td>Material A<\/td>[\s\S]*?<td>Material B<\/td>[\s\S]*?<\/tr>/;
            templateHtml = templateHtml.replace(materiaisPattern, itensHtml);

            // Cria um Blob com o HTML modificado
            const blob = new Blob([templateHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            // Abre em uma nova aba
            window.open(url, '_blank');

            // Limpa o URL object após um tempo
            setTimeout(() => URL.revokeObjectURL(url), 1000);

        } catch (error) {
            console.error('Erro ao gerar pedido:', error);
            alert('Erro ao gerar o pedido. Por favor, tente novamente.');
        }
    };

    // Função para atualizar dados do pedido
    const handleDadosPedidoChange = (e) => {
        const { name, value } = e.target;
        setDadosPedido(prev => ({
            ...prev,
            [name]: value
        }));
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
        handleGerarPedido();
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
                                            <td className="acoes-td">
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
