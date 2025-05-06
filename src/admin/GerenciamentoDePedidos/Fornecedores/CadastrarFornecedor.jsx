import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastrarFornecedor.css';
import HeaderAdmin from '../../CommonComponents/HeaderAdmin';
import ApiService from '../../../services/ApiService';
import '../../../App.css';

function CadastrarFornecedor() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
            await ApiService.criarFornecedor(formData);
            setSuccess('Fornecedor cadastrado com sucesso!');
            
            // Limpar o formulário após o sucesso
            setFormData({
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
            
            // Redirecionar para a página de consulta após 2 segundos
            setTimeout(() => {
                navigate('/admin/consultarFornecedores');
            }, 2000);
        } catch (error) {
            console.error('Erro ao cadastrar fornecedor:', error);
            setError(error.message || 'Erro ao cadastrar fornecedor. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="cadastrar-fornecedor-container pt-[var(--std-topSpace-navbar)]">
                <h2>Cadastrar Fornecedor</h2>
                
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

export default CadastrarFornecedor; 