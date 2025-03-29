import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CadastrarFuncionario.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function CadastrarFuncionario() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cargo: '',
        contato: {
            nome: '',
            email: '',
            telefone: '',
            endereco: ''
        },
        dados: {
            cpf: '',
            rg: '',
            data_nascimento: '',
            banco: '',
            agencia: '',
            conta: '',
            pix: ''
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContatoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contato: {
                ...prev.contato,
                [name]: value
            }
        }));
    };

    const handleDadosChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            dados: {
                ...prev.dados,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await ApiService.criarFuncionario(formData);
            console.log('Funcionário cadastrado:', response);
            setSuccess(true);
            
            // Limpar o formulário
            setFormData({
                cargo: '',
                contato: {
                    nome: '',
                    email: '',
                    telefone: '',
                    endereco: ''
                },
                dados: {
                    cpf: '',
                    rg: '',
                    data_nascimento: '',
                    banco: '',
                    agencia: '',
                    conta: '',
                    pix: ''
                }
            });
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/consultarFuncionarios');
            }, 2000);
        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            setError(error.message || 'Ocorreu um erro ao cadastrar o funcionário.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="cadastrar-funcionario-container">
                <h2>Cadastrar Funcionário</h2>
                
                {success && (
                    <div className="success-message">
                        Funcionário cadastrado com sucesso! Redirecionando...
                    </div>
                )}
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Informações Profissionais</h3>
                        <div className="form-group">
                            <label htmlFor="cargo">Cargo/Função*</label>
                            <input
                                type="text"
                                id="cargo"
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Informações de Contato</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nome">Nome Completo*</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.contato.nome}
                                    onChange={handleContatoChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">E-mail</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.contato.email}
                                    onChange={handleContatoChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="telefone">Telefone*</label>
                                <input
                                    type="text"
                                    id="telefone"
                                    name="telefone"
                                    value={formData.contato.telefone}
                                    onChange={handleContatoChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="endereco">Endereço</label>
                                <input
                                    type="text"
                                    id="endereco"
                                    name="endereco"
                                    value={formData.contato.endereco}
                                    onChange={handleContatoChange}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Informações Pessoais e Bancárias</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="cpf">CPF*</label>
                                <input
                                    type="text"
                                    id="cpf"
                                    name="cpf"
                                    value={formData.dados.cpf}
                                    onChange={handleDadosChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="rg">RG</label>
                                <input
                                    type="text"
                                    id="rg"
                                    name="rg"
                                    value={formData.dados.rg}
                                    onChange={handleDadosChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="data_nascimento">Data de Nascimento</label>
                                <input
                                    type="date"
                                    id="data_nascimento"
                                    name="data_nascimento"
                                    value={formData.dados.data_nascimento}
                                    onChange={handleDadosChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="banco">Banco</label>
                                <input
                                    type="text"
                                    id="banco"
                                    name="banco"
                                    value={formData.dados.banco}
                                    onChange={handleDadosChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="agencia">Agência</label>
                                <input
                                    type="text"
                                    id="agencia"
                                    name="agencia"
                                    value={formData.dados.agencia}
                                    onChange={handleDadosChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="conta">Conta</label>
                                <input
                                    type="text"
                                    id="conta"
                                    name="conta"
                                    value={formData.dados.conta}
                                    onChange={handleDadosChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pix">Chave PIX</label>
                                <input
                                    type="text"
                                    id="pix"
                                    name="pix"
                                    value={formData.dados.pix}
                                    onChange={handleDadosChange}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-buttons">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => navigate('/dashboard')}
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

export default CadastrarFuncionario; 