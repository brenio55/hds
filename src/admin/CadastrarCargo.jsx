import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';
import './CadastrarCargo.css';

function CadastrarCargo() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        valor_hh: ''
    });

    // Carregar dados do cargo se for edição
    useEffect(() => {
        if (id) {
            carregarCargo(id);
        }
    }, [id]);

    const carregarCargo = async (cargoId) => {
        setLoading(true);
        try {
            const cargo = await ApiService.buscarCargoPorId(cargoId);
            setFormData({
                nome: cargo.nome || '',
                descricao: cargo.descricao || '',
                valor_hh: cargo.valor_hh || ''
            });
        } catch (error) {
            console.error('Erro ao carregar cargo:', error);
            setError('Não foi possível carregar os dados do cargo. ' + error.message);
        } finally {
            setLoading(false);
        }
    };

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
        setSuccess(false);

        // Validar campos obrigatórios
        if (!formData.nome || !formData.valor_hh) {
            setError('Nome e Valor do HH são campos obrigatórios.');
            setLoading(false);
            return;
        }

        // Validar valor do HH como numérico
        const valorHH = parseFloat(formData.valor_hh.replace(',', '.'));
        if (isNaN(valorHH) || valorHH <= 0) {
            setError('O Valor do HH deve ser um número positivo.');
            setLoading(false);
            return;
        }

        // Preparar dados com valor formatado
        const dadosEnvio = {
            ...formData,
            valor_hh: valorHH
        };

        try {
            if (id) {
                // Atualização de cargo existente
                await ApiService.atualizarCargo(id, dadosEnvio);
                setSuccess('Cargo atualizado com sucesso!');
            } else {
                // Criação de novo cargo
                await ApiService.criarCargo(dadosEnvio);
                setSuccess('Cargo cadastrado com sucesso!');
            }

            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/consultarCargos');
            }, 2000);
        } catch (error) {
            console.error('Erro ao salvar cargo:', error);
            setError(error.message || 'Ocorreu um erro ao salvar o cargo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="cadastrar-cargo-container">
                <h2>{id ? 'Editar Cargo' : 'Cadastrar Cargo'}</h2>
                
                {success && (
                    <div className="success-message">
                        {success} Redirecionando...
                    </div>
                )}
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="loading">Carregando...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nome">Nome do Cargo *</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                                required
                                placeholder="Ex: Engenheiro, Pedreiro, Eletricista"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="descricao">Descrição</label>
                            <textarea
                                id="descricao"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleInputChange}
                                placeholder="Descreva as responsabilidades do cargo"
                                rows={4}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="valor_hh">Valor do HH (R$) *</label>
                            <input
                                type="text"
                                id="valor_hh"
                                name="valor_hh"
                                value={formData.valor_hh}
                                onChange={handleInputChange}
                                required
                                placeholder="Ex: 25,00"
                            />
                            <div className="info-box">
                                <h4>Valores calculados automaticamente</h4>
                                <p><strong>HH Normal:</strong> R$ {formData.valor_hh ? (parseFloat(formData.valor_hh.replace(',', '.')) * 1).toFixed(2).replace('.', ',') : '0,00'}</p>
                                <p><strong>HH + 60%:</strong> R$ {formData.valor_hh ? (parseFloat(formData.valor_hh.replace(',', '.')) * 1.6).toFixed(2).replace('.', ',') : '0,00'}</p>
                                <p><strong>HH + 100%:</strong> R$ {formData.valor_hh ? (parseFloat(formData.valor_hh.replace(',', '.')) * 2).toFixed(2).replace('.', ',') : '0,00'}</p>
                                <p className="info-note">Estes valores serão utilizados nos cálculos de horas trabalhadas.</p>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => navigate('/consultarCargos')}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : id ? 'Atualizar Cargo' : 'Cadastrar Cargo'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

export default CadastrarCargo; 