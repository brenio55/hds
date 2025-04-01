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
        frete: '0'
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
        try {
            console.log("Iniciando carregamento de fornecedores...");
            setLoadingListaFornecedores(true);
            
            const resposta = await ApiService.buscarFornecedores();
            console.log("Resposta da API de fornecedores:", resposta);
            
            let listaFornecedores = [];
            
            // Verificar o formato da resposta e extrair os fornecedores
            if (resposta && Array.isArray(resposta.fornecedores)) {
                console.log("Fornecedores recebidos como array dentro do objeto resposta");
                listaFornecedores = resposta.fornecedores;
            } else if (Array.isArray(resposta)) {
                console.log("Fornecedores recebidos diretamente como array");
                listaFornecedores = resposta;
            } else if (resposta && typeof resposta === 'object') {
                console.log("Tentando extrair fornecedores de formato desconhecido");
                // Tentar extrair a lista de fornecedores de qualquer formato
                const possiveisFornecedores = Object.values(resposta).filter(
                    item => item && typeof item === 'object' && item.id !== undefined
                );
                
                if (possiveisFornecedores.length > 0) {
                    console.log("Fornecedores encontrados através de filtragem de objetos");
                    listaFornecedores = possiveisFornecedores;
                }
            }
            
            console.log(`Total de ${listaFornecedores.length} fornecedores processados`);
            
            // Verificar conteúdo da lista para debug
            if (listaFornecedores.length > 0) {
                console.log("Exemplo do primeiro fornecedor:", listaFornecedores[0]);
            } else {
                console.warn("Nenhum fornecedor encontrado na resposta");
            }
            
            setListaFornecedores(listaFornecedores);
        } catch (error) {
            console.error("Erro ao carregar fornecedores:", error);
            setErrorFornecedor("Erro ao carregar fornecedores. Por favor, tente novamente.");
        } finally {
            setLoadingListaFornecedores(false);
        }
    };

    const carregarPropostas = async () => {
        setLoadingPropostas(true);
        try {
            console.log("Iniciando carregamento de propostas para serviços...");
            const resposta = await ApiService.buscarPropostas();
            console.log("Resposta da API de propostas:", resposta);
            
            // Garantir que a resposta tenha um array de propostas
            if (resposta && Array.isArray(resposta.propostas)) {
                console.log("Propostas carregadas com sucesso:", resposta.propostas.length);
                setListaPropostas(resposta.propostas);
            } else {
                console.warn("Formato inesperado na resposta de propostas:", resposta);
                // Verificar se resposta é um array diretamente
                if (Array.isArray(resposta)) {
                    console.log("Usando array diretamente da resposta");
                    setListaPropostas(resposta);
                } else {
                    // Tentar extrair propostas de qualquer formato de resposta
                    const propostasExtraidas = resposta && typeof resposta === 'object' ? 
                        Object.values(resposta).filter(item => item && typeof item === 'object') : [];
                    console.log("Tentando extrair propostas manualmente:", propostasExtraidas.length);
                    setListaPropostas(propostasExtraidas);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar propostas para serviços:', error);
            setListaPropostas([]); // Garantir que mesmo com erro, temos uma lista vazia
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
            novoItem.item = (itens.length + 1).toString();
            setItens(prev => [...prev, novoItem]);
        } else {
            const novoItem = { ...itemAtual, item: (itens.length + 1).toString() };
            setItens(prev => [...prev, novoItem]);
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
        console.log(`Fornecedor selecionado do dropdown: ID=${selectedId}`);
        
        if (selectedId) {
            setFornecedorId(selectedId);
            
            // Verificar se temos os dados do fornecedor na lista carregada
            const fornecedorSelecionado = listaFornecedores.find(
                f => f.id && f.id.toString() === selectedId.toString()
            );
            
            if (fornecedorSelecionado) {
                console.log("Fornecedor encontrado na lista carregada:", fornecedorSelecionado);
                // Usar dados da lista para preencher os campos
                setFornecedorNome(fornecedorSelecionado.razao_social || '');
                setCnpj(formatCNPJ(fornecedorSelecionado.cnpj || ''));
                setEndereco(fornecedorSelecionado.endereco || '');
                setCep(formatCEP(fornecedorSelecionado.cep || ''));
                setContato(formatTelefone(fornecedorSelecionado.telefone || fornecedorSelecionado.celular || ''));
                setErrorFornecedor('');
            } else {
                console.log("Fornecedor não encontrado na lista, buscando da API");
                // Acionar a busca de detalhes do fornecedor
                const event = { target: { value: selectedId } };
                handleFornecedorIdChange(event);
            }
        } else {
            // Limpar os campos se nenhum fornecedor for selecionado
            setFornecedorId('');
            setFornecedorNome('');
            setCnpj('');
            setEndereco('');
            setCep('');
            setContato('');
            setErrorFornecedor('');
        }
    };

    const handlePropostaChange = (e) => {
        const propostaId = e.target.value;
        console.log("Proposta selecionada ID:", propostaId);
        setCentroCusto(propostaId);
        
        if (propostaId) {
            // Buscar a proposta pelo ID na lista carregada
            const proposta = listaPropostas.find(p => 
                p.id && p.id.toString() === propostaId.toString()
            );
            console.log("Proposta encontrada na lista:", proposta);
            
            if (proposta) {
                setPropostaSelecionada(proposta);
            } else {
                console.warn("Proposta não encontrada na lista com ID:", propostaId);
                console.log("Lista de propostas disponíveis:", listaPropostas);
                setPropostaSelecionada(null);
            }
        } else {
            setPropostaSelecionada(null);
        }
    };

    const handleGerarPedido = async () => {
        try {
            console.log("Iniciando processo de geração de pedido de serviço...");
            
            // Função para formatar e limitar valores numéricos
            const formatarValorNumerico = (valor) => {
                if (typeof valor === 'string') {
                    // Remover símbolos de moeda e substituir vírgula por ponto
                    valor = valor.replace(/[^\d,-]/g, '').replace(',', '.');
                }
                
                // Converter para número
                let numero = parseFloat(valor);
                
                // Verificar se é um número válido
                if (isNaN(numero)) {
                    console.warn('Valor não numérico encontrado:', valor);
                    return 0;
                }
                
                // Limitar o tamanho para evitar numeric overflow (assumindo campo numeric(10,2))
                // Máximo: 99.999.999,99
                numero = Math.min(numero, 99999999.99);
                
                // Retornar com precisão fixa
                return numero;
            };
            
            const totalBruto = formatarValorNumerico(calcularTotalBruto());
            const ipiTotal = formatarValorNumerico(calcularTotalIPI());
            const totalDescontos = formatarValorNumerico(calcularTotalDescontos());
            const totalFinal = formatarValorNumerico(calcularTotalFinal());
            const valorFrete = formatarValorNumerico(dadosPedido.valorFrete);
            const outrasDespesas = formatarValorNumerico(dadosPedido.outrasDespesas);

            console.log("Valores calculados e formatados:", {
                totalBruto,
                ipiTotal,
                totalDescontos,
                totalFinal,
                valorFrete,
                outrasDespesas
            });

            // Obtém valores dos campos adicionais específicos para serviços
            const escopoContratacao = document.querySelector('[name="escopoContratacao"]')?.value || '';
            const respContratada = document.querySelector('[name="respContratada"]')?.value || '';
            const respContratante = document.querySelector('[name="respContratante"]')?.value || '';

            // Formatar o pedido de serviço no formato esperado pelo backend
            const pedidoServico = {
                fornecedor_id: parseInt(fornecedorId) || 0,
                data_vencimento: document.querySelector('[name="dataVencto"]')?.value || new Date().toISOString().split('T')[0],
                proposta_id: parseInt(centroCusto) || null,
                itens: {
                    materiais: itens.map((item, index) => {
                        const quantidade = formatarValorNumerico(item.quantidade);
                        const ipi = formatarValorNumerico(item.ipi);
                        const valorUnitario = formatarValorNumerico(item.valorUnitario);
                        const valorTotal = formatarValorNumerico(item.valorTotal);
                        const desconto = formatarValorNumerico(item.desconto);
                        
                        return {
                            item: index + 1,
                            descricao: item.descricao || '',
                            unidade: item.unidade || '',
                            quantidade,
                            ipi,
                            valor_unitario: valorUnitario,
                            valor_total: valorTotal,
                            desconto,
                            previsao_entrega: item.previsaoEntrega || new Date().toISOString().split('T')[0]
                        };
                    }),
                    total_bruto: totalBruto,
                    total_ipi: ipiTotal,
                    total_descontos: totalDescontos,
                    valor_frete: valorFrete,
                    outras_despesas: outrasDespesas,
                    total_final: totalFinal,
                    frete: dadosPedido.frete || 'CIF',
                    condicao_pagamento: dadosPedido.condPagto || '30',
                    informacoes_importantes: dadosPedido.informacoesImportantes || '',
                    escopo_contratacao: escopoContratacao,
                    responsabilidade_contratada: respContratada.split(/\r?\n/).filter(item => item.trim() !== ''),
                    responsabilidade_contratante: respContratante.split(/\r?\n/).filter(item => item.trim() !== '')
                }
            };

            console.log("Dados formatados para envio:", pedidoServico);

            // Chamar o método específico para criar pedido de serviço
            const resultado = await ApiService.criarPedidoServico(pedidoServico);
            
            // Exibir popup de sucesso
            const successPopup = document.createElement('div');
            successPopup.className = 'success-popup';
            successPopup.innerHTML = `
                <div class="success-popup-content">
                    <h3>Pedido de Serviço Gerado com Sucesso!</h3>
                    <p>O pedido foi criado com o ID: ${resultado.id || 'N/A'}</p>
                    <div class="success-buttons">
                        <button id="closeSuccessPopup">Fechar</button>
                        <button id="viewPdfButton">Visualizar PDF</button>
                    </div>
                </div>
            `;
            document.body.appendChild(successPopup);
            
            // Adicionar evento para fechar o popup
            document.getElementById('closeSuccessPopup').addEventListener('click', () => {
                document.body.removeChild(successPopup);
            });
            
            // Adicionar evento para visualizar o PDF
            if (resultado && resultado.id) {
                document.getElementById('viewPdfButton').addEventListener('click', async () => {
                    try {
                        await ApiService.visualizarPedidoServicoPdf(resultado.id);
                    } catch (error) {
                        console.error('Erro ao visualizar PDF:', error);
                        alert('Erro ao visualizar o PDF. Tente novamente mais tarde.');
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao gerar pedido:', error);
            alert('Erro ao gerar pedido. Por favor, tente novamente. Detalhes: ' + error.message);
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
                                    readOnly
                                    placeholder="Automático"
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
                                    type="date"
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