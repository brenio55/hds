import React, { useState, useEffect } from 'react';
import { formatCNPJ, formatCEP, formatTelefone } from '../utils/formatters';
import HeaderAdmin from './HeaderAdmin';
import './pedidos.scss';
import ApiService from '../services/ApiService';

// Estilos para o popup de sucesso
const styles = `
.success-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.success-popup-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    max-width: 400px;
    text-align: center;
}

.success-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
}

.success-buttons button {
    min-width: 120px;
    height: 35px;
    font-size: 14px;
    border-radius: 3px;
}

#viewPdfButton {
    background-color: #4284c5;
}

#viewPdfButton:hover {
    background-color: #3573b0;
}
`;

function PedidosDeMaterial() {
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
        valorFrete: '0',
        outrasDespesas: '0,00',
        informacoesImportantes: '',
        condPagto: '30',
        prazoEntrega: '',
        frete: 'CIF'
    });
    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [loadingListaFornecedores, setLoadingListaFornecedores] = useState(false);
    const [listaPropostas, setListaPropostas] = useState([]);
    const [loadingPropostas, setLoadingPropostas] = useState(false);
    const [centroCusto, setCentroCusto] = useState('');
    const [propostaSelecionada, setPropostaSelecionada] = useState(null);
    // Novos estados para controlar o carregamento dos botões
    const [loadingGerarPedido, setLoadingGerarPedido] = useState(false);
    const [loadingVisualizarPdf, setLoadingVisualizarPdf] = useState(false);

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
        centroCusto: '1'
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

    useEffect(() => {
        // Adiciona os estilos apenas se eles ainda não existirem
        if (!document.getElementById('material-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'material-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
            
            // Limpar estilos ao desmontar o componente
            return () => {
                const styleElement = document.getElementById('material-styles');
                if (styleElement) {
                    document.head.removeChild(styleElement);
                }
            };
        }
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
            console.log("Iniciando carregamento de propostas...");
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
            console.error('Erro ao carregar propostas:', error);
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

    const calcularTotalIPI = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            const ipi = parseFloat(item.ipi.toString().replace(',', '.')) || 0;
            const valorIPI = valorTotal * (ipi / 100);
            total += valorIPI;
        });
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalDescontos = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            const ipi = parseFloat(item.ipi.toString().replace(',', '.')) || 0;
            const valorIPI = valorTotal * (ipi / 100);
            const desconto = parseFloat(item.desconto.toString().replace(',', '.')) || 0;
            // Calcular desconto sobre (PRODUTOS + IPI)
            const descontoValor = (valorTotal + valorIPI) * (desconto / 100);
            total += descontoValor;
        });
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalBruto = () => {
        let total = 0;
        itens.forEach(item => {
            const valorTotal = parseFloat(item.valorTotal.toString().replace(',', '.')) || 0;
            total += valorTotal;
        });
        return total.toFixed(2).replace('.', ',');
    };

    const calcularTotalFinal = () => {
        const totalBruto = parseFloat(calcularTotalBruto().replace(',', '.'));
        const ipiTotal = parseFloat(calcularTotalIPI().replace(',', '.'));
        const totalDescontos = parseFloat(calcularTotalDescontos().replace(',', '.'));
        const frete = parseFloat(dadosPedido.valorFrete.replace(',', '.')) || 0;
        const outras = parseFloat(dadosPedido.outrasDespesas.replace(',', '.')) || 0;

        // (PRODUTOS + IPI) + OUTRAS DESPESAS + FRETE - DESCONTO
        const total = (totalBruto + ipiTotal) + outras + frete - totalDescontos;
        return total.toFixed(2).replace('.', ',');
    };

    const handleGerarPedido = async () => {
        try {
            console.log("Iniciando processo de geração de pedido de material...");
            setLoadingGerarPedido(true);

            // Validação dos campos obrigatórios
            if (!fornecedorId) {
                alert('Erro: Código do Fornecedor é obrigatório.');
                return;
            }
            
            if (!centroCusto) {
                alert('Erro: Centro de Custo (Proposta) é obrigatório.');
                return;
            }
            
            if (itens.length === 0) {
                alert('Erro: Pelo menos um item deve ser adicionado ao pedido.');
                return;
            }

            // Função para formatar e limitar valores numéricos
            const formatarValorNumerico = (valor) => {
                if (valor === undefined || valor === null) {
                    return 0;
                }
                
                if (typeof valor === 'string') {
                    // Remover todos os caracteres que não são dígitos, vírgulas ou pontos
                    valor = valor.replace(/[^\d,-]/g, '').replace(',', '.');
                }
                
                const numero = parseFloat(valor);
                if (isNaN(numero)) {
                    console.warn('Valor não numérico encontrado:', valor);
                    return 0;
                }
                
                // Limitar o valor para evitar overflow
                return Math.min(numero, 99999999.99);
            };

            // Calcular totais com precisão
            const totalBruto = formatarValorNumerico(calcularTotalBruto());
            const ipiTotal = formatarValorNumerico(calcularTotalIPI());
            const totalDescontos = formatarValorNumerico(calcularTotalDescontos());
            const totalFinal = formatarValorNumerico(calcularTotalFinal());
            const valorFrete = formatarValorNumerico(dadosPedido.valorFrete);
            const outrasDespesas = formatarValorNumerico(dadosPedido.outrasDespesas);

            // Formatar os itens para o formato esperado pelo backend
            const itensFormatados = itens.map((item, index) => {
                const valorTotal = formatarValorNumerico(item.valorTotal);
                const ipi = formatarValorNumerico(item.ipi);
                const valorIPI = valorTotal * (ipi / 100);
                const desconto = formatarValorNumerico(item.desconto);
                // Cálculo do valor final com a fórmula correta
                const descontoValor = (valorTotal + valorIPI) * (desconto / 100);
                const valorFinalItem = valorTotal + valorIPI - descontoValor;
                
                return {
                    item: index + 1,
                    descricao: item.descricao || '',
                    unidade: item.unidade || '',
                    quantidade: formatarValorNumerico(item.quantidade),
                    ipi: ipi,
                    valor_unitario: formatarValorNumerico(item.valorUnitario),
                    valor_total: valorTotal,
                    desconto: desconto,
                    valor_final: valorFinalItem, // Adicionando valor final calculado
                    previsao_entrega: item.previsaoEntrega || new Date().toISOString().split('T')[0]
                };
            });

            // Garantir que clientinfo_id seja um número válido
            let clientinfoId = null;
            if (propostaSelecionada?.client_info?.id) {
                const idValue = parseInt(propostaSelecionada.client_info.id);
                if (!isNaN(idValue)) {
                    clientinfoId = idValue;
                }
            } else if (propostaSelecionada?.id) {
                // Se não tiver client_info, tenta usar o ID da proposta conforme solicitado
                clientinfoId = parseInt(propostaSelecionada.id);
            }

            // O backend espera um objeto com todos os dados do pedido
            const pedidoData = {
                fornecedores_id: parseInt(fornecedorId),
                clientinfo_id: clientinfoId,
                ddl: dadosPedido.condPagto || '30',
                data_vencimento: document.querySelector('[name="dataVencto"]')?.value || new Date().toISOString().split('T')[0],
                proposta_id: parseInt(centroCusto),
                // Enviando materiais como array (o backend vai converter conforme necessário)
                materiais: itensFormatados.map(item => ({
                    item: item.item,
                    descricao: item.descricao,
                    unidade: item.unidade,
                    quantidade: item.quantidade,
                    ipi: item.ipi,
                    valor_unitario: item.valor_unitario,
                    valor_total: item.valor_total,
                    desconto: item.desconto,
                    previsao_entrega: item.previsao_entrega
                })),
                desconto: totalDescontos,
                valor_frete: valorFrete,
                despesas_adicionais: outrasDespesas,
                dados_adicionais: dadosPedido.informacoesImportantes || '',
                frete: { tipo: dadosPedido.frete || 'CIF' }
            };

            console.log("Dados formatados para envio ao backend:", pedidoData);

            // Chamar o método para criar pedido de compra
            const resultado = await ApiService.criarPedido(pedidoData);

            console.log("Resultado da criação do pedido:", resultado);
            
            // Exibir popup de sucesso
            const successPopup = document.createElement('div');
            successPopup.className = 'success-popup';
            successPopup.innerHTML = `
                <div class="success-popup-content">
                    <h3>Pedido de Material Gerado com Sucesso!</h3>
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
                const viewPdfButton = document.getElementById('viewPdfButton');
                viewPdfButton.addEventListener('click', async () => {
                    try {
                        // Desabilitar o botão e mostrar o spinner
                        viewPdfButton.disabled = true;
                        viewPdfButton.innerHTML = `
                            <span class="spinner"></span>
                            Carregando PDF...
                        `;
                        
                        await ApiService.visualizarPedidoPdf(resultado.id);
                    } catch (error) {
                        console.error('Erro ao visualizar PDF de material:', error);
                        alert('Erro ao visualizar o PDF. Tente novamente mais tarde.');
                        
                        // Restaurar o botão em caso de erro
                        viewPdfButton.disabled = false;
                        viewPdfButton.innerHTML = 'Visualizar PDF';
                    }
                });
            }

        } catch (error) {
            console.error('Erro ao gerar pedido de material:', error);
            alert('Erro ao gerar pedido de material. Por favor, verifique os dados e tente novamente. Detalhes: ' + error.message);
        } finally {
            setLoadingGerarPedido(false);
        }
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
        const rawValue = e.target.value.replace(/\D/g, '');
        setCnpj(formatCNPJ(rawValue));
    };

    const handleCEPChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setCep(formatCEP(rawValue));
    };

    const handleContatoChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setContato(formatTelefone(rawValue));
    };

    const handleFornecedorIdChange = async (e) => {
        const id = e.target.value;
        setFornecedorId(id);
        
        if (id && id.trim() !== '') {
            setLoadingFornecedor(true);
            setErrorFornecedor('');
            
            try {
                console.log(`Buscando detalhes do fornecedor com ID: ${id}`);
                const fornecedor = await ApiService.buscarFornecedorPorId(id);
                console.log("Resposta da API:", fornecedor);
                
                // Verificar se o fornecedor foi encontrado
                if (fornecedor && fornecedor.id) {
                    console.log("Fornecedor encontrado, atualizando campos do formulário");
                    // Preencher os campos com os dados do fornecedor
                    setFornecedorNome(fornecedor.razao_social || '');
                    setCnpj(formatCNPJ(fornecedor.cnpj || ''));
                    setEndereco(fornecedor.endereco || '');
                    setCep(formatCEP(fornecedor.cep || ''));
                    setContato(formatTelefone(fornecedor.telefone || fornecedor.celular || ''));
                    setErrorFornecedor(''); // Garantir que não há mensagem de erro
                } else {
                    console.warn(`Fornecedor com ID ${id} não encontrado ou resposta inválida`);
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        await handleGerarPedido();
    };

    return (
        <>
            <HeaderAdmin />
            <div className="pedidos-container">
                <h2>Gerar Pedido de Material</h2>
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
                            <label>Condição de Pagamento (DDL):</label>
                            <input 
                                type="number" 
                                name="condPagto" 
                                value={dadosPedido.condPagto} 
                                onChange={handleDadosPedidoChange} 
                                placeholder="30"
                            />
                        </div>
                    </div>
                    <div className="form-row">
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
                    <div className="form-row">
                        <div className="form-group">
                            <label>Valor do Frete:</label>
                            <input 
                                type="text" 
                                name="valorFrete" 
                                value={dadosPedido.valorFrete} 
                                onChange={handleDadosPedidoChange} 
                                placeholder="0,00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Outras Despesas:</label>
                            <input 
                                type="text" 
                                name="outrasDespesas" 
                                value={dadosPedido.outrasDespesas} 
                                onChange={handleDadosPedidoChange} 
                                placeholder="0,00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Total Final:</label>
                            <input type="text" value={calcularTotalFinal()} readOnly />
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
                                <label>Total Produtos:</label>
                                <input type="text" value={calcularTotalBruto()} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Total IPI:</label>
                                <input type="text" value={calcularTotalIPI()} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Total Descontos (sobre Produtos + IPI):</label>
                                <input type="text" value={calcularTotalDescontos()} readOnly />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Total Final:</label>
                                <input type="text" value={calcularTotalFinal()} readOnly title="(Produtos + IPI) + Outras Despesas + Frete - Descontos" />
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

                    <div className="dev-mode-toggle">
                        <label>
                            <input
                                type="checkbox"
                                checked={devMode}
                                onChange={(e) => setDevMode(e.target.checked)}
                            />
                            Modo de Desenvolvimento
                        </label>
                    </div>

                    <button type="submit" disabled={loadingGerarPedido}>
                        {loadingGerarPedido ? (
                            <>
                                <span className="spinner"></span>
                                Gerando Pedido...
                            </>
                        ) : (
                            'Gerar Pedido'
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}

export default PedidosDeMaterial; 