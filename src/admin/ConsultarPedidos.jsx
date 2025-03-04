import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsultarPedidos.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function ConsultarPedidos() {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        id: '',
        tipo: '',
        centroCusto: '',
        dataDecrescente: true
    });

    useEffect(() => {
        buscarTodosPedidos();
    }, []);

    const ordenarPedidosPorData = (pedidos) => {
        return [...pedidos].sort((a, b) => {
            const dataA = new Date(a.data_criacao);
            const dataB = new Date(b.data_criacao);
            return dataB - dataA; // Ordem decrescente (mais recente primeiro)
        });
    };

    const buscarTodosPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiService.buscarPedidosCompra();
            const pedidosOrdenados = ordenarPedidosPorData(data.pedidos || []);
            setPedidos(pedidosOrdenados);
        } catch (error) {
            setError('Erro ao carregar pedidos. Por favor, tente novamente.');
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const filtrosValidos = Object.fromEntries(
                Object.entries(filtros).filter(([key, value]) => value !== '' && key !== 'dataDecrescente')
            );
            const data = await ApiService.buscarPedidosCompra(filtrosValidos);
            let pedidosOrdenados = data.pedidos || [];
            
            if (filtros.dataDecrescente) {
                pedidosOrdenados = ordenarPedidosPorData(pedidosOrdenados);
            }
            
            setPedidos(pedidosOrdenados);
        } catch (error) {
            setError('Erro ao buscar pedidos. Por favor, tente novamente.');
            console.error('Erro na busca:', error);
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

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleVisualizarPedido = (id) => {
        // Implementar visualização do pedido
        window.open(`/admin/pedidos/${id}/visualizar`, '_blank');
    };

    const handleEditarPedido = (id) => {
        // Implementar edição do pedido
        navigate(`/admin/pedidos/${id}/editar`);
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const formatarValor = (valor) => {
        if (!valor && valor !== 0) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const getTipoPedido = (tipo) => {
        const tipos = {
            'material': 'Material',
            'servico': 'Serviço',
            'locacao': 'Locação',
            'faturamento': 'Faturamento'
        };
        return tipos[tipo] || tipo || '-';
    };

    return (
        <>
            <HeaderAdmin />
            <div className="consultar-propostas-container">
                <h2>Consultar Pedidos C-M-L-S e Faturamentos</h2>
                
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="tipo">Tipo de Pedido</label>
                        <select
                            id="tipo"
                            name="tipo"
                            value={filtros.tipo}
                            onChange={handleInputChange}
                        >
                            <option value="">Todos</option>
                            <option value="material">Material</option>
                            <option value="servico">Serviço</option>
                            <option value="locacao">Locação</option>
                            <option value="faturamento">Faturamento</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="id">ID do Pedido</label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            placeholder="ID do Pedido"
                            value={filtros.id}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="centroCusto">Centro de Custo</label>
                        <input
                            type="text"
                            id="centroCusto"
                            name="centroCusto"
                            placeholder="Centro de Custo"
                            value={filtros.centroCusto}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="dataDecrescente"
                                checked={filtros.dataDecrescente}
                                onChange={handleCheckboxChange}
                            />
                            Data Decrescente
                        </label>
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
                        <div className="loading">Carregando pedidos...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tipo</th>
                                    <th>Cliente</th>
                                    <th>Centro de Custo</th>
                                    <th>Valor Total</th>
                                    <th>Data Criação</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="no-data">
                                            Nenhum pedido encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    pedidos.map((pedido) => (
                                        <tr key={pedido.id}>
                                            <td>{pedido.id}</td>
                                            <td>{getTipoPedido(pedido.tipo)}</td>
                                            <td>{pedido.cliente?.nome || '-'}</td>
                                            <td>{pedido.centro_custo || '-'}</td>
                                            <td>{formatarValor(pedido.valor_total)}</td>
                                            <td>{formatarData(pedido.data_criacao)}</td>
                                            <td>{pedido.status || '-'}</td>
                                            <td className="actions-column">
                                                <button 
                                                    className="view-button"
                                                    onClick={() => handleVisualizarPedido(pedido.id)}
                                                >
                                                    Visualizar
                                                </button>
                                                <button 
                                                    className="edit-button"
                                                    onClick={() => handleEditarPedido(pedido.id)}
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}

export default ConsultarPedidos; 