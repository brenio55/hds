import React, { useState } from 'react';
import HeaderAdmin from './HeaderAdmin';
import './GerarPropostas.scss';
import axios from 'axios';

function GerarPropostas() {
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showPreviousItems, setShowPreviousItems] = useState(false);
    const [formData, setFormData] = useState({
        cliente: '',
        titulo: '',
        escopoTecnico: '',
        descricaoItens: '',
        fornecimentoHds: '',
        fornecimentoCliente: '',
        itensNaoInclusos: '',
        valores: '',
        condicoesPagamento: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/propo`, formData);
            if (response.status === 200) {
                alert('Proposta gerada com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao gerar proposta:', error);
            alert('Erro ao gerar proposta. Por favor, tente novamente.');
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
                                            name="cliente"
                                            value={formData.cliente}
                                            onChange={handleInputChange}
                                            placeholder="Buscar cliente..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowClientSearch(!showClientSearch)}
                                            className="icon-button search"
                                        >
                                            🔍
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleInputChange}
                                        placeholder="Título da proposta"
                                        className="full-width"
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Escopo Técnico</h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowImageUpload(!showImageUpload)}
                                        className="icon-button"
                                    >
                                        📎
                                    </button>
                                </div>
                                <textarea
                                    name="escopoTecnico"
                                    value={formData.escopoTecnico}
                                    onChange={handleInputChange}
                                    placeholder="Descreva o escopo técnico do projeto..."
                                    rows="6"
                                />
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Descrição dos Itens</h2>
                                </div>
                                <textarea
                                    name="descricaoItens"
                                    value={formData.descricaoItens}
                                    onChange={handleInputChange}
                                    placeholder="Liste os itens (A, B, C...)"
                                    rows="6"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="right-column">
                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Fornecimentos</h2>
                                </div>
                                <div className="fornecimentos-grid">
                                    <div className="fornecimento-group">
                                        <label>HDS</label>
                                        <textarea
                                            name="fornecimentoHds"
                                            value={formData.fornecimentoHds}
                                            onChange={handleInputChange}
                                            placeholder="Fornecimentos HDS"
                                            rows="4"
                                        />
                                    </div>
                                    <div className="fornecimento-group">
                                        <label>Cliente</label>
                                        <div className="fornecimento-cliente">
                                            <textarea
                                                name="fornecimentoCliente"
                                                value={formData.fornecimentoCliente}
                                                onChange={handleInputChange}
                                                placeholder="Fornecimentos do cliente"
                                                rows="4"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPreviousItems(!showPreviousItems)}
                                                className="icon-button"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Itens Não Inclusos</h2>
                                </div>
                                <textarea
                                    name="itensNaoInclusos"
                                    value={formData.itensNaoInclusos}
                                    onChange={handleInputChange}
                                    placeholder="Liste os itens não inclusos"
                                    rows="4"
                                />
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Valores e Pagamento</h2>
                                </div>
                                <textarea
                                    name="valores"
                                    value={formData.valores}
                                    onChange={handleInputChange}
                                    placeholder="Especifique os valores"
                                    rows="3"
                                />
                                <input
                                    type="text"
                                    name="condicoesPagamento"
                                    value={formData.condicoesPagamento}
                                    onChange={handleInputChange}
                                    placeholder="Condições de pagamento"
                                    className="full-width"
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
        </div>
    );
}

export default GerarPropostas;