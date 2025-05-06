import React, { useState, useEffect } from 'react';
import HeaderAdmin from '../CommonComponents/HeaderAdmin';
import ApiService from '../../services/ApiService';
import './RCAluguel.css';

function RCAluguel() {
    // Estados para controle de abas e formulário
    const [activeTab, setActiveTab] = useState('registro');
    const [loading, setLoading] = useState(false);
    const [centrosCusto, setCentrosCusto] = useState([]);
    const [alugueis, setAlugueis] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [aluguelEmEdicao, setAluguelEmEdicao] = useState(null);

    // Estados para o formulário de registro
    const [formRegistro, setFormRegistro] = useState({
        valor: '',
        detalhes: {
            dia_vencimento: '',
            pagamento: 'Transferência Bancária',
            obra_id: '',
            observacoes: ''
        }
    });

    // Estado para o formulário de edição
    const [formEdicao, setFormEdicao] = useState({
        id: null,
        valor: '',
        detalhes: {
            data_vencimento: '',
            dia_vencimento: '',
            pagamento: '',
            obra_id: '',
            observacoes: ''
        }
    });

    // Estados para os filtros de consulta
    const [filtros, setFiltros] = useState({
        campo: '',
        valor: '',
        dataInicial: '',
        dataFinal: '',
        obraId: ''
    });

    useEffect(() => {
        carregarCentrosCusto();
        if (activeTab === 'consulta') {
            buscarAlugueis();
        }
    }, [activeTab]);

    const carregarCentrosCusto = async () => {
        try {
            setLoading(true);
            // Usar o endpoint de propostas para obter os centros de custo
            const response = await ApiService.buscarPropostas();
            const listaCentrosCusto = response?.propostas || [];
            setCentrosCusto(listaCentrosCusto);
        } catch (error) {
            console.error('Erro ao carregar propostas:', error);
            alert('Não foi possível carregar a lista de propostas.');
        } finally {
            setLoading(false);
        }
    };

    const buscarAlugueis = async () => {
        try {
            setLoading(true);
            let filtrosParaBusca = {};
            
            // Se dataInicial e dataFinal estiverem preenchidos, usar o filtro por período
            if (filtros.dataInicial && filtros.dataFinal) {
                filtrosParaBusca = {
                    dataInicial: filtros.dataInicial,
                    dataFinal: filtros.dataFinal
                };
            } 
            // Se houver um centro de custo específico, filtrar por ele
            else if (filtros.obraId) {
                filtrosParaBusca = { obraId: filtros.obraId };
            } 
            // Se houver um campo e valor específicos, usar esse filtro
            else if (filtros.campo && filtros.valor) {
                filtrosParaBusca = {
                    campo: filtros.campo,
                    valor: filtros.valor
                };
            }
            
            const response = await ApiService.buscarAlugueis(filtrosParaBusca);
            setAlugueis(response || []);
        } catch (error) {
            console.error('Erro ao buscar aluguéis:', error);
            alert('Não foi possível carregar os aluguéis. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegistroSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Validação de dia de vencimento
            const diaVencimento = parseInt(formRegistro.detalhes.dia_vencimento);
            if (isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
                alert('O dia de vencimento deve ser um número entre 1 e 31.');
                setLoading(false);
                return;
            }
            
            // Converter valores para o formato correto conforme documentação da API
            const dadosParaEnvio = {
                valor: parseFloat(formRegistro.valor),
                detalhes: {
                    dia_vencimento: parseInt(formRegistro.detalhes.dia_vencimento),
                    pagamento: formRegistro.detalhes.pagamento,
                    obra_id: parseInt(formRegistro.detalhes.obra_id),
                    observacoes: formRegistro.detalhes.observacoes
                }
            };
            
            await ApiService.registrarAluguel(dadosParaEnvio);
            alert('Aluguel registrado com sucesso!');
            
            // Limpar formulário
            setFormRegistro({
                valor: '',
                detalhes: {
                    dia_vencimento: '',
                    pagamento: 'Transferência Bancária',
                    obra_id: '',
                    observacoes: ''
                }
            });
        } catch (error) {
            console.error('Erro ao registrar aluguel:', error);
            alert('Erro ao registrar aluguel. Verifique os dados e tente novamente.');
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

    const formatarNomeProposta = (proposta) => {
        const nome = proposta.client_info?.nome || proposta.client_info?.razao_social || proposta.title || proposta.nome || `Proposta #${proposta.id}`;
        const data = proposta.data_criacao ? ` - ${formatarData(proposta.data_criacao)}` : '';
        return `${nome}${data}`;
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

    const handleExcluirAluguel = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este aluguel? Esta ação é irreversível.')) {
            try {
                setLoading(true);
                await ApiService.excluirAluguel(id);
                alert('Aluguel excluído com sucesso!');
                buscarAlugueis(); // Recarrega a lista
            } catch (error) {
                console.error('Erro ao excluir aluguel:', error);
                alert('Erro ao excluir aluguel. Tente novamente.');
            } finally {
                setLoading(false);
            }
        }
    };

    // Abre o modal de edição e carrega os dados do aluguel
    const abrirModalEdicao = (aluguel) => {
        try {
            setLoading(true);
            
            // Usar os dados do aluguel já carregados na lista
            setAluguelEmEdicao(aluguel);
            
            // Formatar data de vencimento
            let dataVencimento = new Date();
            if (aluguel.detalhes.dia_vencimento) {
                const dia = parseInt(aluguel.detalhes.dia_vencimento);
                dataVencimento.setDate(dia);
            }
            
            // Formatar data YYYY-MM-DD
            const ano = dataVencimento.getFullYear();
            const mes = String(dataVencimento.getMonth() + 1).padStart(2, '0');
            const dia = String(dataVencimento.getDate()).padStart(2, '0');
            const dataFormatada = `${ano}-${mes}-${dia}`;
            
            // Preencher o formulário de edição
            setFormEdicao({
                id: aluguel.id,
                valor: aluguel.valor,
                detalhes: {
                    data_vencimento: dataFormatada,
                    dia_vencimento: aluguel.detalhes.dia_vencimento,
                    pagamento: aluguel.detalhes.pagamento || 'Transferência Bancária',
                    obra_id: aluguel.detalhes.obra_id,
                    observacoes: aluguel.detalhes.observacoes || ''
                }
            });
            
            setShowEditModal(true);
        } catch (error) {
            console.error('Erro ao carregar dados do aluguel:', error);
            alert('Erro ao carregar dados para edição. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdicaoSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // Validação de dia de vencimento
            const diaVencimento = parseInt(formEdicao.detalhes.dia_vencimento);
            if (isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
                alert('O dia de vencimento deve ser um número entre 1 e 31.');
                setLoading(false);
                return;
            }
            
            // Formatar dados conforme esperado pela API
            const dadosParaEnvio = {
                valor: parseFloat(formEdicao.valor),
                detalhes: {
                    dia_vencimento: formEdicao.detalhes.dia_vencimento,
                    pagamento: formEdicao.detalhes.pagamento,
                    obra_id: parseInt(formEdicao.detalhes.obra_id),
                    observacoes: formEdicao.detalhes.observacoes || ''
                }
            };
            
            // Enviar para API
            await ApiService.atualizarAluguel(formEdicao.id, dadosParaEnvio);
            
            alert('Aluguel atualizado com sucesso!');
            setShowEditModal(false);
            buscarAlugueis(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao atualizar aluguel:', error);
            alert('Erro ao atualizar aluguel. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Se for um campo do objeto detalhes
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormRegistro({
                ...formRegistro,
                [parent]: {
                    ...formRegistro[parent],
                    [child]: value
                }
            });
        } else {
            // Campo de nível superior
            setFormRegistro({
                ...formRegistro,
                [name]: value
            });
        }
    };

    const handleEdicaoChange = (e) => {
        const { name, value } = e.target;
        
        // Se for um campo do objeto detalhes
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormEdicao({
                ...formEdicao,
                [parent]: {
                    ...formEdicao[parent],
                    [child]: value
                }
            });
        } else {
            // Campo de nível superior
            setFormEdicao({
                ...formEdicao,
                [name]: value
            });
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros({
            ...filtros,
            [name]: value
        });
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
                                        step="1"
                                        name="valor"
                                        value={formRegistro.valor}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>DIA DE VENCIMENTO (1-31):</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        name="detalhes.dia_vencimento"
                                        value={formRegistro.detalhes.dia_vencimento}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>TIPO DE PAGAMENTO:</label>
                                    <input
                                        type="text"
                                        name="detalhes.pagamento"
                                        value={formRegistro.detalhes.pagamento}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Transferência Bancária, PIX, etc."
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>SELECIONE A PROPOSTA (CENTRO DE CUSTO):</label>
                                    <select
                                        name="detalhes.obra_id"
                                        value={formRegistro.detalhes.obra_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione uma proposta</option>
                                        {centrosCusto.map(proposta => (
                                            <option key={proposta.id} value={proposta.id}>
                                                {formatarNomeProposta(proposta)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>OBSERVAÇÕES:</label>
                                    <textarea
                                        name="detalhes.observacoes"
                                        value={formRegistro.detalhes.observacoes}
                                        onChange={handleInputChange}
                                        rows="3"
                                    ></textarea>
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
                        <div className="consulta-container-aluguel">
                            <form onSubmit={handleFiltroSubmit} className="filtro-container">
                                <div className="form-group">
                                    <label>Filtrar por:</label>
                                    <select
                                        name="campo"
                                        value={filtros.campo}
                                        onChange={handleFiltroChange}
                                    >
                                        <option value="">Selecione um campo</option>
                                        <option value="id">ID</option>
                                        <option value="valor">Valor</option>
                                        <option value="detalhes">Detalhes/Observações</option>
                                        <option value="created_at">Data de criação</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Valor de busca:</label>
                                    <input
                                        type="text"
                                        name="valor"
                                        value={filtros.valor}
                                        onChange={handleFiltroChange}
                                        placeholder="Digite o valor para buscar"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Data Inicial:</label>
                                    <input
                                        type="date"
                                        name="dataInicial"
                                        value={filtros.dataInicial}
                                        onChange={handleFiltroChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Data Final:</label>
                                    <input
                                        type="date"
                                        name="dataFinal"
                                        value={filtros.dataFinal}
                                        onChange={handleFiltroChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Proposta:</label>
                                    <select
                                        name="obraId"
                                        value={filtros.obraId}
                                        onChange={handleFiltroChange}
                                    >
                                        <option value="">Todas</option>
                                        {centrosCusto.map(proposta => (
                                            <option key={proposta.id} value={proposta.id}>
                                                {formatarNomeProposta(proposta)}
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
                                            <th>ID</th>
                                            <th>Valor</th>
                                            <th>Data de Vencimento</th>
                                            <th>Tipo de Pagamento</th>
                                            <th>Proposta</th>
                                            <th>Observações</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alugueis.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                                    {loading ? 'Carregando aluguéis...' : 'Nenhum aluguel encontrado.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            alugueis.map((aluguel) => (
                                                <tr key={aluguel.id}>
                                                    <td>{aluguel.id}</td>
                                                    <td>{formatarValor(aluguel.valor)}</td>
                                                    <td>Dia {aluguel.detalhes.dia_vencimento}</td>
                                                    <td>
                                                        {aluguel.detalhes.pagamento}
                                                    </td>
                                                    <td>
                                                        {centrosCusto.find(p => p.id === aluguel.detalhes.obra_id) 
                                                          ? formatarNomeProposta(centrosCusto.find(p => p.id === aluguel.detalhes.obra_id))
                                                          : `Proposta ID: ${aluguel.detalhes.obra_id}`}
                                                    </td>
                                                    <td>{aluguel.detalhes.observacoes}</td>
                                                    <td className="acoes-cell">
                                                        <button
                                                            className="action-button"
                                                            onClick={() => abrirModalEdicao(aluguel)}
                                                            disabled={loading || aluguel.finalizado}
                                                        >
                                                            Editar
                                                        </button>
                                                        {/* <button
                                                            className="action-button"
                                                            onClick={() => handleFinalizarAluguel(aluguel.id)}
                                                            disabled={loading || aluguel.finalizado}
                                                        >
                                                            {aluguel.finalizado ? 'Finalizado' : 'Finalizar'}
                                                        </button> */}
                                                        <button
                                                            className="action-button delete-button"
                                                            onClick={() => handleExcluirAluguel(aluguel.id)}
                                                            disabled={loading}
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
                        </div>
                    )}

                    {/* Modal de Edição */}
                    {showEditModal && (
                        <div className="modal-overlay">
                            <div className="modal-container">
                                <div className="modal-header">
                                    <h2>Editar Aluguel #{formEdicao.id}</h2>
                                    <button 
                                        className="close-button-aluguel"
                                        onClick={() => setShowEditModal(false)}
                                        disabled={loading}
                                    >
                                        &times;
                                    </button>
                                </div>
                                <form onSubmit={handleEdicaoSubmit} className="form-container modal-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>VALOR LÍQUIDO:</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="valor"
                                                value={formEdicao.valor}
                                                onChange={handleEdicaoChange}
                                                required
                                            />
                                        </div>

                                        {/* <div className="form-group">
                                            <label>DATA DE VENCIMENTO:</label>
                                            <input
                                                type="number"
                                                name="detalhes.data_vencimento"
                                                value={formEdicao.detalhes.data_vencimento ? new Date(formEdicao.detalhes.data_vencimento).getDate()+1 : 'ERR'} //este mais 1 é porque sem ele aparece o dia -1
                                                onChange={handleEdicaoChange}
                                                required
                                            />
                                        </div> */}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>DIA DE VENCIMENTO (1-31):</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                name="detalhes.dia_vencimento"
                                                value={formEdicao.detalhes.dia_vencimento}
                                                onChange={handleEdicaoChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>TIPO DE PAGAMENTO:</label>
                                            <select
                                                name="detalhes.pagamento"
                                                value={formEdicao.detalhes.pagamento}
                                                onChange={handleEdicaoChange}
                                                required
                                            >
                                                <option value="pix">PIX</option>
                                                <option value="ted">TED</option>
                                                <option value="boleto">Boleto</option>
                                                <option value="Transferência Bancária">Transferência Bancária</option>
                                                <option value="dinheiro">Dinheiro</option>
                                                <option value="cartao">Cartão</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>PROPOSTA (CENTRO DE CUSTO):</label>
                                            <select
                                                name="detalhes.obra_id"
                                                value={formEdicao.detalhes.obra_id}
                                                onChange={handleEdicaoChange}
                                                required
                                            >
                                                <option value="">Selecione uma proposta</option>
                                                {centrosCusto.map(proposta => (
                                                    <option key={proposta.id} value={proposta.id}>
                                                        {formatarNomeProposta(proposta)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>OBSERVAÇÕES:</label>
                                            <textarea
                                                name="detalhes.observacoes"
                                                value={formEdicao.detalhes.observacoes}
                                                onChange={handleEdicaoChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <button 
                                            type="submit" 
                                            className="submit-button"
                                            disabled={loading}
                                        >
                                            {loading ? 'Atualizando...' : 'Atualizar Aluguel'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default RCAluguel; 