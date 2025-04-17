import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConsultarPropostas.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function ConsultarPropostas() {
    const navigate = useNavigate();
    const [propostas, setPropostas] = useState([]);
    const [propostasFiltradas, setPropostasFiltradas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [visualizandoId, setVisualizandoId] = useState(null);
    const [filtros, setFiltros] = useState({
        id: '',
        descricao: '',
        cliente: '',
        data_criacao: '',
        valor_final: ''
    });

    useEffect(() => {
        buscarTodasPropostas();
    }, []);

    useEffect(() => {
        aplicarFiltrosLocais();
    }, [filtros, propostas]);

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
            console.log("Iniciando carregamento de todas as propostas...");
            const resposta = await ApiService.buscarPropostas();
            console.log("Resposta da API de propostas:", resposta);
            
            let propostasCarregadas = [];
            
            // Garantir que a resposta tenha um array de propostas
            if (resposta && Array.isArray(resposta.propostas)) {
                console.log("Propostas carregadas com sucesso:", resposta.propostas.length);
                propostasCarregadas = resposta.propostas;
            } else {
                console.warn("Formato inesperado na resposta de propostas:", resposta);
                // Verificar se resposta é um array diretamente
                if (Array.isArray(resposta)) {
                    console.log("Usando array diretamente da resposta");
                    propostasCarregadas = resposta;
                } else {
                    // Tentar extrair propostas de qualquer formato de resposta
                    const propostasExtraidas = resposta && typeof resposta === 'object' ? 
                        Object.values(resposta).filter(item => item && typeof item === 'object') : [];
                    console.log("Tentando extrair propostas manualmente:", propostasExtraidas.length);
                    propostasCarregadas = propostasExtraidas;
                }
            }
            
            // Garantir que cada proposta tenha o campo client_info
            propostasCarregadas = propostasCarregadas.map(proposta => {
                if (!proposta.client_info) {
                    proposta.client_info = {};
                }
                return proposta;
            });
            
            const propostasOrdenadas = ordenarPropostasPorData(propostasCarregadas);
            setPropostas(propostasOrdenadas);
            setPropostasFiltradas(propostasOrdenadas);
            
            if (propostasOrdenadas.length === 0) {
                console.log("Nenhuma proposta encontrada após processamento");
            } else {
                console.log("Exemplo da primeira proposta após processamento:", propostasOrdenadas[0]);
            }
        } catch (error) {
            setError('Erro ao carregar propostas. Por favor, tente novamente.');
            console.error('Erro ao buscar propostas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Função para normalizar strings para comparação
    const normalizar = (texto) => {
        if (texto == null) return '';
        texto = String(texto);
        return texto.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    // Função para normalizar números (remover pontos, traços, parênteses, espaços)
    const normalizarNumero = (texto) => {
        if (texto == null) return '';
        return String(texto).replace(/[^0-9.,]/g, '');
    };

    const aplicarFiltrosLocais = () => {
        // Pular se o filtro de ID estiver ativo, pois ele usa requisição específica
        if (filtros.id.trim() !== '') {
            // Implementaremos a filtragem por ID depois
            return;
        }

        // Normalizar os filtros uma vez antes de aplicar
        const filtrosNormalizados = {
            descricao: normalizar(filtros.descricao),
            cliente: normalizar(filtros.cliente),
            data_criacao: filtros.data_criacao, // Datas são tratadas separadamente
            valor_final: normalizarNumero(filtros.valor_final)
        };

        // Aplicar filtros nos campos
        const resultado = propostas.filter(proposta => {
            // Para cada campo de filtro
            return Object.entries(filtrosNormalizados).every(([campo, valorFiltro]) => {
                // Ignorar campos vazios
                if (!valorFiltro) return true;

                let valorCampo;
                
                // Tratamento especial para cliente (que está dentro de client_info)
                if (campo === 'cliente') {
                    const nomeCliente = normalizar(proposta.client_info?.nome || proposta.client_info?.razao_social || '');
                    const cnpjCliente = normalizar(proposta.client_info?.cnpj || '');
                    const contatoCliente = normalizar(proposta.client_info?.contato || '');
                    // Buscar em qualquer um dos campos do cliente
                    return nomeCliente.includes(valorFiltro) || 
                           cnpjCliente.includes(valorFiltro) ||
                           contatoCliente.includes(valorFiltro);
                }
                // Tratamento para data
                else if (campo === 'data_criacao') {
                    // Verificar se a data da proposta contém a data do filtro (formato YYYY-MM-DD)
                    const dataPropostaFormatada = proposta.data_criacao ? proposta.data_criacao.split('T')[0] : '';
                    return dataPropostaFormatada === valorFiltro;
                }
                // Tratamento para valor
                else if (campo === 'valor_final') {
                    // Normalizar valor da proposta para comparação
                    const valorPropostaNormalizado = normalizarNumero(proposta.valor_final || '0');
                    return valorPropostaNormalizado.includes(valorFiltro);
                }
                // Campos de texto normais - normalizar e buscar por inclusão
                else {
                    valorCampo = normalizar(proposta[campo]);
                    return valorCampo.includes(valorFiltro);
                }
            });
        });
        
        setPropostasFiltradas(resultado);
    };

    const buscarPropostaPorId = async (id) => {
        if (!id || id.trim() === '') {
            await buscarTodasPropostas();
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Buscamos todas as propostas e depois filtramos pelo ID
            const resposta = await ApiService.buscarPropostas();
            let propostasCarregadas = [];
            
            if (resposta && Array.isArray(resposta.propostas)) {
                propostasCarregadas = resposta.propostas;
            } else if (Array.isArray(resposta)) {
                propostasCarregadas = resposta;
            }

            const propostaEncontrada = propostasCarregadas.find(p => p.id.toString() === id.toString());
            
            if (propostaEncontrada) {
                setPropostasFiltradas([propostaEncontrada]);
            } else {
                setPropostasFiltradas([]);
                setError('Proposta não encontrada com o ID informado.');
            }
        } catch (error) {
            setError(`Erro ao buscar proposta: ${error.message}`);
            setPropostasFiltradas([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        // Se o ID estiver preenchido, busca específica por ID
        if (filtros.id.trim() !== '') {
            await buscarPropostaPorId(filtros.id);
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
                descricao: '',
                cliente: '',
                data_criacao: '',
                valor_final: ''
            }));
        }
    };

    const limparFiltros = () => {
        setFiltros({
            id: '',
            descricao: '',
            cliente: '',
            data_criacao: '',
            valor_final: ''
        });
        buscarTodasPropostas();
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
            await ApiService.downloadPropostaPdf(id, versao);
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
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="id">ID</label>
                            <input
                                type="text"
                                id="id"
                                name="id"
                                placeholder="Número da Proposta"
                                value={filtros.id}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descricao">Descrição</label>
                            <input
                                type="text"
                                id="descricao"
                                name="descricao"
                                placeholder="Descrição"
                                value={filtros.descricao}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cliente">Cliente</label>
                            <input
                                type="text"
                                id="cliente"
                                name="cliente"
                                placeholder="Cliente"
                                value={filtros.cliente}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="data_criacao">Data</label>
                            <input
                                type="date"
                                id="data_criacao"
                                name="data_criacao"
                                value={filtros.data_criacao}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="valor_final">Valor</label>
                            <input
                                type="text"
                                id="valor_final"
                                name="valor_final"
                                placeholder="Valor"
                                value={filtros.valor_final}
                                onChange={handleInputChange}
                                disabled={filtros.id.trim() !== ''}
                            />
                        </div>
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
                                {propostasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            Nenhuma proposta encontrada
                                        </td>
                                    </tr>
                                ) : (
                                    propostasFiltradas.map((proposta) => (
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