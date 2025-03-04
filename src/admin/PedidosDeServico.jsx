import React, { useState, useEffect } from 'react';
import { formatCNPJ, formatCEP, formatTelefone } from '../utils/formatters';
import HeaderAdmin from './HeaderAdmin';
import './pedidos.scss';
import ApiService from '../services/ApiService';

function PedidosDeServico() {
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
        return today.toISOString().split('T')[0];
    });
    const [cnpj, setCnpj] = useState('');
    const [cep, setCep] = useState('');
    const [contato, setContato] = useState('');
    const [devMode, setDevMode] = useState(false);
    const [fornecedorId, setFornecedorId] = useState('');
    const [fornecedorNome, setFornecedorNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [loadingFornecedor, setLoadingFornecedor] = useState(false);
    const [errorFornecedor, setErrorFornecedor] = useState('');
    const [dadosPedido, setDadosPedido] = useState({
        valorFrete: '0,00',
        outrasDespesas: '0,00',
        informacoesImportantes: '',
        condPagto: '',
        prazoEntrega: '',
        frete: ''
    });
    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [loadingListaFornecedores, setLoadingListaFornecedores] = useState(false);
    const [listaPropostas, setListaPropostas] = useState([]);
    const [loadingPropostas, setLoadingPropostas] = useState(false);
    const [centroCusto, setCentroCusto] = useState('');
    const [propostaSelecionada, setPropostaSelecionada] = useState(null);

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
        item: '1001',
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

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        // Carregar lista de fornecedores
        carregarFornecedores();
        
        // Carregar lista de propostas para o centro de custo
        carregarPropostas();
    }, []);

    const carregarFornecedores = async () => {
        setLoadingListaFornecedores(true);
        try {
            const fornecedores = await ApiService.buscarFornecedores();
            setListaFornecedores(fornecedores);
        } catch (error) {
            console.error('Erro ao carregar lista de fornecedores:', error);
        } finally {
            setLoadingListaFornecedores(false);
        }
    };

    const carregarPropostas = async () => {
        setLoadingPropostas(true);
        try {
            const data = await ApiService.buscarPropostas();
            setListaPropostas(data.propostas || []);
        } catch (error) {
            console.error('Erro ao carregar propostas:', error);
        } finally {
            setLoadingPropostas(false);
        }
    };

    const handleInputChange = (e) => {
        if (devMode) {
            return;
        }
        
        const { name, value } = e.target;
        const updatedItem = { ...itemAtual };

        if (name === 'item') {
            updatedItem[name] = value.replace(/\D/g, '');
        } else {
            updatedItem[name] = value;
        }

        if (name === 'quantidade' || name === 'valorUnitario') {
            const quantidade = parseFloat(updatedItem.quantidade.replace(',', '.')) || 0;
            const valorUnitario = parseFloat(updatedItem.valorUnitario.replace(',', '.')) || 0;
            const total = (quantidade * valorUnitario).toFixed(2);
            updatedItem.valorTotal = total.toString().replace('.', ',');
        }

        setItemAtual(updatedItem);
    };

    const handleAddItem = () => {
        if (devMode) {
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

    const calcularTotalBruto = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            total += valorTotal;
        });
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalIPI = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            const ipi = parseFloat(item.ipi.toString().replace(',', '.')) || 0;
            const ipiValor = valorTotal * (ipi / 100);
            total += ipiValor;
        });
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalDescontos = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            const desconto = parseFloat(item.desconto.toString().replace(',', '.')) || 0;
            const descontoValor = valorTotal * (desconto / 100);
            total += descontoValor;
        });
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalFinal = () => {
        const totalBruto = parseFloat(calcularTotalBruto().replace(',', '.')) || 0;
        const totalIPI = parseFloat(calcularTotalIPI().replace(',', '.')) || 0;
        const totalDescontos = parseFloat(calcularTotalDescontos().replace(',', '.')) || 0;
        const valorFrete = parseFloat(dadosPedido.valorFrete.replace(',', '.')) || 0;
        const outrasDespesas = parseFloat(dadosPedido.outrasDespesas.replace(',', '.')) || 0;

        const total = totalBruto + totalIPI - totalDescontos + valorFrete + outrasDespesas;
        return total.toFixed(2).replace('.', ',');
    };

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
        const rawValue = e.target.value.replace(/\D/g, '');
        const formatted = formatTelefone(rawValue);
        setContato(formatted);
    };

    const handleFornecedorIdChange = async (e) => {
        const id = e.target.value;
        setFornecedorId(id);
        
        if (id && id.trim() !== '') {
            setLoadingFornecedor(true);
            setErrorFornecedor('');
            
            try {
                const fornecedor = await ApiService.buscarFornecedorPorId(id);
                
                // Verificar se o fornecedor foi encontrado
                if (fornecedor && fornecedor.id) {
                    // Preencher os campos com os dados do fornecedor
                    setFornecedorNome(fornecedor.razao_social || '');
                    setCnpj(formatCNPJ(fornecedor.cnpj || ''));
                    setEndereco(fornecedor.endereco || '');
                    setCep(formatCEP(fornecedor.cep || ''));
                    setContato(formatTelefone(fornecedor.telefone || fornecedor.celular || ''));
                    setErrorFornecedor(''); // Garantir que não há mensagem de erro
                } else {
                    throw new Error('Fornecedor não encontrado');
                }
                
            } catch (error) {
                console.error('Erro ao buscar fornecedor:', error);
                setErrorFornecedor('Fornecedor não encontrado');
                
                // Limpar os campos em caso de erro
                setFornecedorNome('');
                setCnpj('');
                setEndereco('');
                setCep('');
                setContato('');
            } finally {
                setLoadingFornecedor(false);
            }
        } else {
            // Limpar os campos se o ID estiver vazio
            setFornecedorNome('');
            setCnpj('');
            setEndereco('');
            setCep('');
            setContato('');
            setErrorFornecedor('');
        }
    };

    const handleFornecedorSelectChange = (e) => {
        const selectedId = e.target.value;
        if (selectedId) {
            setFornecedorId(selectedId);
            // Acionar a busca de detalhes do fornecedor
            const event = { target: { value: selectedId } };
            handleFornecedorIdChange(event);
        } else {
            // Limpar os campos se nenhum fornecedor for selecionado
            setFornecedorId('');
            setFornecedorNome('');
            setCnpj('');
            setEndereco('');
            setCep('');
            setContato('');
        }
    };

    const handlePropostaChange = (e) => {
        const propostaId = e.target.value;
        setCentroCusto(propostaId);
        
        if (propostaId) {
            const proposta = listaPropostas.find(p => p.id === propostaId);
            setPropostaSelecionada(proposta);
        } else {
            setPropostaSelecionada(null);
        }
    };

    const handleGerarPedido = async () => {
        try {
            const totalBruto = calcularTotalBruto();
            const ipiTotal = calcularTotalIPI();
            const totalDescontos = calcularTotalDescontos();
            const totalFinal = calcularTotalFinal();

            const pedidoParaSalvar = {
                codigo: document.querySelector('[name="codigo"]').value,
                fornecedor: document.querySelector('[name="fornecedor"]').value,
                cnpj: cnpj,
                endereco: document.querySelector('[name="endereco"]').value,
                contato: contato,
                pedido: document.querySelector('[name="pedido"]').value,
                dataVencto: document.querySelector('[name="dataVencto"]').value,
                totalBruto,
                totalDescontos,
                valorFrete: dadosPedido.valorFrete,
                outrasDespesas: dadosPedido.outrasDespesas,
                totalFinal,
                previsaoEntrega: new Date().toISOString().split('T')[0]
            };

            const { numeroPedido } = await ApiService.criarPedido(pedidoParaSalvar, itens);
            // const numeroPedido = '1234567890';
            // alterar depois quando o back estiver fazendo

            const formatarValorMonetario = (valor) => {
                if (!valor) return '0,00';
                return typeof valor === 'string' ? valor : valor.toString().replace('.', ',');
            };

            const logoResponse = await fetch('/docs/admin/LOGO.png');
            const logoBlob = await logoResponse.blob();
            const logoBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(logoBlob);
            });

            const response = await fetch('/docs/admin/pedidoDeServicoTemplateCode.html');
            let templateHtml = await response.text();

            templateHtml = templateHtml.replace(
                /<img[^>]*>/,
                `<img src="${logoBase64}" alt="Logo" class="logo" style="height: 80px;">`
            );

            const hoje = new Date();
            const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
            
            templateHtml = templateHtml.replace(
                /<td>20000001<\/td>\s*<td>12\/12\/2024<\/td>\s*<td>1<\/td>/,
                `<td>${numeroPedido}</td><td>${dataFormatada}</td><td>1</td>`
            );

            templateHtml = templateHtml.replace(
                /<td>12345<\/td>\s*<td>Fornecedor XYZ<\/td>\s*<td>00\.000\.000\/0000-00<\/td>\s*<td>Rua Exemplo, 123<\/td>\s*<td>12000-000<\/td>\s*<td>\(12\) 3456-7890<\/td>/,
                `<td>${document.querySelector('[name="codigo"]').value}</td>
                <td>${document.querySelector('[name="fornecedor"]').value}</td>
                <td>${cnpj}</td>
                <td>${document.querySelector('[name="endereco"]').value}</td>
                <td>${cep}</td>
                <td>${contato}</td>`
            );

            templateHtml = templateHtml.replace(
                /<td>001<\/td>\s*<td>01\/01\/2024<\/td>\s*<td>À vista<\/td>\s*<td>Financeiro<\/td>/,
                `<td>${document.querySelector('[name="pedido"]').value}</td>
                <td>${formatarData(document.querySelector('[name="dataVencto"]').value)}</td>
                <td>${dadosPedido.condPagto || 'N/A'}</td>
                <td>${document.querySelector('[name="centroCusto"]')?.value || 'N/A'}</td>`
            );

            const tabelaItens = itens.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.descricao}</td>
                    <td>${item.unidade}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${formatarValorMonetario(item.valorUnitario)}</td>
                    <td>R$ ${formatarValorMonetario(item.valorTotal)}</td>
                    <td>${item.ipi}%</td>
                    <td>${formatarData(item.previsaoEntrega)}</td>
                </tr>
            `).join('');

            templateHtml = templateHtml.replace(
                /<tbody>\s*{{#each items}}[\s\S]*?{{\/each}}\s*<\/tbody>/,
                `<tbody>${tabelaItens}</tbody>`
            );

            templateHtml = templateHtml.replace(
                /<th>Total Bruto<\/th>\s*<td>R\$ 2\.144,00<\/td>/,
                `<th>Total Bruto</th><td>R$ ${calcularTotalBruto()}</td>`
            );

            templateHtml = templateHtml.replace(
                /<th>\(\+\) IPI<\/th>\s*<td>R\$ -<\/td>/,
                `<th>(+) IPI</th><td>R$ ${calcularTotalIPI()}</td>`
            );

            templateHtml = templateHtml.replace(
                /<th>\(\+\) Frete<\/th>\s*<td>R\$ 100,00<\/td>/,
                `<th>(+) Frete</th><td>R$ ${formatarValorMonetario(dadosPedido.valorFrete)}</td>`
            );

            templateHtml = templateHtml.replace(
                /<th>\(\+\) Outras despesas<\/th>\s*<td>R\$ -<\/td>/,
                `<th>(+) Outras despesas</th><td>R$ ${formatarValorMonetario(dadosPedido.outrasDespesas)}</td>`
            );

            templateHtml = templateHtml.replace(
                /<th>\(-\) Desconto<\/th>\s*<td>R\$ -<\/td>/,
                `<th>(-) Desconto</th><td>R$ ${calcularTotalDescontos()}</td>`
            );

            templateHtml = templateHtml.replace(
                /<th>\(=\) Total Final<\/th>\s*<td>R\$ 2\.244,00<\/td>/,
                `<th>(=) Total Final</th><td>R$ ${calcularTotalFinal()}</td>`
            );

            templateHtml = templateHtml.replace(
                /<h2>Dados Adicionais<\/h2>\s*<table>\s*<tr>\s*<td><\/td>\s*<\/tr>\s*<\/table>/,
                `<h2>Dados Adicionais</h2>
                <table>
                    <tr>
                        <td>${(dadosPedido.informacoesImportantes || 'Nenhuma informação adicional').replace(/\n/g, '<br>')}</td>
                    </tr>
                </table>`
            );

            templateHtml = templateHtml.replace(
                /Frete \(  \) CIF     \(   \) FOB/,
                `Frete (${dadosPedido.frete === 'CIF' ? 'X' : '  '}) CIF     (${dadosPedido.frete === 'FOB' ? 'X' : '  '}) FOB`
            );

            // ===== NOVOS CAMPOS =====
            // Atualiza a seção de Escopo da Contratação
            templateHtml = templateHtml.replace(
                /<h2>CARACTERÍSTICAS TÉCNICAS DA OBRA \(Escopo da Contratação\)<\/h2>\s*<table>[\s\S]*?<\/table>/,
                `<h2>CARACTERÍSTICAS TÉCNICAS DA OBRA (Escopo da Contratação)</h2>
                 <table>
                   <tr>
                     <td>${document.querySelector('[name="escopoContratacao"]').value || ''}</td>
                   </tr>
                 </table>`
            );

            // Atualiza a seção de Responsabilidade da Contratada
            const respContratadaInput = document.querySelector('[name="respContratada"]').value || '';
            const respContratadaList = respContratadaInput.split(/\r?\n/).map(item => `<li>${item}</li>`).join('');
            templateHtml = templateHtml.replace(
                /<h2>RESPONSABILIDADE DA CONTRATADA<\/h2>\s*<table>[\s\S]*?<\/table>/,
                `<h2>RESPONSABILIDADE DA CONTRATADA</h2>
                 <table>
                   <tr>
                     <td>
                       <ul>
                         ${respContratadaList}
                       </ul>
                     </td>
                   </tr>
                 </table>`
            );

            // Atualiza a seção de Responsabilidades da Contratante
            const respContratanteInput = document.querySelector('[name="respContratante"]').value || '';
            const respContratanteList = respContratanteInput.split(/\r?\n/).map(item => `<li>${item}</li>`).join('');
            templateHtml = templateHtml.replace(
                /<h2>RESPONSABILIDADES DA CONTRATANTE<\/h2>\s*<table>[\s\S]*?<\/table>/,
                `<h2>RESPONSABILIDADES DA CONTRATANTE</h2>
                 <table>
                   <tr>
                     <td>
                       <ul>
                         ${respContratanteList}
                       </ul>
                     </td>
                   </tr>
                 </table>`
            );
            // ==========================

            const blob = new Blob([templateHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao gerar pedido:', error);
            alert('Erro ao gerar pedido. Por favor, tente novamente.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
            <div className="pedidos-container">
                <h2>Gerar Pedido de Serviço</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Código do Fornecedor:</label>
                            <div className="input-with-dropdown">
                                <input 
                                    type="text" 
                                    name="fornecedorId" 
                                    value={fornecedorId}
                                    onChange={handleFornecedorIdChange}
                                    placeholder="Digite o ID do fornecedor" 
                                />
                                {loadingFornecedor && <span className="loading-text">Carregando...</span>}
                                {errorFornecedor && <span className="error-text">{errorFornecedor}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Selecionar Fornecedor:</label>
                            <select 
                                onChange={handleFornecedorSelectChange}
                                value={fornecedorId || ''}
                                className="fornecedor-select"
                            >
                                <option value="">Selecione um fornecedor</option>
                                {loadingListaFornecedores ? (
                                    <option disabled>Carregando fornecedores...</option>
                                ) : (
                                    listaFornecedores.map(fornecedor => (
                                        <option key={fornecedor.id} value={fornecedor.id}>
                                            {fornecedor.razao_social} (ID: {fornecedor.id})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fornecedor:</label>
                            <input 
                                type="text" 
                                name="fornecedor" 
                                value={fornecedorNome}
                                readOnly 
                            />
                        </div>
                        <div className="form-group">
                            <label>CNPJ:</label>
                            <input
                                type="text"
                                value={cnpj}
                                onChange={handleCNPJChange}
                                maxLength="18"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Endereço:</label>
                            <input 
                                type="text" 
                                name="endereco" 
                                value={endereco}
                                readOnly 
                            />
                        </div>
                        <div className="form-group">
                            <label>CEP:</label>
                            <input
                                type="text"
                                value={cep}
                                onChange={handleCEPChange}
                                maxLength="9"
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Contato:</label>
                            <input
                                type="text"
                                value={contato}
                                onChange={handleContatoChange}
                                maxLength="15"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Pedido:</label>
                            <input type="text" name="pedido" defaultValue={devMode ? dadosTeste.pedido : ''} />
                        </div>
                        <div className="form-group">
                            <label>Data Vencto:</label>
                            <input
                                type="date"
                                name="dataVencto"
                                min={minDate}
                                defaultValue={devMode ? dadosTeste.dataVencto : ''}
                            />
                        </div>
                        <div className="form-group">
                            <label>Centro de Custo:</label>
                            <div className="input-with-dropdown">
                                <input 
                                    type="text" 
                                    name="centroCusto" 
                                    value={centroCusto}
                                    onChange={(e) => setCentroCusto(e.target.value)}
                                    placeholder="Digite o centro de custo" 
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Selecionar Proposta (Centro de Custo):</label>
                            <select 
                                onChange={handlePropostaChange}
                                value={centroCusto || ''}
                                className="proposta-select"
                            >
                                <option value="">Selecione uma proposta</option>
                                {loadingPropostas ? (
                                    <option disabled>Carregando propostas...</option>
                                ) : (
                                    listaPropostas.map(proposta => (
                                        <option key={proposta.id} value={proposta.id}>
                                            {proposta.id} - {proposta.descricao} ({proposta.client_info?.nome || proposta.client_info?.razao_social || 'Cliente'})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tipo de Frete:</label>
                            <select 
                                name="frete" 
                                value={dadosPedido.frete} 
                                onChange={handleDadosPedidoChange}
                            >
                                <option value="CIF">CIF (Frete por conta do fornecedor)</option>
                                <option value="FOB">FOB (Frete por conta do destinatário)</option>
                            </select>
                        </div>
                    </div>

                    <div className="items-section">
                        <h3>Itens do Pedido</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Item:</label>
                                <input
                                    type="text"
                                    name="item"
                                    value={itemAtual.item}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Descrição:</label>
                                <input
                                    type="text"
                                    name="descricao"
                                    value={itemAtual.descricao}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Unidade:</label>
                                <input
                                    type="text"
                                    name="unidade"
                                    value={itemAtual.unidade}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Quantidade:</label>
                                <input
                                    type="text"
                                    name="quantidade"
                                    value={itemAtual.quantidade}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>IPI (%):</label>
                                <input
                                    type="text"
                                    name="ipi"
                                    value={itemAtual.ipi}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Valor Unitário:</label>
                                <input
                                    type="text"
                                    name="valorUnitario"
                                    value={itemAtual.valorUnitario}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Valor Total:</label>
                                <input
                                    type="text"
                                    name="valorTotal"
                                    value={itemAtual.valorTotal}
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>Desconto (%):</label>
                                <input
                                    type="text"
                                    name="desconto"
                                    value={itemAtual.desconto}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Previsão de Entrega:</label>
                                <input
                                    type="date"
                                    name="previsaoEntrega"
                                    value={itemAtual.previsaoEntrega}
                                    onChange={handleInputChange}
                                    min={minDate}
                                />
                            </div>
                        </div>
                        <button type="button" onClick={handleAddItem}>Adicionar Item</button>
                    </div>

                    <div className="items-table">
                        <h3>Itens Adicionados</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Descrição</th>
                                    <th>Unidade</th>
                                    <th>Quantidade</th>
                                    <th>IPI (%)</th>
                                    <th>Valor Unitário</th>
                                    <th>Valor Total</th>
                                    <th>Desconto (%)</th>
                                    <th>Previsão de Entrega</th>
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
                                        <td>{formatarData(item.previsaoEntrega)}</td>
                                        <td>
                                            <button type="button" onClick={() => handleEditItem(index)}>Editar</button>
                                            <button type="button" onClick={() => handleDeleteItem(index)}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="totals-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Total Bruto:</label>
                                <input type="text" value={calcularTotalBruto()} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Total IPI:</label>
                                <input type="text" value={calcularTotalIPI()} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Total Descontos:</label>
                                <input type="text" value={calcularTotalDescontos()} readOnly />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Valor Frete:</label>
                                <input
                                    type="text"
                                    name="valorFrete"
                                    value={dadosPedido.valorFrete}
                                    onChange={handleDadosPedidoChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Outras Despesas:</label>
                                <input
                                    type="text"
                                    name="outrasDespesas"
                                    value={dadosPedido.outrasDespesas}
                                    onChange={handleDadosPedidoChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Total Final:</label>
                                <input type="text" value={calcularTotalFinal()} readOnly />
                            </div>
                        </div>
                    </div>

                    <div className="additional-info">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Informações Importantes:</label>
                                <textarea
                                    name="informacoesImportantes"
                                    value={dadosPedido.informacoesImportantes}
                                    onChange={handleDadosPedidoChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Cond. Pagto:</label>
                                <input
                                    type="text"
                                    name="condPagto"
                                    value={dadosPedido.condPagto}
                                    onChange={handleDadosPedidoChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Prazo de Entrega:</label>
                                <input
                                    type="text"
                                    name="prazoEntrega"
                                    value={dadosPedido.prazoEntrega}
                                    onChange={handleDadosPedidoChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Escopo da Contratação:</label>
                            <textarea
                                name="escopoContratacao"
                                placeholder="Digite o escopo da contratação"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Responsabilidade da Contratada:</label>
                            <textarea
                                name="respContratada"
                                placeholder="Digite a responsabilidade da contratada (uma linha para cada item)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Responsabilidades da Contratante:</label>
                            <textarea
                                name="respContratante"
                                placeholder="Digite as responsabilidades da contratante (uma linha para cada item)"
                            />
                        </div>
                    </div>

                    <button type="submit">Gerar Pedido</button>
                </form>
            </div>
        </>
    );
}

export default PedidosDeServico; 