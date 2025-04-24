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
    const [registrosHH, setRegistrosHH] = useState([]);
    const [loadingHH, setLoadingHH] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // 'info' ou 'horas'
    const [novoRegistroHH, setNovoRegistroHH] = useState({
        obra_id: '',
        data_registro: new Date().toISOString().split('T')[0],
        horas_normais: '',
        horas_60: '',
        horas_100: '',
        observacao: ''
    });
    const [obras, setObras] = useState([]);
    const [loadingObras, setLoadingObras] = useState(false);

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
            
            // Carregar obras disponíveis
            carregarObras();
            
            // Carregar registros de horas do funcionário
            carregarRegistrosHH(id);
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

    const carregarObras = async () => {
        setLoadingObras(true);
        try {
            const response = await ApiService.buscarPropostas();
            setObras(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Erro ao carregar obras:', error);
        } finally {
            setLoadingObras(false);
        }
    };

    const carregarRegistrosHH = async (funcionarioId) => {
        setLoadingHH(true);
        try {
            const filtros = { funcionario_id: funcionarioId };
            const registros = await ApiService.buscarRegistrosHH(filtros);
            setRegistrosHH(registros);
        } catch (error) {
            console.error('Erro ao carregar registros de HH:', error);
        } finally {
            setLoadingHH(false);
        }
    };

    const handleNovoRegistroHHChange = (e) => {
        const { name, value } = e.target;
        setNovoRegistroHH(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitRegistroHH = async (e) => {
        e.preventDefault();
        if (!funcionarioSelecionado) return;
        
        setLoadingHH(true);
        try {
            const dadosRegistro = {
                ...novoRegistroHH,
                funcionario_id: funcionarioSelecionado.id
            };
            
            await ApiService.criarRegistroHH(dadosRegistro);
            
            // Resetar formulário
            setNovoRegistroHH({
                obra_id: '',
                data_registro: new Date().toISOString().split('T')[0],
                horas_normais: '',
                horas_60: '',
                horas_100: '',
                observacao: ''
            });
            
            // Recarregar registros
            await carregarRegistrosHH(funcionarioSelecionado.id);
        } catch (error) {
            console.error('Erro ao salvar registro de HH:', error);
            setError('Não foi possível salvar o registro de horas. Por favor, tente novamente.');
        } finally {
            setLoadingHH(false);
        }
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
                        <div className="modal-content funcionario-modal">
                            <h3>Detalhes do Funcionário</h3>
                            
                            {/* Tabs para alternar entre informações e horas trabalhadas */}
                            <div className="modal-tabs">
                                <button 
                                    className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('info')}
                                >
                                    Informações
                                </button>
                                <button 
                                    className={`tab-button ${activeTab === 'horas' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('horas')}
                                >
                                    Horas Trabalhadas
                                </button>
                            </div>
                            
                            {activeTab === 'info' ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    <div className="hh-section">
                                        <h4>Registrar Horas Trabalhadas</h4>
                                        <form onSubmit={handleSubmitRegistroHH} className="hh-form">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label htmlFor="obra_id">Obra/Centro de Custo*</label>
                                                    <select
                                                        id="obra_id"
                                                        name="obra_id"
                                                        value={novoRegistroHH.obra_id}
                                                        onChange={handleNovoRegistroHHChange}
                                                        required
                                                    >
                                                        <option value="">Selecione uma obra</option>
                                                        {loadingObras ? (
                                                            <option disabled>Carregando obras...</option>
                                                        ) : (
                                                            obras.map(obra => (
                                                                <option key={obra.id} value={obra.id}>
                                                                    {obra.numero} - {obra.cliente_nome || obra.nome || 'Sem nome'}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="data_registro">Data*</label>
                                                    <input
                                                        type="date"
                                                        id="data_registro"
                                                        name="data_registro"
                                                        value={novoRegistroHH.data_registro}
                                                        onChange={handleNovoRegistroHHChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label htmlFor="horas_normais">Horas Normais</label>
                                                    <input
                                                        type="number"
                                                        id="horas_normais"
                                                        name="horas_normais"
                                                        value={novoRegistroHH.horas_normais}
                                                        onChange={handleNovoRegistroHHChange}
                                                        step="0.5"
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="horas_60">Horas +60%</label>
                                                    <input
                                                        type="number"
                                                        id="horas_60"
                                                        name="horas_60"
                                                        value={novoRegistroHH.horas_60}
                                                        onChange={handleNovoRegistroHHChange}
                                                        step="0.5"
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="horas_100">Horas +100%</label>
                                                    <input
                                                        type="number"
                                                        id="horas_100"
                                                        name="horas_100"
                                                        value={novoRegistroHH.horas_100}
                                                        onChange={handleNovoRegistroHHChange}
                                                        step="0.5"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="observacao">Observação</label>
                                                <textarea
                                                    id="observacao"
                                                    name="observacao"
                                                    value={novoRegistroHH.observacao}
                                                    onChange={handleNovoRegistroHHChange}
                                                    placeholder="Observações sobre as horas trabalhadas"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="form-actions">
                                                <button 
                                                    type="submit" 
                                                    className="submit-button"
                                                    disabled={loadingHH}
                                                >
                                                    {loadingHH ? 'Salvando...' : 'Registrar Horas'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    
                                    <div className="hh-section">
                                        <h4>Histórico de Horas Trabalhadas</h4>
                                        {loadingHH ? (
                                            <p className="loading-text">Carregando registros...</p>
                                        ) : registrosHH.length === 0 ? (
                                            <p className="no-data-text">Nenhum registro de horas encontrado para este funcionário.</p>
                                        ) : (
                                            <div className="hh-table-container">
                                                <table className="hh-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Data</th>
                                                            <th>Obra</th>
                                                            <th>H. Normal</th>
                                                            <th>H. +60%</th>
                                                            <th>H. +100%</th>
                                                            <th>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {registrosHH.map(registro => {
                                                            const obra = obras.find(o => o.id === registro.obra_id);
                                                            const obraNome = obra ? (obra.numero + ' - ' + (obra.cliente_nome || obra.nome || 'Sem nome')) : `ID: ${registro.obra_id}`;
                                                            
                                                            // Calcular total de horas
                                                            const totalHoras = (
                                                                parseFloat(registro.horas_normais || 0) + 
                                                                parseFloat(registro.horas_60 || 0) + 
                                                                parseFloat(registro.horas_100 || 0)
                                                            ).toFixed(1);
                                                            
                                                            return (
                                                                <tr key={registro.id} title={registro.observacao || 'Sem observações'}>
                                                                    <td>{new Date(registro.data_registro).toLocaleDateString()}</td>
                                                                    <td>{obraNome}</td>
                                                                    <td>{registro.horas_normais || '0'}</td>
                                                                    <td>{registro.horas_60 || '0'}</td>
                                                                    <td>{registro.horas_100 || '0'}</td>
                                                                    <td>{totalHoras}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            
                            <div className="modal-buttons">
                                <button className="close-button" onClick={fecharModal}>
                                    Fechar
                                </button>
                                {activeTab === 'info' && (
                                    <button 
                                        className="edit-button"
                                        onClick={() => {
                                            fecharModal();
                                            handleEditar(funcionarioSelecionado.id);
                                        }}
                                    >
                                        Editar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ConsultarFuncionarios; 