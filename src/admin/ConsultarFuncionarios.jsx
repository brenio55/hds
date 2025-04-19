import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsultarFuncionarios.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function ConsultarFuncionarios() {
    const navigate = useNavigate();
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    const carregarFuncionarios = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await ApiService.buscarFuncionarios();
            setFuncionarios(data);
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
            setError('Não foi possível carregar a lista de funcionários. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (id) => {
        navigate(`/editarFuncionario/${id}`);
    };

    const handleExcluir = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            setLoading(true);
            try {
                await ApiService.deletarFuncionario(id);
                await carregarFuncionarios();
            } catch (error) {
                console.error('Erro ao excluir funcionário:', error);
                setError('Não foi possível excluir o funcionário. Por favor, tente novamente.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerDetalhes = async (id) => {
        setLoading(true);
        try {
            const funcionario = await ApiService.buscarFuncionarioPorId(id);
            setFuncionarioSelecionado(funcionario);
            setShowModal(true);
        } catch (error) {
            console.error('Erro ao buscar detalhes do funcionário:', error);
            setError('Não foi possível carregar os detalhes do funcionário. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const fecharModal = () => {
        setShowModal(false);
        setFuncionarioSelecionado(null);
    };

    return (
        <>
            <HeaderAdmin />
            <div className="consultar-funcionarios-container">
                <h2>Consultar Funcionários</h2>
                
                <div className="header-actions">
                    <button className="new-button" onClick={() => navigate('/admin/cadastrarFuncionario')}>
                        Novo Funcionário
                    </button>
                    <button className="refresh-button" onClick={carregarFuncionarios} disabled={loading}>
                        {loading ? 'Atualizando...' : 'Atualizar'}
                    </button>
                </div>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="loading">Carregando funcionários...</div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Cargo</th>
                                    <th>Contato</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {funcionarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            Nenhum funcionário encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    funcionarios.map((funcionario) => {
                                        // Converter string JSON para objeto se necessário
                                        let contato = funcionario.contato;
                                        if (typeof contato === 'string') {
                                            try {
                                                contato = JSON.parse(contato);
                                            } catch (e) {
                                                console.error('Erro ao parsear contato:', e);
                                                contato = { nome: 'Erro ao carregar nome', email: '', telefone: '' };
                                            }
                                        }
                                        
                                        return (
                                            <tr key={funcionario.id}>
                                                <td>{funcionario.id}</td>
                                                <td>{contato?.nome || 'N/A'}</td>
                                                <td>{funcionario.cargo}</td>
                                                <td>{contato?.telefone || 'N/A'}</td>
                                                <td className="actions-column">
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => handleVerDetalhes(funcionario.id)}
                                                    >
                                                        Detalhes
                                                    </button>
                                                    {/* <button 
                                                        className="edit-button"
                                                        onClick={() => handleEditar(funcionario.id)}
                                                    >
                                                        Editar
                                                    </button> */}
                                                    <button 
                                                        className="delete-button"
                                                        onClick={() => handleExcluir(funcionario.id)}
                                                    >
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Modal para exibir detalhes do funcionário */}
                {showModal && funcionarioSelecionado && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Detalhes do Funcionário</h3>
                            
                            <div className="detail-section">
                                <h4>Informações Profissionais</h4>
                                <p><strong>ID:</strong> {funcionarioSelecionado.id}</p>
                                <p><strong>Cargo:</strong> {funcionarioSelecionado.cargo}</p>
                            </div>
                            
                            <div className="detail-section">
                                <h4>Contato</h4>
                                {typeof funcionarioSelecionado.contato === 'string' ? (
                                    (() => {
                                        try {
                                            const contato = JSON.parse(funcionarioSelecionado.contato);
                                            return (
                                                <>
                                                    <p><strong>Nome:</strong> {contato.nome || 'N/A'}</p>
                                                    <p><strong>E-mail:</strong> {contato.email || 'N/A'}</p>
                                                    <p><strong>Telefone:</strong> {contato.telefone || 'N/A'}</p>
                                                    <p><strong>Endereço:</strong> {contato.endereco || 'N/A'}</p>
                                                </>
                                            );
                                        } catch (e) {
                                            return <p>Erro ao carregar dados de contato</p>;
                                        }
                                    })()
                                ) : (
                                    <>
                                        <p><strong>Nome:</strong> {funcionarioSelecionado.contato?.nome || 'N/A'}</p>
                                        <p><strong>E-mail:</strong> {funcionarioSelecionado.contato?.email || 'N/A'}</p>
                                        <p><strong>Telefone:</strong> {funcionarioSelecionado.contato?.telefone || 'N/A'}</p>
                                        <p><strong>Endereço:</strong> {funcionarioSelecionado.contato?.endereco || 'N/A'}</p>
                                    </>
                                )}
                            </div>
                            
                            <div className="detail-section">
                                <h4>Dados Adicionais</h4>
                                {typeof funcionarioSelecionado.dados === 'string' ? (
                                    (() => {
                                        try {
                                            const dados = JSON.parse(funcionarioSelecionado.dados);
                                            return (
                                                <>
                                                    <p><strong>CPF:</strong> {dados.cpf || 'N/A'}</p>
                                                    <p><strong>RG:</strong> {dados.rg || 'N/A'}</p>
                                                    <p><strong>Data de Nascimento:</strong> {dados.data_nascimento || 'N/A'}</p>
                                                    <p><strong>Banco:</strong> {dados.banco || 'N/A'}</p>
                                                    <p><strong>Agência:</strong> {dados.agencia || 'N/A'}</p>
                                                    <p><strong>Conta:</strong> {dados.conta || 'N/A'}</p>
                                                    <p><strong>PIX:</strong> {dados.pix || 'N/A'}</p>
                                                </>
                                            );
                                        } catch (e) {
                                            return <p>Erro ao carregar dados adicionais</p>;
                                        }
                                    })()
                                ) : (
                                    <>
                                        <p><strong>CPF:</strong> {funcionarioSelecionado.dados?.cpf || 'N/A'}</p>
                                        <p><strong>RG:</strong> {funcionarioSelecionado.dados?.rg || 'N/A'}</p>
                                        <p><strong>Data de Nascimento:</strong> {funcionarioSelecionado.dados?.data_nascimento || 'N/A'}</p>
                                        <p><strong>Banco:</strong> {funcionarioSelecionado.dados?.banco || 'N/A'}</p>
                                        <p><strong>Agência:</strong> {funcionarioSelecionado.dados?.agencia || 'N/A'}</p>
                                        <p><strong>Conta:</strong> {funcionarioSelecionado.dados?.conta || 'N/A'}</p>
                                        <p><strong>PIX:</strong> {funcionarioSelecionado.dados?.pix || 'N/A'}</p>
                                    </>
                                )}
                            </div>
                            
                            <div className="modal-buttons">
                                <button className="close-button" onClick={fecharModal}>
                                    Fechar
                                </button>
                                <button 
                                    className="edit-button"
                                    onClick={() => {
                                        fecharModal();
                                        handleEditar(funcionarioSelecionado.id);
                                    }}
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ConsultarFuncionarios; 