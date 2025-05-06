import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderAdmin from '../CommonComponents/HeaderAdmin';
import ApiService from '../../services/ApiService';
import './ConsultarCargos.css';

function ConsultarCargos() {
    const navigate = useNavigate();
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cargoSelecionado, setCargoSelecionado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        carregarCargos();
    }, []);

    const carregarCargos = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await ApiService.buscarCargos();
            setCargos(data);
        } catch (error) {
            console.error('Erro ao carregar cargos:', error);
            setError('Não foi possível carregar a lista de cargos. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (id) => {
        navigate(`/editarCargo/${id}`);
    };

    const handleExcluir = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
            setLoading(true);
            try {
                await ApiService.excluirCargo(id);
                await carregarCargos();
            } catch (error) {
                console.error('Erro ao excluir cargo:', error);
                setError('Não foi possível excluir o cargo. ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerDetalhes = (cargo) => {
        setCargoSelecionado(cargo);
        setShowModal(true);
    };

    const fecharModal = () => {
        setShowModal(false);
        setCargoSelecionado(null);
    };

    // Função para formatar moeda
    const formatarMoeda = (valor) => {
        if (valor === null || valor === undefined) return 'R$ 0,00';
        return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
    };

    return (
        <>
            <HeaderAdmin />
            <div className="consultar-cargos-container">
                <h2>Consultar Cargos</h2>
                
                <div className="header-actions">
                    <button className="new-button" onClick={() => navigate('/cadastrarCargo')}>
                        Novo Cargo
                    </button>
                    <button className="refresh-button" onClick={carregarCargos} disabled={loading}>
                        {loading ? 'Atualizando...' : 'Atualizar'}
                    </button>
                </div>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="loading">Carregando cargos...</div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Valor HH Normal</th>
                                    <th>Valor HH 60%</th>
                                    <th>Valor HH 100%</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            Nenhum cargo encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    cargos.map((cargo) => (
                                        <tr key={cargo.id}>
                                            <td>{cargo.id}</td>
                                            <td>{cargo.nome}</td>
                                            <td>{formatarMoeda(cargo.valor_hh)}</td>
                                            <td>{formatarMoeda(cargo.valor_hh * 1.6)}</td>
                                            <td>{formatarMoeda(cargo.valor_hh * 2)}</td>
                                            <td className="actions-column">
                                                <button 
                                                    className="view-button"
                                                    onClick={() => handleVerDetalhes(cargo)}
                                                >
                                                    Detalhes
                                                </button>
                                                <button 
                                                    className="edit-button"
                                                    onClick={() => handleEditar(cargo.id)}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    className="delete-button"
                                                    onClick={() => handleExcluir(cargo.id)}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Modal para exibir detalhes do cargo */}
                {showModal && cargoSelecionado && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Detalhes do Cargo</h3>
                            
                            <div className="detail-section">
                                <h4>Informações Gerais</h4>
                                <p><strong>ID:</strong> {cargoSelecionado.id}</p>
                                <p><strong>Nome:</strong> {cargoSelecionado.nome}</p>
                                <p><strong>Descrição:</strong> {cargoSelecionado.descricao || 'Não disponível'}</p>
                            </div>
                            
                            <div className="detail-section">
                                <h4>Valores HH</h4>
                                <p><strong>HH Normal:</strong> {formatarMoeda(cargoSelecionado.valor_hh)}</p>
                                <p><strong>HH + 60%:</strong> {formatarMoeda(cargoSelecionado.valor_hh * 1.6)}</p>
                                <p><strong>HH + 100%:</strong> {formatarMoeda(cargoSelecionado.valor_hh * 2)}</p>
                            </div>
                            
                            <div className="detail-section">
                                <h4>Informações do Sistema</h4>
                                <p><strong>Data de Criação:</strong> {new Date(cargoSelecionado.created_at).toLocaleString()}</p>
                                <p><strong>Última Atualização:</strong> {new Date(cargoSelecionado.updated_at).toLocaleString()}</p>
                            </div>
                            
                            <div className="modal-buttons">
                                <button className="close-button" onClick={fecharModal}>
                                    Fechar
                                </button>
                                <button 
                                    className="edit-button"
                                    onClick={() => {
                                        fecharModal();
                                        handleEditar(cargoSelecionado.id);
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

export default ConsultarCargos; 