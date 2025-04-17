import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsultarFornecedores.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function ConsultarFornecedores() {
    const navigate = useNavigate();
    const [fornecedores, setFornecedores] = useState([]);
    const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        id: '',
        razao_social: '',
        cnpj: '',
        municipio_uf: '',
        telefone: '',
        celular: '',
        email: '',
        contato: '',
        endereco: ''
    });

    useEffect(() => {
        buscarTodosFornecedores();
    }, []);

    useEffect(() => {
        aplicarFiltrosLocais();
    }, [filtros, fornecedores]);

    const buscarTodosFornecedores = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await ApiService.buscarFornecedores();
            console.log("Resposta da API de fornecedores:", response);
            
            // Verificar e processar a resposta para extrair o array de fornecedores
            if (response && response.fornecedores && Array.isArray(response.fornecedores)) {
                // Resposta no formato { fornecedores: [...] }
                setFornecedores(response.fornecedores);
                setFornecedoresFiltrados(response.fornecedores);
            } else if (Array.isArray(response)) {
                // Resposta já é um array
                setFornecedores(response);
                setFornecedoresFiltrados(response);
            } else {
                // Formato não esperado - definir como array vazio
                console.error('Formato de resposta inesperado:', response);
                setFornecedores([]);
                setFornecedoresFiltrados([]);
                setError('Erro ao processar dados de fornecedores. Formato de resposta inválido.');
            }
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
            setFornecedores([]);
            setFornecedoresFiltrados([]);
            setError('Erro ao carregar fornecedores. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const buscarFornecedorPorId = async (id) => {
        if (!id || id.trim() === '') {
            // Se o ID estiver vazio, buscar todos os fornecedores
            await buscarTodosFornecedores();
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const fornecedor = await ApiService.buscarFornecedorPorId(id);
            console.log("Fornecedor encontrado por ID:", fornecedor);
            
            if (fornecedor && fornecedor.id) {
                // Se encontrou um fornecedor, mostrar apenas ele
                setFornecedoresFiltrados([fornecedor]);
            } else {
                // Se não encontrou, mostrar mensagem
                setFornecedoresFiltrados([]);
                setError('Fornecedor não encontrado com o ID informado.');
            }
        } catch (error) {
            console.error('Erro ao buscar fornecedor por ID:', error);
            setFornecedoresFiltrados([]);
            setError(`Erro ao buscar fornecedor: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Função para normalizar strings para comparação
    const normalizar = (texto) => {
        // Se for null ou undefined, retornar string vazia
        if (texto == null) return '';
        
        // Converter para string se não for
        texto = String(texto);
        
        // Remover acentos, converter para minúsculas
        return texto.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .toLowerCase();
    };

    // Função para normalizar números (remover pontos, traços, parênteses, espaços)
    const normalizarNumero = (texto) => {
        if (texto == null) return '';
        return String(texto).replace(/[^0-9]/g, '');
    };

    const aplicarFiltrosLocais = () => {
        // Pular se o filtro de ID estiver ativo, pois ele usa requisição específica
        if (filtros.id.trim() !== '') return;

        // Normalizar os filtros uma vez antes de aplicar
        const filtrosNormalizados = {
            razao_social: normalizar(filtros.razao_social),
            cnpj: normalizarNumero(filtros.cnpj),
            municipio_uf: normalizar(filtros.municipio_uf),
            telefone: normalizarNumero(filtros.telefone),
            celular: normalizarNumero(filtros.celular),
            email: normalizar(filtros.email),
            contato: normalizar(filtros.contato),
            endereco: normalizar(filtros.endereco)
        };

        // Aplicar filtros nos campos
        const resultado = fornecedores.filter(fornecedor => {
            // Para cada campo de filtro
            return Object.entries(filtrosNormalizados).every(([campo, valorFiltro]) => {
                // Ignorar campos vazios
                if (!valorFiltro) return true;

                let valorCampo;
                
                // Campos numéricos - normalizar removendo caracteres não numéricos
                if (['cnpj', 'telefone', 'celular'].includes(campo)) {
                    valorCampo = normalizarNumero(fornecedor[campo]);
                } 
                // Campo município_uf - tratar de forma especial para busca parcial
                else if (campo === 'municipio_uf') {
                    valorCampo = normalizar(fornecedor.municipio_uf);
                    // Buscar por qualquer parte do texto (pode ser cidade ou UF)
                    return valorCampo.includes(valorFiltro);
                }
                // Campos de texto normais - normalizar e buscar por inclusão
                else {
                    valorCampo = normalizar(fornecedor[campo]);
                }

                // Verificar se o valor normalizado do campo contém o valor normalizado do filtro
                return valorCampo.includes(valorFiltro);
            });
        });
        
        setFornecedoresFiltrados(resultado);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        // Se o ID estiver preenchido, busca específica por ID
        if (filtros.id.trim() !== '') {
            await buscarFornecedorPorId(filtros.id);
        } else {
            // Se não, aplica filtros locais
            aplicarFiltrosLocais();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpar outros filtros se estiver preenchendo o ID
        if (name === 'id' && value.trim() !== '') {
            setFiltros(prev => ({
                ...prev,
                razao_social: '',
                cnpj: '',
                municipio_uf: '',
                telefone: '',
                celular: '',
                email: '',
                contato: '',
                endereco: ''
            }));
        }
    };

    const handleEditarFornecedor = (id) => {
        navigate(`/admin/editarFornecedor/${id}`);
    };

    const handleVisualizarFornecedor = (id) => {
        navigate(`/admin/visualizarFornecedor/${id}`);
    };

    const limparFiltros = () => {
        setFiltros({
            id: '',
            razao_social: '',
            cnpj: '',
            municipio_uf: '',
            telefone: '',
            celular: '',
            email: '',
            contato: '',
            endereco: ''
        });
        buscarTodosFornecedores();
    };

    return (
        <>
            <HeaderAdmin />
            <div className="consultar-fornecedores-container">
                <h2>Consultar Fornecedores</h2>
                
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="id">ID</label>
                            <input
                                type="text"
                                id="id"
                                name="id"
                                placeholder="Buscar por ID"
                                value={filtros.id}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="razao_social">Razão Social</label>
                            <input
                                type="text"
                                id="razao_social"
                                name="razao_social"
                                placeholder="Razão Social"
                                value={filtros.razao_social}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
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
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="municipio_uf">Município/UF</label>
                            <input
                                type="text"
                                id="municipio_uf"
                                name="municipio_uf"
                                placeholder="Município/UF"
                                value={filtros.municipio_uf}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefone">Telefone</label>
                            <input
                                type="text"
                                id="telefone"
                                name="telefone"
                                placeholder="Telefone"
                                value={filtros.telefone}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="celular">Celular</label>
                            <input
                                type="text"
                                id="celular"
                                name="celular"
                                placeholder="Celular"
                                value={filtros.celular}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                placeholder="Email"
                                value={filtros.email}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                        {/* <div className="form-group">
                            <label htmlFor="contato">Contato</label>
                            <input
                                type="text"
                                id="contato"
                                name="contato"
                                placeholder="Contato"
                                value={filtros.contato}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div> */}
                        {/* <div className="form-group">
                            <label htmlFor="endereco">Endereço</label>
                            <input
                                type="text"
                                id="endereco"
                                name="endereco"
                                placeholder="Endereço"
                                value={filtros.endereco}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div> */}
                    </div>
                    
                    <div className="">
                        <button 
                            type="button" 
                            className="clear-button"
                            onClick={limparFiltros}
                        >
                            Limpar Filtros
                        </button>
                        <button type="submit" className="search-button" disabled={loading}>
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                  
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
                                {!Array.isArray(fornecedoresFiltrados) || fornecedoresFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            Nenhum fornecedor encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    fornecedoresFiltrados.map((fornecedor) => (
                                        <tr key={fornecedor.id}>
                                            <td>{fornecedor.id}</td>
                                            <td>{fornecedor.razao_social}</td>
                                            <td>{fornecedor.cnpj}</td>
                                            <td>{fornecedor.telefone || fornecedor.celular}</td>
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
                        onClick={() => navigate('/admin/cadastrarFornecedor')}
                    >
                        Cadastrar Novo Fornecedor
                    </button>
                </div>
            </div>
        </>
    );
}

export default ConsultarFornecedores; 