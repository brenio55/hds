import React, { useState } from 'react';
import HeaderAdmin from '../../CommonComponents/HeaderAdmin';
import './GerarPropostas.scss';
import ApiService from '../../../services/ApiService';
import { useAdmin } from '../../../contexts/AdminContext';
import '../../../App.css';

// Componente do Popup
const SuccessPopup = ({ onClose, propostaData }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            await ApiService.downloadPropostaPdf(propostaData.id, propostaData.versao);
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            alert('Erro ao baixar PDF. Por favor, tente novamente.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Proposta Gerada com Sucesso!</h2>
                <div className="proposta-info">
                    <p><strong>ID da Proposta:</strong> {propostaData.id}</p>
                    <p><strong>Versão:</strong> {propostaData.versao}</p>
                    <p><strong>Hash do PDF:</strong> {propostaData.pdf_versions[propostaData.versao]}</p>
                </div>
                <div className="popup-buttons">
                    <button onClick={onClose} className="btn-ok">OK</button>
                    <button 
                        onClick={handleDownloadPDF} 
                        className={`btn-view-pdf ${downloading ? 'loading' : ''}`}
                        disabled={downloading}
                    >
                        {downloading && <span className="spinner"></span>}
                        {downloading ? 'Baixando...' : 'Download do PDF Gerado'}
                    </button>
                </div>
            </div>
        </div>
    );
};

