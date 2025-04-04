import React, { useState } from 'react';
import HeaderAdmin from './HeaderAdmin';
import './GerarPropostas.scss';
import ApiService from '../services/ApiService';
import { useAdmin } from '../contexts/AdminContext';

// Componente do Popup
const SuccessPopup = ({ onClose, propostaData }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            await ApiService.downloadPdf(propostaData.id, propostaData.versao);
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
                        className="btn-view-pdf"
                        disabled={downloading}
                    >
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
        const items = value.split('\n').filter(item => item.trim());
        setFormData(prev => ({
            ...prev,
            [field]: items
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dadosProposta = {
                ...formData,
                user_id: user.id
            };
            
            const response = await ApiService.criarProposta(dadosProposta);
            setSuccessData(response); // Armazena os dados da proposta para o popup
        } catch (error) {
            alert('Erro ao gerar proposta: ' + error.message);
        }
    };

    return (
        <div className="proposta-page">
            <HeaderAdmin />
            <div className="proposta-container">
                <div className="proposta-header">
                    <h1>Nova Proposta</h1>
                    <button type="button" className="preview-button">
                        Visualizar Proposta
                    </button>
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
                                    <div className="search-group">
                                        <input
                                            type="text"
                                            name="client_info.nome"
                                            value={formData.client_info.nome}
                                            onChange={handleInputChange}
                                            placeholder="Nome do cliente..."
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowClientSearch(!showClientSearch)}
                                            className="icon-button search"
                                        >
                                            Buscar Cliente 🔍
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        name="descricao"
                                        value={formData.descricao}
                                        onChange={handleInputChange}
                                        placeholder="Descrição da proposta"
                                        className="full-width"
                                        required
                                    />
                                    <input
                                        type="date"
                                        name="data_emissao"
                                        value={formData.data_emissao}
                                        onChange={handleInputChange}
                                        required
                                    />
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
                                    name="documento_text"
                                    value={formData.documento_text}
                                    onChange={handleInputChange}
                                    placeholder="Texto do documento..."
                                    rows="6"
                                />
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Especificações HTML</h2>
                                </div>
                                <textarea
                                    name="especificacoes_html"
                                    value={formData.especificacoes_html}
                                    onChange={handleInputChange}
                                    placeholder="Especificações em HTML..."
                                    rows="6"
                                    required
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
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowPreviousItems(!showPreviousItems)}
                                            className="icon-button"
                                        >
                                            Buscar Itens Cadastrados Previamente 📋
                                        </button>
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
                                />
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