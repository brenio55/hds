import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import ApiService from '../../services/ApiService';

function RCReembolso() {
    // Estados para controle de abas e formulário
    const [activeTab, setActiveTab] = useState('registro');
    const [loading, setLoading] = useState(false);
    const [funcionarios, setFuncionarios] = useState([]);
    const [centrosCusto, setCentrosCusto] = useState([]);
    const [reembolsos, setReembolsos] = useState([]);

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
            // Aqui você deve implementar as chamadas à API para carregar funcionários e centros de custo
            // const responseFuncionarios = await ApiService.buscarFuncionarios();
            // const responseCentrosCusto = await ApiService.buscarCentrosCusto();
            // setFuncionarios(responseFuncionarios);
            // setCentrosCusto(responseCentrosCusto);
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
        } finally {
            setLoading(false);
        }
    };

    const buscarReembolsos = async () => {
        try {
            setLoading(true);
            // Implementar chamada à API para buscar reembolsos com filtros
            // const response = await ApiService.buscarReembolsos(filtros);
            // setReembolsos(response);
        } catch (error) {
            console.error('Erro ao buscar reembolsos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistroSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Implementar chamada à API para registrar reembolso
            // const formData = new FormData();
            // Object.keys(formRegistro).forEach(key => {
            //     formData.append(key, formRegistro[key]);
            // });
            // await ApiService.registrarReembolso(formData);
            alert('Reembolso registrado com sucesso!');
            setFormRegistro({
                funcionarioId: '',
                valor: '',
                dataVencimento: '',
                comprovante: null,
                contaBancaria: '',
                centroCustoId: ''
            });
        } catch (error) {
            console.error('Erro ao registrar reembolso:', error);
            alert('Erro ao registrar reembolso. Tente novamente.');
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

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-container">
                    <h1>REGISTRO E CONSULTA - REEMBOLSO DE FUNCIONÁRIO</h1>

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
                                        {funcionarios.map(func => (
                                            <option key={func.id} value={func.id}>
                                                {func.nome}
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
                                        {centrosCusto.map(centro => (
                                            <option key={centro.id} value={centro.id}>
                                                {centro.nome}
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
                                        {centrosCusto.map(centro => (
                                            <option key={centro.id} value={centro.id}>
                                                {centro.nome}
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
                                        {funcionarios.map(func => (
                                            <option key={func.id} value={func.id}>
                                                {func.nome}
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
                                        {reembolsos.map((reembolso) => (
                                            <tr key={reembolso.id}>
                                                <td>{reembolso.funcionario.nome}</td>
                                                <td>{formatarValor(reembolso.valor)}</td>
                                                <td>{formatarData(reembolso.dataVencimento)}</td>
                                                <td>{reembolso.centroCusto.nome}</td>
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default RCReembolso; 