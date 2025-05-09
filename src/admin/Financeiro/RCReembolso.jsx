import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../CommonComponents/HeaderAdmin';
import ApiService from '../../services/ApiService';
import './RCReembolso.css';

function RCReembolso() {
    // Estados para controle de abas e formulário
    const [activeTab, setActiveTab] = useState('registro');
    const [loading, setLoading] = useState(false);
    const [funcionarios, setFuncionarios] = useState([]);
    const [centrosCusto, setCentrosCusto] = useState([]);
    const [reembolsos, setReembolsos] = useState([]);
    const [error, setError] = useState(null);
    const [editandoReembolso, setEditandoReembolso] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Estados para o formulário de registro
    const [formRegistro, setFormRegistro] = useState({
        funcionarioId: '',
        valor: '',
        dataVencimento: '',
        comprovante: null,
        contaBancaria: '',
        centroCustoId: ''
    });

    // Estados para os filtros de consulta
    const [filtros, setFiltros] = useState({
        dataInicial: '',
        dataFinal: '',
        centroCustoId: '',
        funcionarioId: ''
    });

    useEffect(() => {
        carregarDadosIniciais();
        if (activeTab === 'consulta') {
            buscarReembolsos();
        }
    }, [activeTab]);

    useEffect(() => {
        // Quando um reembolso é selecionado para edição, preenche o formulário
        if (editandoReembolso) {
            setFormRegistro({
                funcionarioId: editandoReembolso.funcionarioId || '',
                valor: editandoReembolso.valor || '',
                dataVencimento: editandoReembolso.dataVencimento ? 
                    new Date(editandoReembolso.dataVencimento).toISOString().split('T')[0] : '',
                comprovante: null, // O arquivo não pode ser preenchido automaticamente
                contaBancaria: editandoReembolso.contaBancaria || '',
                centroCustoId: editandoReembolso.centroCustoId || ''
            });
            setActiveTab('registro');
        }
    }, [editandoReembolso]);

    const carregarDadosIniciais = async () => {
        try {
            setLoading(true);
            console.log("Carregando dados iniciais...");
            
            // Carrega funcionários
            const responseFuncionarios = await ApiService.buscarFuncionarios();
            console.log("Funcionários carregados:", responseFuncionarios);
            setFuncionarios(Array.isArray(responseFuncionarios) ? responseFuncionarios : []);
            
            // Carrega centros de custo (propostas)
            try {
                const responseCentrosCusto = await ApiService.buscarPropostas();
                console.log("Centros de custo carregados:", responseCentrosCusto);
                
                // Verifica se a resposta é um array ou se tem uma propriedade que contém o array
                if (Array.isArray(responseCentrosCusto)) {
                    setCentrosCusto(responseCentrosCusto);
                } else if (responseCentrosCusto && responseCentrosCusto.propostas && Array.isArray(responseCentrosCusto.propostas)) {
                    setCentrosCusto(responseCentrosCusto.propostas);
                } else if (responseCentrosCusto && Object.keys(responseCentrosCusto).length > 0) {
                    // Se for um objeto com itens, converte para array
                    const centrosCustoArray = Object.values(responseCentrosCusto);
                    setCentrosCusto(Array.isArray(centrosCustoArray) ? centrosCustoArray : []);
                } else {
                    // Fallback para array vazio
                    setCentrosCusto([]);
                    console.warn("Formato de resposta de centros de custo não reconhecido:", responseCentrosCusto);
                }
            } catch (centroError) {
                console.error("Erro ao carregar centros de custo:", centroError);
                setCentrosCusto([]);
                setError("Não foi possível carregar os centros de custo. Alguns recursos podem estar limitados.");
            }
            
            setError(null);
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            setError('Falha ao carregar dados. Verifique sua conexão e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const buscarReembolsos = async () => {
        try {
            setLoading(true);
            console.log("Buscando reembolsos com filtros:", filtros);
            
            // Constrói o objeto de filtro apenas com campos preenchidos
            const filtrosPreenchidos = {};
            if (filtros.dataInicial) filtrosPreenchidos.dataInicial = filtros.dataInicial;
            if (filtros.dataFinal) filtrosPreenchidos.dataFinal = filtros.dataFinal;
            if (filtros.centroCustoId) filtrosPreenchidos.centroCustoId = filtros.centroCustoId;
            if (filtros.funcionarioId) filtrosPreenchidos.funcionarioId = filtros.funcionarioId;
            
            const response = await ApiService.buscarReembolsos(filtrosPreenchidos);
            console.log("Reembolsos encontrados:", response);
            
            // Mapear os campos para o formato usado no frontend
            const reembolsosMapeados = Array.isArray(response) ? response.map(reembolso => ({
                id: reembolso.id,
                funcionarioId: reembolso.id_funcionarios,
                valor: reembolso.valor,
                dataVencimento: reembolso.prazo,
                comprovante: reembolso.comprovante,
                contaBancaria: reembolso.descricao,
                centroCustoId: reembolso.centro_custo_id,
                dataCriacao: reembolso.created_at
            })) : [];
            
            console.log("Reembolsos mapeados para o frontend:", reembolsosMapeados);
            setReembolsos(reembolsosMapeados);
            setError(null);
        } catch (error) {
            console.error('Erro ao buscar reembolsos:', error);
            setError('Não foi possível carregar os reembolsos. Tente novamente mais tarde.');
            setReembolsos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistroSubmit = async (e) => {
        e.preventDefault();
        
        // Validação dos campos obrigatórios
        if (!formRegistro.funcionarioId || !formRegistro.valor || !formRegistro.dataVencimento || !formRegistro.contaBancaria || !formRegistro.centroCustoId) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        try {
            setLoading(true);
            
            // Preparar dados para o backend
            const dadosReembolso = {
                id_funcionarios: formRegistro.funcionarioId,
                valor: formRegistro.valor,
                prazo: formRegistro.dataVencimento,
                descricao: formRegistro.contaBancaria,
                centro_custo_id: formRegistro.centroCustoId
            };
            
            // Converter comprovante para base64 se existir
            if (formRegistro.comprovante) {
                const base64 = await converterParaBase64(formRegistro.comprovante);
                dadosReembolso.comprovante = base64;
            }
            
            console.log("Dados de reembolso a serem enviados:", dadosReembolso);
            
            let response;
            if (editandoReembolso) {
                response = await ApiService.atualizarReembolso(editandoReembolso.id, dadosReembolso);
                console.log("Reembolso atualizado:", response);
                setError('Reembolso atualizado com sucesso!');
            } else {
                response = await ApiService.criarReembolso(dadosReembolso);
                console.log("Reembolso criado:", response);
                setError('Reembolso registrado com sucesso!');
            }
            
            // Limpar formulário e fechar modal
            setFormRegistro({
                funcionarioId: '',
                valor: '',
                dataVencimento: '',
                comprovante: null,
                contaBancaria: '',
                centroCustoId: ''
            });
            setEditandoReembolso(null);
            
            // Recarregar lista de reembolsos
            buscarReembolsos();
        } catch (error) {
            console.error('Erro ao salvar reembolso:', error);
            setError('Erro ao salvar reembolso. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Função para converter arquivo para base64
    const converterParaBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleFiltroSubmit = (e) => {
        e.preventDefault();
        buscarReembolsos();
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const handleEditarReembolso = (reembolso) => {
        console.log("Editando reembolso:", reembolso);
        
        // Define os valores iniciais do formulário com os dados do reembolso
        setFormRegistro({
            ...reembolso,
            // Certifique-se de que os campos estão corretos para o formulário
            funcionarioId: reembolso.funcionarioId || '',
            valor: reembolso.valor || '',
            dataVencimento: reembolso.dataVencimento ? formatarDataParaInput(reembolso.dataVencimento) : '',
            comprovante: null, // Não preenche o campo de arquivo, usuário deve selecionar novamente se desejar
            contaBancaria: reembolso.contaBancaria || '',
            centroCustoId: reembolso.centroCustoId || ''
        });
        
        setModalOpen(true);
    };

    const handleCancelarEdicao = () => {
        setEditandoReembolso(null);
        setFormRegistro({
            funcionarioId: '',
            valor: '',
            dataVencimento: '',
            comprovante: null,
            contaBancaria: '',
            centroCustoId: ''
        });
    };

    const handleExcluirReembolso = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este reembolso?')) {
            try {
                setLoading(true);
                await ApiService.excluirReembolso(id);
                alert('Reembolso excluído com sucesso!');
                // Atualizar a lista após excluir
                buscarReembolsos();
            } catch (error) {
                console.error('Erro ao excluir reembolso:', error);
                setError('Erro ao excluir reembolso: ' + (error.message || 'Tente novamente.'));
                alert('Erro ao excluir reembolso: ' + (error.message || 'Tente novamente.'));
            } finally {
                setLoading(false);
            }
        }
    };

    // Verificação de segurança para renderização de listas
    const centrosCustoArray = Array.isArray(centrosCusto) ? centrosCusto : [];
    const funcionariosArray = Array.isArray(funcionarios) ? funcionarios : [];
    const reembolsosArray = Array.isArray(reembolsos) ? reembolsos : [];

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-container-reembolso">
                    <h1>REGISTRO E CONSULTA - REEMBOLSO DE FUNCIONÁRIO</h1>

                    {error && <div className="error-message">{error}</div>}

                    <div className="tabs-container">
                        <div 
                            className={`tab ${activeTab === 'registro' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('registro');
                                if (editandoReembolso) {
                                    handleCancelarEdicao();
                                }
                            }}
                        >
                            {editandoReembolso ? 'Editar Reembolso' : 'Registro'}
                        </div>
                        <div 
                            className={`tab ${activeTab === 'consulta' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('consulta');
                                if (editandoReembolso) {
                                    handleCancelarEdicao();
                                }
                            }}
                        >
                            Consulta
                        </div>
                    </div>

                    {activeTab === 'registro' ? (
                        <form onSubmit={handleRegistroSubmit} className="form-container registro-form">
                            {editandoReembolso && (
                                <div className="edit-notification">
                                    <p>Editando reembolso #{editandoReembolso.id}</p>
                                    <button type="button" className="cancel-edit-button" onClick={handleCancelarEdicao}>
                                        Cancelar Edição
                                    </button>
                                </div>
                            )}
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>SELECIONE O FUNCIONÁRIO A REEMBOLSAR:</label>
                                    <select
                                        value={formRegistro.funcionarioId}
                                        onChange={(e) => setFormRegistro({
                                            ...formRegistro,
                                            funcionarioId: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="">Selecione um funcionário</option>
                                        {funcionariosArray.map(func => (
                                            <option key={func.id} value={func.id}>
                                                {typeof func.contato === 'string' 
                                                    ? JSON.parse(func.contato).nome 
                                                    : func.contato?.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>VALOR A REEMBOLSAR (a FATURAR):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formRegistro.valor}
                                        onChange={(e) => setFormRegistro({
                                            ...formRegistro,
                                            valor: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>DATA DE VENCIMENTO:</label>
                                    <input
                                        type="date"
                                        value={formRegistro.dataVencimento}
                                        onChange={(e) => setFormRegistro({
                                            ...formRegistro,
                                            dataVencimento: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>COMPROVANTE{!editandoReembolso ? ' (obrigatório)' : ' (opcional na edição)'}:</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setFormRegistro({
                                            ...formRegistro,
                                            comprovante: e.target.files[0]
                                        })}
                                        required={!editandoReembolso}
                                    />
                                    {editandoReembolso && editandoReembolso.comprovante && (
                                        <div className="existing-file">
                                            <p>Arquivo atual: <a href={editandoReembolso.comprovante} target="_blank" rel="noopener noreferrer">Ver comprovante</a></p>
                                            <p className="file-note">Envie um novo arquivo apenas se desejar substituir o atual</p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>PIX OU TED (DADOS BANCÁRIOS):</label>
                                    <input
                                        type="text"
                                        value={formRegistro.contaBancaria}
                                        onChange={(e) => setFormRegistro({
                                            ...formRegistro,
                                            contaBancaria: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>SELECIONE A OBRA (PROPOSTA/CENTRO DE CUSTO):</label>
                                    <select
                                        value={formRegistro.centroCustoId}
                                        onChange={(e) => setFormRegistro({
                                            ...formRegistro,
                                            centroCustoId: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="">Selecione um centro de custo</option>
                                        {centrosCustoArray.map(centro => {
                                            // Verificar se centro.client_info existe para evitar erros
                                            let displayText = '#' + centro.id;
                                            if (centro.client_info && centro.client_info.nome) {
                                                displayText += ' - ' + centro.client_info.nome;
                                            }
                                            if (centro.descricao) {
                                                displayText += ' - ' + centro.descricao;
                                            } else if (centro.titulo) {
                                                displayText += ' - ' + centro.titulo;
                                            }
                                            
                                            return (
                                                <option key={centro.id} value={centro.id}>
                                                    {displayText}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Processando...' : editandoReembolso ? 'ATUALIZAR REEMBOLSO' : 'REGISTRAR REEMBOLSO'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="consulta-container">
                            <form onSubmit={handleFiltroSubmit} className="filtro-container">
                                <div className="form-group">
                                    <label>Data Inicial:</label>
                                    <input
                                        type="date"
                                        value={filtros.dataInicial}
                                        onChange={(e) => setFiltros({
                                            ...filtros,
                                            dataInicial: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Data Final:</label>
                                    <input
                                        type="date"
                                        value={filtros.dataFinal}
                                        onChange={(e) => setFiltros({
                                            ...filtros,
                                            dataFinal: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Centro de Custo:</label>
                                    <select
                                        value={filtros.centroCustoId}
                                        onChange={(e) => setFiltros({
                                            ...filtros,
                                            centroCustoId: e.target.value
                                        })}
                                    >
                                        <option value="">Todos</option>
                                        {centrosCustoArray.map(centro => (
                                            <option key={centro.id} value={centro.id}>
                                                {centro.descricao || centro.titulo || `Proposta #${centro.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Funcionário:</label>
                                    <select
                                        value={filtros.funcionarioId}
                                        onChange={(e) => setFiltros({
                                            ...filtros,
                                            funcionarioId: e.target.value
                                        })}
                                    >
                                        <option value="">Todos</option>
                                        {funcionariosArray.map(func => (
                                            <option key={func.id} value={func.id}>
                                                {typeof func.contato === 'string' 
                                                    ? JSON.parse(func.contato).nome 
                                                    : func.contato?.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    type="submit" 
                                    className="action-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </form>

                            <div className="table-container">
                                {loading ? (
                                    <div className="loading-message">Carregando reembolsos...</div>
                                ) : reembolsosArray.length === 0 ? (
                                    <div className="no-data-message">Nenhum reembolso encontrado</div>
                                ) : (
                                    <table className="itens-table">
                                        <thead>
                                            <tr>
                                                <th>Funcionário</th>
                                                <th>Valor</th>
                                                <th>Data de Vencimento</th>
                                                <th>Centro de Custo</th>
                                                <th>Dados Bancários</th>
                                                {/* <th>Ações</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reembolsosArray.map((reembolso) => {
                                                // Buscar funcionário correspondente
                                                const funcionario = funcionariosArray.find(f => f.id.toString() === reembolso.funcionarioId?.toString());
                                                let nomeFuncionario = 'N/A';
                                                if (funcionario) {
                                                    const contato = typeof funcionario.contato === 'string' 
                                                        ? JSON.parse(funcionario.contato) 
                                                        : funcionario.contato;
                                                    nomeFuncionario = contato?.nome || 'N/A';
                                                }
                                                
                                                // Buscar centro de custo correspondente
                                                const centroCusto = centrosCustoArray.find(c => c.id.toString() === reembolso.centroCustoId?.toString());
                                                let nomeCentroCusto = 'N/A';
                                                if (centroCusto) {
                                                    nomeCentroCusto = centroCusto.descricao || centroCusto.titulo || `Proposta #${centroCusto.id}`;
                                                }
                                                
                                                return (
                                                    <tr key={reembolso.id}>
                                                        <td>{nomeFuncionario}</td>
                                                        <td>{formatarValor(reembolso.valor)}</td>
                                                        <td>{formatarData(reembolso.dataVencimento)}</td>
                                                        <td>{nomeCentroCusto}</td>
                                                        <td>{reembolso.contaBancaria}</td>
                                                        {/* <td className="acoes-cell">
                                                            {reembolso.comprovante && (
                                                                <button 
                                                                    onClick={() => window.open(reembolso.comprovante, '_blank')}
                                                                    className="action-button view-button"
                                                                    title="Visualizar Comprovante"
                                                                >
                                                                    Ver
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => handleEditarReembolso(reembolso)}
                                                                className="action-button edit-button"
                                                                title="Editar Reembolso"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button 
                                                                onClick={() => handleExcluirReembolso(reembolso.id)}
                                                                className="action-button delete-button"
                                                                title="Excluir Reembolso"
                                                            >
                                                                Excluir
                                                            </button>
                                                        </td> */}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default RCReembolso; 