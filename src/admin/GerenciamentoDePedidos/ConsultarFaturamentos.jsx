import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import ApiService from '../../services/ApiService';

function ConsultarFaturamentos() {
    const [faturamentos, setFaturamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tipoFiltro, setTipoFiltro] = useState('todos');
    const [numeroPedido, setNumeroPedido] = useState('');
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');

    useEffect(() => {
        carregarFaturamentos();
    }, []); // Removido tipoFiltro do array de dependências para não recarregar automaticamente

    const carregarFaturamentos = async () => {
        try {
            setLoading(true);
            const response = await ApiService.consultarFaturamentos({
                tipo: tipoFiltro,
                numeroPedido,
                dataInicial,
                dataFinal
            });
            setFaturamentos(response);
        } catch (error) {
            console.error('Erro ao carregar faturamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        carregarFaturamentos();
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    return (
        <>
            <HeaderAdmin />
            <div className="admin-container">
                <div className="pedido-container">
                    <h1>CONSULTA DE FATURAMENTOS</h1>
                    
                    <form onSubmit={handleBuscar} className="filtro-container">
                        <div className="form-group">
                            <label>Número do Pedido:</label>
                            <input
                                type="text"
                                value={numeroPedido}
                                onChange={(e) => setNumeroPedido(e.target.value)}
                                placeholder="Digite o número do pedido"
                            />
                        </div>

                        <div className="form-group">
                            <label>Tipo de Pedido:</label>
                            <select 
                                value={tipoFiltro} 
                                onChange={(e) => setTipoFiltro(e.target.value)}
                                className="filtro-select"
                            >
                                <option value="todos">Todos os Pedidos</option>
                                <option value="compra">Pedido de Compra</option>
                                <option value="locacao">Pedido de Locação</option>
                                <option value="servico">Pedido de Serviço</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Data Inicial:</label>
                            <input
                                type="date"
                                value={dataInicial}
                                onChange={(e) => setDataInicial(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Data Final:</label>
                            <input
                                type="date"
                                value={dataFinal}
                                onChange={(e) => setDataFinal(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="action-button">
                            Buscar
                        </button>
                    </form>

                    {loading ? (
                        <div className="loading-container">
                            <p>Carregando faturamentos...</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="itens-table">
                                <thead>
                                    <tr>
                                        <th>Nº Pedido</th>
                                        <th>Valor Faturado</th>
                                        <th>Data de Faturamento</th>
                                        <th>Data de Vencimento</th>
                                        <th>Método de Pagamento</th>
                                        <th>Código/Dados</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faturamentos.map((faturamento) => (
                                        <tr key={faturamento.id}>
                                            <td>{faturamento.numeroPedido}</td>
                                            <td>{formatarValor(faturamento.valorFaturado)}</td>
                                            <td>{formatarData(faturamento.dataFaturamento)}</td>
                                            <td>{formatarData(faturamento.dataVencimento)}</td>
                                            <td>{faturamento.metodoPagamento}</td>
                                            <td>
                                                {faturamento.metodoPagamento === 'boleto' 
                                                    ? faturamento.codigoBoleto 
                                                    : faturamento.dadosConta}
                                            </td>
                                            <td className="acoes-cell">
                                                {faturamento.arquivoNF && (
                                                    <button 
                                                        onClick={() => window.open(faturamento.arquivoNF, '_blank')}
                                                        className="action-button"
                                                        title="Visualizar NF"
                                                    >
                                                        Ver NF
                                                    </button>
                                                )}
                                                {faturamento.metodoPagamento === 'boleto' && faturamento.arquivoBoleto && (
                                                    <button 
                                                        onClick={() => window.open(faturamento.arquivoBoleto, '_blank')}
                                                        className="action-button"
                                                        title="Visualizar Boleto"
                                                    >
                                                        Ver Boleto
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ConsultarFaturamentos; 