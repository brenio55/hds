import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './VisualizarFornecedor.css';
import HeaderAdmin from '../../CommonComponents/HeaderAdmin';
import ApiService from '../../../services/ApiService';

function VisualizarFornecedor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fornecedor, setFornecedor] = useState(null);

    useEffect(() => {
        const fetchFornecedor = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const data = await ApiService.buscarFornecedorPorId(id);
                setFornecedor(data);
            } catch (error) {
                console.error('Erro ao buscar fornecedor:', error);
                setError('Erro ao carregar dados do fornecedor. Por favor, tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchFornecedor();
    }, [id]);

    const formatarData = (dataString) => {
        if (!dataString) return '-';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    return (
        <>
            <HeaderAdmin />
            <div className="visualizar-fornecedor-container pt-[var(--std-topSpace-navbar)] px-8 mx-auto">
                <h2>Detalhes do Fornecedor</h2>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="loading">Carregando dados do fornecedor...</div>
                ) : fornecedor ? (
                    <div className="fornecedor-details">
                        <div className="detail-section">
                            <h3>Informações Gerais</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">ID:</span>
                                    <span className="detail-value">{fornecedor.id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Razão Social:</span>
                                    <span className="detail-value">{fornecedor.razao_social}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">CNPJ:</span>
                                    <span className="detail-value">{fornecedor.cnpj}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Inscrição Estadual:</span>
                                    <span className="detail-value">{fornecedor.inscricao_estadual || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Inscrição Municipal:</span>
                                    <span className="detail-value">{fornecedor.inscricao_municipal || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Data de Cadastro:</span>
                                    <span className="detail-value">{formatarData(fornecedor.created_at)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="detail-section">
                            <h3>Contato</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Telefone:</span>
                                    <span className="detail-value">{fornecedor.telefone}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Celular:</span>
                                    <span className="detail-value">{fornecedor.celular || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{fornecedor.email}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Contato:</span>
                                    <span className="detail-value">{fornecedor.contato}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="detail-section">
                            <h3>Endereço</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Endereço:</span>
                                    <span className="detail-value">{fornecedor.endereco}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">CEP:</span>
                                    <span className="detail-value">{fornecedor.cep}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Município/UF:</span>
                                    <span className="detail-value">{fornecedor.municipio_uf}</span>
                                </div>
                            </div>
                        </div>
                        
                        {fornecedor.obs && (
                            <div className="detail-section">
                                <h3>Observações</h3>
                                <div className="detail-text">
                                    {fornecedor.obs}
                                </div>
                            </div>
                        )}
                        
                        <div className="detail-actions">
                            <button 
                                className="back-button"
                                onClick={() => navigate('/consultarFornecedores')}
                            >
                                Voltar
                            </button>
                            <button 
                                className="edit-button"
                                onClick={() => navigate(`/editarFornecedor/${id}`)}
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="not-found">Fornecedor não encontrado</div>
                )}
            </div>
        </>
    );
}

export default VisualizarFornecedor; 