function GerarPropostas() {
    const { adminUser: user } = useAdmin();
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showPreviousItems, setShowPreviousItems] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [formData, setFormData] = useState({
        descricao: '',
        data_emissao: new Date().toISOString().split('T')[0],
        client_info: {
            nome: '',
            cnpj: '',
            endereco: '',
            contato: ''
        },
        versao: '1.0',
        documento_text: '',
        especificacoes_html: '',
        afazer_hds: [],
        afazer_contratante: [],
        naofazer_hds: [],
        valor_final: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('client_info.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                client_info: {
                    ...prev.client_info,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleArrayInputChange = (e, field) => {
        const { value } = e.target;
        // Manter todos os itens, mesmo os vazios, para preservar linhas em branco
        const items = value.split('\n');
        setFormData(prev => ({
            ...prev,
            [field]: items
        }));
    };

    // Função para adicionar tags HTML ao texto selecionado
    const addHtmlTag = (tag) => {
        const textarea = document.getElementById('especificacoes-html');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let newText = '';
        
        switch(tag) {
            case 'bold':
                newText = `<strong>${selectedText}</strong>`;
                break;
            case 'italic':
                newText = `<em>${selectedText}</em>`;
                break;
            case 'ul':
                // Se não há texto selecionado, inserir template de lista
                if (start === end) {
                    newText = '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>';
                } else {
                    // Se há texto, presumir que cada linha é um item
                    const items = selectedText.split('\n').map(item => `  <li>${item.trim()}</li>`).join('\n');
                    newText = `<ul>\n${items}\n</ul>`;
                }
                break;
            case 'ol':
                // Se não há texto selecionado, inserir template de lista
                if (start === end) {
                    newText = '<ol>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ol>';
                } else {
                    // Se há texto, presumir que cada linha é um item
                    const items = selectedText.split('\n').map(item => `  <li>${item.trim()}</li>`).join('\n');
                    newText = `<ol>\n${items}\n</ol>`;
                }
                break;
            default:
                newText = selectedText;
        }

        const updatedText = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        setFormData(prev => ({
            ...prev,
            especificacoes_html: updatedText
        }));
        
        // Ajustar posição do cursor para depois do texto inserido
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + newText.length;
            textarea.selectionEnd = start + newText.length;
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Submetendo proposta com dados:", formData);
            
            // Garantir que os dados estejam no formato correto
            const dadosProposta = {
                ...formData,
                user_id: user?.id,
                // Garantir que valores numéricos sejam números
                valor_final: parseFloat(formData.valor_final.replace(/[^\d,.]/g, '').replace(',', '.')) || 0,
                // Garantir que arrays sejam realmente arrays
                afazer_hds: Array.isArray(formData.afazer_hds) ? formData.afazer_hds : [],
                afazer_contratante: Array.isArray(formData.afazer_contratante) ? formData.afazer_contratante : [],
                naofazer_hds: Array.isArray(formData.naofazer_hds) ? formData.naofazer_hds : [],
                // Garantir que os dados do cliente estejam presentes
                client_info: {
                    ...formData.client_info,
                    // Adicionar um ID temporário se não houver um
                    id: formData.client_info.id || `temp_${Date.now()}`
                }
            };
            
            console.log("Dados formatados para envio:", dadosProposta);
            
            // Enviar para a API
            const response = await ApiService.criarProposta(dadosProposta);
            console.log("Resposta da API ao criar proposta:", response);
            
            if (response && (response.id || response.proposta?.id)) {
                // Extrair ID da proposta da resposta
                const propostaId = response.id || response.proposta?.id;
                
                // Construir objeto com dados para o popup
                const dadosPropostaParaPopup = {
                    id: propostaId,
                    versao: response.versao || formData.versao || "1.0",
                    pdf_versions: response.pdf_versions || { "1.0": "gerado" }
                };
                
                setSuccessData(dadosPropostaParaPopup);
                
                // Limpar o formulário após sucesso
                setFormData({
                    descricao: '',
                    data_emissao: new Date().toISOString().split('T')[0],
                    client_info: {
                        nome: '',
                        cnpj: '',
                        endereco: '',
                        contato: ''
                    },
                    versao: '1.0',
                    documento_text: '',
                    especificacoes_html: '',
                    afazer_hds: [],
                    afazer_contratante: [],
                    naofazer_hds: [],
                    valor_final: ''
                });
            } else {
                throw new Error("Resposta da API não contém ID da proposta");
            }
        } catch (error) {
            console.error("Erro ao gerar proposta:", error);
            alert('Erro ao gerar proposta: ' + (error.message || "Erro desconhecido"));
        }
    };

    return (
        <div className="proposta-page">
            <HeaderAdmin />
            <div className="proposta-container pt-[var(--std-topSpace-navbar)] px-8 mx-auto">
                <div className="proposta-header">
                    <h1>Nova Proposta</h1>
                    {/* <button type="button" className="preview-button">
                        Visualizar Proposta
                    </button> */}
                </div>

                <form onSubmit={handleSubmit} className="proposta-form">
                    <div className="form-grid">
                        {/* Left Column */}
                        <div className="left-column">
                            <div className="form-section client-section">
                                <div className="section-header">
                                    <h2>Informações Básicas</h2>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="descricao">Descrição</label>
                                    <input
                                        type="text"
                                        name="descricao"
                                        value={formData.descricao}
                                        onChange={handleInputChange}
                                        placeholder="Descrição da proposta"
                                        className="full-width"
                                        required
                                    />
                                    <label htmlFor="data_emissao">Data de Emissão</label>
                                    <input
                                        type="date"
                                        name="data_emissao"
                                        value={formData.data_emissao}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <label htmlFor="versao">Versão</label>
                                    <input
                                        type="text"
                                        name="versao"
                                        value={formData.versao}
                                        onChange={handleInputChange}
                                        placeholder="Versão"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Especificações (com suporte para HTML)</h2>
                                    <div className="html-formatting-buttons">
                                        <button type="button" onClick={() => addHtmlTag('bold')} title="Negrito">B (negrito)</button>
                                        <button type="button" onClick={() => addHtmlTag('italic')} title="Itálico">I (itálico)</button>
                                        <button type="button" onClick={() => addHtmlTag('ul')} title="Lista não ordenada">• Lista</button>
                                        <button type="button" onClick={() => addHtmlTag('ol')} title="Lista ordenada">1. Lista</button>
                                    </div>
                                </div>
                                <textarea
                                    id="especificacoes-html"
                                    name="especificacoes_html"
                                    value={formData.especificacoes_html}
                                    onChange={handleInputChange}
                                    placeholder="Digite as especificações do projeto..."
                                    rows="6"
                                    required
                                    
                                />
                            </div>

                            <div className="form-section" disabled style={{opacity: '0.5', backgroundColor: 'lightgray'}} title='Esta função está desabilitada no momento, por favor, tente novamente em outro momento, ou contate a equipe de TI.'>
                                <div className="section-header">
                                    <h2>Documento</h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowImageUpload(!showImageUpload)}
                                        className="icon-button"
                                    >
                                        Anexar Arquivos📎
                                    </button>
                                </div>
                                <textarea
                                    style={{opacity: '0.5', backgroundColor: 'lightgray', border: '1px solid black'}}
                                    name="documento_text"
                                    value={formData.documento_text}
                                    onChange={handleInputChange}
                                    placeholder="Texto do documento..."
                                    rows="6"
                                    disabled
                                />
                            </div>
                        </div>
                        

                        {/* Right Column */}
                        <div className="right-column">
                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Informações do Cliente</h2>
                                </div>
                                <div className="client-info-grid">
                                    <div className="flex" style={{justifyContent: 'space-between'}}>
                                        <input
                                            type="text"
                                            name="client_info.nome"
                                            value={formData.client_info.nome}
                                            onChange={handleInputChange}
                                            placeholder="Nome do cliente..."
                                                required
                                            />
                                        <br></br>
                                        <div className="search-group" style={{width: 'unset'}}>
                                            {/* <button
                                                type="button"
                                                onClick={() => setShowClientSearch(!showClientSearch)}
                                                className="icon-button search"
                                            >
                                                Buscar Cliente 🔍
                                            </button> */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    alert("Esta função por este botão está desabilitada no momento, por favor, tente novamente em outro momento, ou contate a equipe de TI.")
                                                }}
                                                className="icon-button search"
                                            >
                                                Buscar Cliente 🔍
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        name="client_info.cnpj"
                                        value={formData.client_info.cnpj}
                                        onChange={handleInputChange}
                                        placeholder="CNPJ"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="client_info.endereco"
                                        value={formData.client_info.endereco}
                                        onChange={handleInputChange}
                                        placeholder="Endereço"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="client_info.contato"
                                        value={formData.client_info.contato}
                                        onChange={handleInputChange}
                                        placeholder="Contato"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Fornecimentos</h2>
                                </div>
                                <div className="fornecimentos-grid">
                                    <div className="fornecimento-group">
                                        <label>A fazer HDS</label>
                                        <textarea
                                            value={formData.afazer_hds.join('\n')}
                                            onChange={(e) => handleArrayInputChange(e, 'afazer_hds')}
                                            placeholder="Um item por linha..."
                                            rows="4"
                                            required
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.stopPropagation(); // Prevent form submission
                                                    // Preserve the default behavior of adding a new line
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="fornecimento-group">
                                        <label>A fazer Contratante</label>
                                        <div className="fornecimento-cliente">
                                            <textarea
                                                value={formData.afazer_contratante.join('\n')}
                                                onChange={(e) => handleArrayInputChange(e, 'afazer_contratante')}
                                                placeholder="Um item por linha..."
                                                rows="4"
                                                required
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.stopPropagation(); // Prevent form submission
                                                        // Preserve the default behavior of adding a new line
                                                    }
                                                }}
                                            />
                                        </div>
                                       
                                    </div>
                                </div>
                            </div>
                            

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Itens Não Inclusos</h2>
                                </div>
                                <textarea
                                    value={formData.naofazer_hds.join('\n')}
                                    onChange={(e) => handleArrayInputChange(e, 'naofazer_hds')}
                                    placeholder="Um item por linha..."
                                    rows="4"
                                    required
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.stopPropagation(); // Prevent form submission
                                            // Preserve the default behavior of adding a new line
                                        }
                                    }}
                                />
                                 {/* <button
                                            type="button"
                                            onClick={() => setShowPreviousItems(!showPreviousItems)}
                                            className="icon-button"
                                        >
                                            Buscar Itens Cadastrados Previamente 📋
                                </button> */}
                                <button
                                            type="button"
                                            onClick={() => {
                                                alert("Esta função por este botão está desabilitada no momento, por favor, tente novamente em outro momento, ou contate a equipe de TI.")
                                            }}
                                            className="icon-button"
                                        >
                                            Buscar Itens Cadastrados Previamente 📋
                                </button>
                            </div>

                            

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Valor Final</h2>
                                </div>
                                <input
                                    type="text"
                                    name="valor_final"
                                    value={formData.valor_final}
                                    onChange={handleInputChange}
                                    placeholder="Valor final da proposta"
                                    className="full-width"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-button">
                            Gerar Proposta
                        </button>
                    </div>
                </form>

                {/* Modals */}
                {showClientSearch && (
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Buscar Cliente</h2>
                                <button onClick={() => setShowClientSearch(false)} className="close-button">×</button>
                            </div>
                            <div className="modal-body">
                                <input type="text" placeholder="Busque por: Razão Social, Endereço ou CNPJ" className="search-input" />
                                <div className="search-results">
                                    {/* Results will be populated here */}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showImageUpload && (
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Anexar Imagens</h2>
                                <button onClick={() => setShowImageUpload(false)} className="close-button">×</button>
                            </div>
                            <div className="modal-body">
                                <div className="drop-zone">
                                    <p>Arraste e solte as imagens aqui ou clique para selecionar</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showPreviousItems && (
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Itens Previamente Cadastrados</h2>
                                <button onClick={() => setShowPreviousItems(false)} className="close-button">×</button>
                            </div>
                            <div className="modal-body">
                                <div className="items-list">
                                    {/* Items will be populated here */}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {successData && (
                <SuccessPopup 
                    onClose={() => setSuccessData(null)}
                    propostaData={successData}
                />
            )}
        </div>
    );
}

export default GerarPropostas;