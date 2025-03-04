import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsultarPropostas.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function ConsultarPropostas() {
    const navigate = useNavigate();
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [visualizandoId, setVisualizandoId] = useState(null);
    const [filtros, setFiltros] = useState({
        numeroProposta: '',
        cliente: '',
        data: '',
        nome: ''
    });

    useEffect(() => {
        buscarTodasPropostas();
    }, []);

    const ordenarPropostasPorData = (propostas) => {
        return [...propostas].sort((a, b) => {
            const dataA = new Date(a.data_criacao);
            const dataB = new Date(b.data_criacao);
            return dataB - dataA; // Ordem decrescente (mais recente primeiro)
        });
    };

    const buscarTodasPropostas = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiService.buscarPropostas();
            const propostasOrdenadas = ordenarPropostasPorData(data.propostas || []);
            setPropostas(propostasOrdenadas);
        } catch (error) {
            setError('Erro ao carregar propostas. Por favor, tente novamente.');
            console.error('Erro ao buscar propostas:', error);
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
                Object.entries(filtros).filter(([_, value]) => value !== '')
            );
            const data = await ApiService.buscarPropostas(filtrosValidos);
            const propostasOrdenadas = ordenarPropostasPorData(data.propostas || []);
            setPropostas(propostasOrdenadas);
        } catch (error) {
            setError('Erro ao buscar propostas. Por favor, tente novamente.');
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

    const handleVisualizarProposta = async (id, versao) => {
        try {
            setVisualizandoId(id);
            await ApiService.visualizarPdf(id, versao);
        } catch (error) {
            console.error('Erro ao visualizar PDF:', error);
            alert('Erro ao visualizar o PDF. Por favor, tente novamente.');
        } finally {
            setVisualizandoId(null);
        }
    };

    const handleDownloadProposta = async (id, versao) => {
        try {
            setDownloadingId(id);
            await ApiService.downloadPdf(id, versao);
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            alert('Erro ao baixar o PDF. Por favor, tente novamente.');
        } finally {
            setDownloadingId(null);
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        
        // Extrair a data diretamente da string ISO, ignorando o fuso horário
        const [ano, mes, dia] = dataString.split('T')[0].split('-');
        
        // Criar a data usando o fuso horário local, definindo o horário como meio-dia para evitar problemas com DST
        const data = new Date(ano, mes - 1, dia, 12, 0, 0);
        
        return data.toLocaleDateString('pt-BR');
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
            <div className="consultar-propostas-container">
                <h2>Consultar Propostas</h2>
                
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="numeroProposta"
                            placeholder="Número da Proposta"
                            value={filtros.numeroProposta}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="cliente"
                            placeholder="Cliente"
                            value={filtros.cliente}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="date"
                            name="data"
                            value={filtros.data}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="nome"
                            placeholder="Nome"
                            value={filtros.nome}
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
                        <div className="loading">Carregando propostas...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Número da Proposta</th>
                                    <th>Revisão</th>
                                    <th>Cliente</th>
                                    <th>Descrição</th>
                                    <th>Valor Total</th>
                                    <th>Data Criação</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {propostas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            Nenhuma proposta encontrada
                                        </td>
                                    </tr>
                                ) : (
                                    propostas.map((proposta) => (
                                        <tr key={proposta.id}>
                                            <td>{proposta.id}</td>
                                            <td>{proposta.versao || '-'}</td>
                                            <td>{proposta.client_info?.nome || proposta.client_info?.razao_social || '-'}</td>
                                            <td>{proposta.descricao}</td>
                                            <td>{formatarValor(proposta.valor_final)}</td>
                                            <td>{formatarData(proposta.data_criacao)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => handleVisualizarProposta(proposta.id, proposta.versao)}
                                                        disabled={visualizandoId === proposta.id}
                                                    >
                                                        {visualizandoId === proposta.id ? 'Abrindo...' : 'Visualizar'}
                                                    </button>
                                                    <button 
                                                        className="download-button"
                                                        onClick={() => handleDownloadProposta(proposta.id, proposta.versao)}
                                                        disabled={downloadingId === proposta.id}
                                                    >
                                                        {downloadingId === proposta.id ? 'Baixando...' : 'Download'}
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
            </div>
        </>
    );
}

export default ConsultarPropostas; 