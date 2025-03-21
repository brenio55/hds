import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import ApiService from '../../services/ApiService';

function RCAluguel() {
    // Estados para controle de abas e formulário
    const [activeTab, setActiveTab] = useState('registro');
    const [loading, setLoading] = useState(false);
    const [centrosCusto, setCentrosCusto] = useState([]);
    const [alugueis, setAlugueis] = useState([]);

    // Estados para o formulário de registro
    const [formRegistro, setFormRegistro] = useState({
        valor: '',
        dataVencimento: '',
        contaBancaria: '',
        centroCustoId: ''
    });

    // Estados para os filtros de consulta
    const [filtros, setFiltros] = useState({
        dataInicial: '',
        dataFinal: '',
        centroCustoId: ''
    });

    useEffect(() => {
        carregarDadosIniciais();
        if (activeTab === 'consulta') {
            buscarAlugueis();
        }
    }, [activeTab]);

    const carregarDadosIniciais = async () => {
        try {
            setLoading(true);
            // Aqui você deve implementar as chamadas à API para carregar os centros de custo
            // const responseCentrosCusto = await ApiService.buscarCentrosCusto();
            // setCentrosCusto(responseCentrosCusto);
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
        } finally {
            setLoading(false);
        }
    };

    const buscarAlugueis = async () => {
        try {
            setLoading(true);
            // Implementar chamada à API para buscar aluguéis com filtros
            // const response = await ApiService.buscarAlugueis(filtros);
            // setAlugueis(response);
        } catch (error) {
            console.error('Erro ao buscar aluguéis:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistroSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Implementar chamada à API para registrar aluguel
            // const formData = new FormData();
            // Object.keys(formRegistro).forEach(key => {
            //     formData.append(key, formRegistro[key]);
            // });
            // await ApiService.registrarAluguel(formData);
            alert('Aluguel registrado com sucesso!');
            setFormRegistro({
                valor: '',
                dataVencimento: '',
                contaBancaria: '',
                centroCustoId: ''
            });
        } catch (error) {
            console.error('Erro ao registrar aluguel:', error);
            alert('Erro ao registrar aluguel. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroSubmit = (e) => {
        e.preventDefault();
        buscarAlugueis();
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

    const handleFinalizarAluguel = async (id) => {
        if (window.confirm('Tem certeza que deseja finalizar este aluguel?')) {
            try {
                setLoading(true);
                await ApiService.finalizarAluguel(id);
                alert('Aluguel finalizado com sucesso!');
                buscarAlugueis(); // Recarrega a lista
            } catch (error) {
                console.error('Erro ao finalizar aluguel:', error);
                alert('Erro ao finalizar aluguel. Tente novamente.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-container">
                    <h1>REGISTRO E CONSULTA - ALUGUEL DE CASAS</h1>

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
                                    <label>VALOR LÍQUIDO:</label>
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
                                    <label>SELECIONE A OBRA (CENTRO DE CUSTO):</label>
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
                                    {loading ? 'Registrando...' : 'REGISTRAR ALUGUEL'}
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
                                            <th>Valor</th>
                                            <th>Data de Vencimento</th>
                                            <th>Centro de Custo</th>
                                            <th>Dados Bancários</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alugueis.map((aluguel) => (
                                            <tr key={aluguel.id}>
                                                <td>{formatarValor(aluguel.valor)}</td>
                                                <td>{formatarData(aluguel.dataVencimento)}</td>
                                                <td>{aluguel.centroCusto.nome}</td>
                                                <td>{aluguel.contaBancaria}</td>
                                                <td className="acoes-cell">
                                                    <button
                                                        className="action-button"
                                                        onClick={() => handleFinalizarAluguel(aluguel.id)}
                                                        disabled={loading || aluguel.finalizado}
                                                    >
                                                        {aluguel.finalizado ? 'Finalizado' : 'Finalizar Aluguel'}
                                                    </button>
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

export default RCAluguel; 