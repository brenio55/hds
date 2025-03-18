import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CadastrarFornecedor.css'; // Reutilizamos o mesmo CSS
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function EditarFornecedor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        razao_social: '',
        cnpj: '',
        inscricao_estadual: '',
        inscricao_municipal: '',
        telefone: '',
        celular: '',
        endereco: '',
        cep: '',
        municipio_uf: '',
        email: '',
        contato: '',
        obs: ''
    });

    useEffect(() => {
        const fetchFornecedor = async () => {
            setFetchLoading(true);
            setError(null);
            
            try {
                const data = await ApiService.buscarFornecedorPorId(id);
                setFormData(data);
            } catch (error) {
                console.error('Erro ao buscar fornecedor:', error);
                setError('Erro ao carregar dados do fornecedor. Por favor, tente novamente.');
            } finally {
                setFetchLoading(false);
            }
        };

        fetchFornecedor();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await ApiService.atualizarFornecedor(id, formData);
            setSuccess('Fornecedor atualizado com sucesso!');
            
            // Redirecionar para a página de consulta após 2 segundos
            setTimeout(() => {
                navigate('/consultarFornecedores');
            }, 2000);
        } catch (error) {
            console.error('Erro ao atualizar fornecedor:', error);
            setError(error.message || 'Erro ao atualizar fornecedor. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <>
                <HeaderAdmin />
                <div className="cadastrar-fornecedor-container">
                    <h2>Editar Fornecedor</h2>
                    <div className="loading">Carregando dados do fornecedor...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <HeaderAdmin />
            <div className="cadastrar-fornecedor-container">
                <h2>Editar Fornecedor</h2>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="fornecedor-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="razao_social">Razão Social *</label>
                            <input
                                type="text"
                                id="razao_social"
                                name="razao_social"
                                value={formData.razao_social}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="cnpj">CNPJ *</label>
                            <input
                                type="text"
                                id="cnpj"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="inscricao_estadual">Inscrição Estadual</label>
                            <input
                                type="text"
                                id="inscricao_estadual"
                                name="inscricao_estadual"
                                value={formData.inscricao_estadual}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="inscricao_municipal">Inscrição Municipal</label>
                            <input
                                type="text"
                                id="inscricao_municipal"
                                name="inscricao_municipal"
                                value={formData.inscricao_municipal}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefone">Telefone *</label>
                            <input
                                type="text"
                                id="telefone"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="celular">Celular</label>
                            <input
                                type="text"
                                id="celular"
                                name="celular"
                                value={formData.celular}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="endereco">Endereço *</label>
                            <input
                                type="text"
                                id="endereco"
                                name="endereco"
                                value={formData.endereco}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cep">CEP *</label>
                            <input
                                type="text"
                                id="cep"
                                name="cep"
                                value={formData.cep}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="municipio_uf">Município/UF *</label>
                            <input
                                type="text"
                                id="municipio_uf"
                                name="municipio_uf"
                                value={formData.municipio_uf}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="contato">Contato *</label>
                            <input
                                type="text"
                                id="contato"
                                name="contato"
                                value={formData.contato}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="obs">Observações</label>
                            <textarea
                                id="obs"
                                name="obs"
                                value={formData.obs}
                                onChange={handleInputChange}
                                rows="4"
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => navigate('/consultarFornecedores')}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default EditarFornecedor; 