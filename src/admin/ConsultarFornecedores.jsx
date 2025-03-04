import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsultarFornecedores.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function ConsultarFornecedores() {
    const navigate = useNavigate();
    const [fornecedores, setFornecedores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        razaoSocial: '',
        cnpj: '',
        municipio: ''
    });

    useEffect(() => {
        buscarTodosFornecedores();
    }, []);

    const buscarTodosFornecedores = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fornecedores`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar fornecedores');
            }

            const data = await response.json();
            setFornecedores(data);
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
            setError('Erro ao carregar fornecedores. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Filtrar apenas os campos preenchidos
        const filtrosPreenchidos = Object.entries(filtros)
            .filter(([_, value]) => value.trim() !== '')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        try {
            // Construir a URL com os parâmetros de consulta
            const queryParams = new URLSearchParams();
            Object.entries(filtrosPreenchidos).forEach(([key, value]) => {
                queryParams.append(key, value);
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fornecedores?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar fornecedores');
            }

            const data = await response.json();
            setFornecedores(data);
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
            setError('Erro ao buscar fornecedores. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditarFornecedor = (id) => {
        navigate(`/editarFornecedor/${id}`);
    };

    const handleVisualizarFornecedor = (id) => {
        navigate(`/visualizarFornecedor/${id}`);
    };

    return (
        <>
            <HeaderAdmin />
            <div className="consultar-fornecedores-container">
                <h2>Consultar Fornecedores</h2>
                
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="razaoSocial">Razão Social</label>
                        <input
                            type="text"
                            id="razaoSocial"
                            name="razaoSocial"
                            placeholder="Razão Social"
                            value={filtros.razaoSocial}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                            type="text"
                            id="cnpj"
                            name="cnpj"
                            placeholder="CNPJ"
                            value={filtros.cnpj}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="municipio">Município</label>
                        <input
                            type="text"
                            id="municipio"
                            name="municipio"
                            placeholder="Município"
                            value={filtros.municipio}
                            onChange={handleInputChange}
                        />
                    </div>
                    <button type="submit" className="search-button" disabled={loading}>
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="table-container">
                    {loading ? (
                        <div className="loading">Carregando fornecedores...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Razão Social</th>
                                    <th>CNPJ</th>
                                    <th>Telefone</th>
                                    <th>Município/UF</th>
                                    <th>Email</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fornecedores.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            Nenhum fornecedor encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    fornecedores.map((fornecedor) => (
                                        <tr key={fornecedor.id}>
                                            <td>{fornecedor.id}</td>
                                            <td>{fornecedor.razao_social}</td>
                                            <td>{fornecedor.cnpj}</td>
                                            <td>{fornecedor.telefone}</td>
                                            <td>{fornecedor.municipio_uf}</td>
                                            <td>{fornecedor.email}</td>
                                            <td className="actions-column">
                                                <div className="action-buttons">
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => handleVisualizarFornecedor(fornecedor.id)}
                                                    >
                                                        Visualizar
                                                    </button>
                                                    <button 
                                                        className="edit-button"
                                                        onClick={() => handleEditarFornecedor(fornecedor.id)}
                                                    >
                                                        Editar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                
                <div className="actions">
                    <button 
                        className="add-button"
                        onClick={() => navigate('/cadastrarFornecedor')}
                    >
                        Cadastrar Novo Fornecedor
                    </button>
                </div>
            </div>
        </>
    );
}

export default ConsultarFornecedores; 