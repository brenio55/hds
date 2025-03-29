import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
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
            setReembolsos(Array.isArray(response) ? response : []);
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
        try {
            setLoading(true);
            console.log("Preparando dados de reembolso para envio:", formRegistro);
            
            // Validar dados antes de enviar
            if (!formRegistro.funcionarioId) {
                throw new Error('Funcionário não selecionado');
            }
            
            if (!formRegistro.valor || isNaN(parseFloat(formRegistro.valor)) || parseFloat(formRegistro.valor) <= 0) {
                throw new Error('Valor inválido');
            }
            
            if (!formRegistro.dataVencimento) {
                throw new Error('Data de vencimento não informada');
            }
            
            if (!formRegistro.comprovante) {
                throw new Error('Comprovante não anexado');
            }
            
            if (!formRegistro.contaBancaria) {
                throw new Error('Dados bancários não informados');
            }
            
            if (!formRegistro.centroCustoId) {
                throw new Error('Centro de custo não selecionado');
            }
            
            // Criar FormData para enviar o arquivo
            const formData = new FormData();
            
            // Adicionar campos ao FormData
            formData.append('funcionarioId', formRegistro.funcionarioId);
            formData.append('valor', formRegistro.valor);
            formData.append('dataVencimento', formRegistro.dataVencimento);
            if (formRegistro.comprovante) {
                formData.append('comprovante', formRegistro.comprovante);
                console.log("Comprovante anexado:", formRegistro.comprovante.name, "tipo:", formRegistro.comprovante.type);
            }
            formData.append('contaBancaria', formRegistro.contaBancaria);
            formData.append('centroCustoId', formRegistro.centroCustoId);
            
            // Log para verificar o conteúdo do FormData
            console.log("Conteúdo do FormData:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? 'File: ' + pair[1].name : pair[1]));
            }
            
            // Enviar para a API
            console.log("Enviando FormData para a API...");
            const response = await ApiService.criarReembolso(formData);
            console.log('Reembolso registrado com sucesso:', response);
            
            // Limpar formulário
            setFormRegistro({
                funcionarioId: '',
                valor: '',
                dataVencimento: '',
                comprovante: null,
                contaBancaria: '',
                centroCustoId: ''
            });
            
            // Mostrar mensagem de sucesso
            alert('Reembolso registrado com sucesso!');
            setError(null);
        } catch (error) {
            console.error('Erro ao registrar reembolso:', error);
            setError('Erro ao registrar reembolso: ' + (error.message || 'Verifique os dados e tente novamente.'));
            alert('Erro ao registrar reembolso: ' + (error.message || 'Tente novamente.'));
        } finally {
            setLoading(false);
        }
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

    // Verificação de segurança para renderização de listas
    const centrosCustoArray = Array.isArray(centrosCusto) ? centrosCusto : [];
    const funcionariosArray = Array.isArray(funcionarios) ? funcionarios : [];
    const reembolsosArray = Array.isArray(reembolsos) ? reembolsos : [];

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-container">
                    <h1>REGISTRO E CONSULTA - REEMBOLSO DE FUNCIONÁRIO</h1>

                    {error && <div className="error-message">{error}</div>}

                    <div className="tabs-container">
                        <div 
                            className={`tab ${activeTab === 'registro' ? 'active' : ''}`}
                            onClick={() => setActiveTab('registro')}
                        >
                            Registro
                        </div>
                        <div 
                            className={`tab ${activeTab === 'consulta' ? 'active' : ''}`}
                            onClick={() => setActiveTab('consulta')}
                        >
                            Consulta
                        </div>
                    </div>

                    {activeTab === 'registro' ? (
                        <form onSubmit={handleRegistroSubmit} className="form-container registro-form">
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
                                    <label>COMPROVANTE:</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setFormRegistro({
                                            ...formRegistro,
                                            comprovante: e.target.files[0]
                                        })}
                                        required
                                    />
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
                                        {centrosCustoArray.map(centro => (
                                            <option key={centro.id} value={centro.id}>
                                                {'#' + centro.id + ' - ' + centro.client_info.nome + ' - ' + centro.descricao || centro.titulo || `Proposta #${centro.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Registrando...' : 'REGISTRAR REEMBOLSO'}
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
                                                <th>Ações</th>
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
                                                        <td className="acoes-cell">
                                                            {reembolso.comprovante && (
                                                                <button 
                                                                    onClick={() => window.open(reembolso.comprovante, '_blank')}
                                                                    className="action-button"
                                                                    title="Visualizar Comprovante"
                                                                >
                                                                    Ver Comprovante
                                                                </button>
                                                            )}
                                                        </td>
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