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
    const [cargoInfo, setCargoInfo] = useState(null);

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    const carregarFuncionarios = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await ApiService.buscarFuncionarios();
            
            // Carregar informações dos cargos para cada funcionário
            const funcionariosComCargos = await Promise.all(data.map(async (funcionario) => {
                if (funcionario.cargo_id) {
                    try {
                        const cargo = await ApiService.buscarCargoPorId(funcionario.cargo_id);
                        return { 
                            ...funcionario, 
                            cargoInfo: cargo,
                            // Usar apenas o nome do cargo obtido da tabela cargos
                            cargoNome: cargo.nome
                        };
                    } catch (e) {
                        console.error(`Erro ao carregar cargo para funcionário ${funcionario.id}:`, e);
                        return {
                            ...funcionario,
                            cargoNome: 'Não encontrado'
                        };
                    }
                }
                return {
                    ...funcionario,
                    cargoNome: 'Sem cargo'
                };
            }));
            
            setFuncionarios(funcionariosComCargos);
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
                // Verificar se há reembolsos associados ao funcionário
                const reembolsos = await ApiService.buscarReembolsos({ funcionarioId: id });
                
                if (reembolsos && reembolsos.length > 0) {
                    alert(`Não é possível excluir este funcionário pois existem ${reembolsos.length} reembolso(s) associados a ele. Remova os reembolsos primeiro.`);
                    setLoading(false);
                    return;
                }
                
                // Verificar se há registros de HH associados ao funcionário
                const registrosHH = await ApiService.buscarRegistrosHH({ funcionario_id: id });
                
                if (registrosHH && registrosHH.length > 0) {
                    alert(`Não é possível excluir este funcionário pois existem ${registrosHH.length} registro(s) de horas trabalhadas associados a ele. Remova os registros primeiro.`);
                    setLoading(false);
                    return;
                }
                
                // Se não houver registros associados, proceder com a exclusão
                await ApiService.deletarFuncionario(id);
                await carregarFuncionarios();
                
            } catch (error) {
                console.error('Erro ao excluir funcionário:', error);
                
                // Exibir mensagem específica em caso de erro de restrição de chave estrangeira
                if (error.message && error.message.includes('foreign key constraint')) {
                    setError('Não foi possível excluir o funcionário porque existem registros relacionados a ele no sistema (reembolsos, horas trabalhadas, etc).');
                } else {
                    setError('Não foi possível excluir o funcionário. Por favor, tente novamente.');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerDetalhes = async (id) => {
        setLoading(true);
        try {
            const funcionario = await ApiService.buscarFuncionarioPorId(id);
            
            // Carregar informações do cargo se houver cargo_id
            let cargoNome = 'Sem cargo';
            if (funcionario.cargo_id) {
                try {
                    const cargo = await ApiService.buscarCargoPorId(funcionario.cargo_id);
                    // Usar apenas o nome do cargo obtido da tabela cargos
                    cargoNome = cargo.nome;
                    setCargoInfo(cargo);
                } catch (error) {
                    console.error('Erro ao carregar informações do cargo:', error);
                    setCargoInfo(null);
                }
            } else {
                setCargoInfo(null);
            }
            
            // Adicionar propriedade cargoNome ao funcionário
            funcionario.cargoNome = cargoNome;
            
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

    const formatarMoeda = (valor) => {
        if (valor === null || valor === undefined) return 'R$ 0,00';
        return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
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
                                    <th>Valor HH</th>
                                    <th>Contato</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {funcionarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">
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
                                                <td>{funcionario.cargoNome}</td>
                                                <td>{funcionario.cargoInfo ? formatarMoeda(funcionario.cargoInfo.valor_hh) : 'N/A'}</td>
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
                                {/* <button 
                                    className={`tab-button ${activeTab === 'horas' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('horas')}
                                >
                                    Horas Trabalhadas
                                </button> */}
                            </div>
                            
                            {activeTab === 'info' ? (
                                <>
                                    <div className="detail-section">
                                        <h4>Informações Profissionais</h4>
                                        <p><strong>ID:</strong> {funcionarioSelecionado.id}</p>
                                        <p><strong>Cargo:</strong> {funcionarioSelecionado.cargoNome}</p>
                                        {cargoInfo && (
                                            <div className="cargo-valores">
                                                <h5>Valores de Hora (HH)</h5>
                                                <table className="valores-hh-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Tipo</th>
                                                            <th>Valor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Normal</td>
                                                            <td>{formatarMoeda(cargoInfo.valor_hh)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Extra (+60%)</td>
                                                            <td>{formatarMoeda(cargoInfo.valor_hh * 1.6)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Extra (+100%)</td>
                                                            <td>{formatarMoeda(cargoInfo.valor_hh * 2)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
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
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ConsultarFuncionarios; 