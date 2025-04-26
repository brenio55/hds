import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CadastrarFuncionario.css';
import HeaderAdmin from './HeaderAdmin';
import ApiService from '../services/ApiService';

function CadastrarFuncionario() {
    const navigate = useNavigate();
    const { id } = useParams(); // Para caso de edição
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargos, setCargos] = useState([]);
    const [carregandoCargos, setCarregandoCargos] = useState(false);
    const [cargoSelecionado, setCargoSelecionado] = useState(null);
    const [propostas, setPropostas] = useState([]);
    const [carregandoPropostas, setCarregandoPropostas] = useState(false);
    const [formData, setFormData] = useState({
        cargo: '',
        cargo_id: '',
        contato: {
            email: '',
            telefone: '',
            endereco: ''
        },
        dados: {
            nome: '',
            cpf: '',
            rg: '',
            data_nascimento: '',
            banco: '',
            agencia: '',
            conta: '',
            pix: ''
        },
        propostas: []
    });

    // Carregar lista de cargos e propostas ao montar o componente
    useEffect(() => {
        carregarCargos();
        carregarPropostas();
        
        // Se for modo de edição, carregar dados do funcionário
        if (id) {
            carregarFuncionario(id);
        }
    }, [id]);

    // Carregar cargos disponíveis
    const carregarCargos = async () => {
        setCarregandoCargos(true);
        try {
            const listaCargos = await ApiService.buscarCargos();
            setCargos(listaCargos);
        } catch (error) {
            console.error('Erro ao carregar cargos:', error);
            setError('Não foi possível carregar a lista de cargos.');
        } finally {
            setCarregandoCargos(false);
        }
    };

    // Carregar propostas disponíveis
    const carregarPropostas = async () => {
        setCarregandoPropostas(true);
        try {
            const response = await ApiService.buscarPropostas();
            
            // Verificar o formato da resposta e extrair o array de propostas
            let listaPropostas = [];
            if (response && response.propostas && Array.isArray(response.propostas)) {
                // Se a resposta tiver o formato { total: X, propostas: [...] }
                listaPropostas = response.propostas;
            } else if (Array.isArray(response)) {
                // Se a resposta já for um array
                listaPropostas = response;
            } else if (response && typeof response === 'object') {
                // Se for outro formato de objeto, tentar extrair valores
                listaPropostas = Object.values(response).filter(item => typeof item === 'object');
            }
            
            setPropostas(listaPropostas);
            console.log("Propostas carregadas:", listaPropostas.length);
        } catch (error) {
            console.error('Erro ao carregar propostas:', error);
            setError('Não foi possível carregar a lista de propostas.');
        } finally {
            setCarregandoPropostas(false);
        }
    };

    // Carregar dados do funcionário para edição
    const carregarFuncionario = async (funcionarioId) => {
        setLoading(true);
        try {
            const funcionario = await ApiService.buscarFuncionarioPorId(funcionarioId);
            
            // Normalizar contato e dados que podem vir como string JSON
            let contatoObj = funcionario.contato;
            let dadosObj = funcionario.dados;
            
            if (typeof contatoObj === 'string') {
                try {
                    contatoObj = JSON.parse(contatoObj);
                } catch (e) {
                    contatoObj = {};
                }
            }
            
            if (typeof dadosObj === 'string') {
                try {
                    dadosObj = JSON.parse(dadosObj);
                } catch (e) {
                    dadosObj = {};
                }
            }
            
            // Mover nome de contato para dados se existir
            if (contatoObj && contatoObj.nome && (!dadosObj.nome || dadosObj.nome === '')) {
                dadosObj.nome = contatoObj.nome;
                delete contatoObj.nome;
            }
            
            // Extrair IDs das propostas para o formData
            const propostasIds = Array.isArray(funcionario.propostas) 
                ? funcionario.propostas.map(p => p.id) 
                : [];
            
            setFormData({
                cargo: funcionario.cargo || '',
                cargo_id: funcionario.cargo_id || '',
                contato: contatoObj || {},
                dados: dadosObj || {},
                propostas: propostasIds
            });
            
            // Se tiver cargo_id, selecionar o cargo correspondente
            if (funcionario.cargo_id) {
                const cargo = cargos.find(c => c.id === funcionario.cargo_id);
                setCargoSelecionado(cargo || null);
            }
        } catch (error) {
            console.error('Erro ao carregar funcionário:', error);
            setError('Não foi possível carregar os dados do funcionário.');
        } finally {
            setLoading(false);
        }
    };

    // Atualizar cargo selecionado quando selecionar um cargo na lista
    useEffect(() => {
        if (formData.cargo_id && cargos.length > 0) {
            const cargo = cargos.find(c => c.id == formData.cargo_id);
            setCargoSelecionado(cargo || null);
        }
    }, [formData.cargo_id, cargos]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContatoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contato: {
                ...prev.contato,
                [name]: value
            }
        }));
    };

    const handleDadosChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            dados: {
                ...prev.dados,
                [name]: value
            }
        }));
    };

    const handlePropostasChange = (e) => {
        // Converter os valores selecionados para um array de números
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        
        setFormData(prev => ({
            ...prev,
            propostas: selectedOptions
        }));
    };

    const formatarMoeda = (valor) => {
        if (valor === null || valor === undefined) return 'R$ 0,00';
        return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
    };

    const formatarNomeProposta = (proposta) => {
        if (!proposta) return 'Proposta sem nome';
        
        // Se tiver número, usar como prefixo
        const numero = proposta.numero ? `#${proposta.numero} - ` : '';
        
        // Prioridade para campos que podem conter nome do cliente
        const clientNome = proposta.client_info && typeof proposta.client_info === 'object' 
            ? proposta.client_info.nome || proposta.client_info.nome_cliente || proposta.client_info.cliente
            : '';
            
        // Alternativa: tentar extrair de string JSON
        let clienteFromJson = '';
        if (proposta.client_info && typeof proposta.client_info === 'string') {
            try {
                const clientObj = JSON.parse(proposta.client_info);
                clienteFromJson = clientObj.nome || clientObj.nome_cliente || clientObj.cliente || '';
            } catch (e) {
                // Ignorar erro de parse
            }
        }
        
        // Usar o melhor nome disponível
        const nome = clientNome || clienteFromJson || proposta.titulo || proposta.descricao || `ID: ${proposta.id}`;
        
        return `${numero}${nome}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Verificar se estamos criando ou atualizando
            let response;
            
            if (id) {
                // Edição de funcionário existente
                response = await ApiService.atualizarFuncionario(id, formData);
                setSuccess('Funcionário atualizado com sucesso!');
            } else {
                // Criação de novo funcionário
                response = await ApiService.criarFuncionario(formData);
                setSuccess('Funcionário cadastrado com sucesso!');
            }
            
            console.log('Resposta da API:', response);
            
            // Limpar o formulário em caso de criação
            if (!id) {
                setFormData({
                    cargo: '',
                    cargo_id: '',
                    contato: {
                        email: '',
                        telefone: '',
                        endereco: ''
                    },
                    dados: {
                        nome: '',
                        cpf: '',
                        rg: '',
                        data_nascimento: '',
                        banco: '',
                        agencia: '',
                        conta: '',
                        pix: ''
                    },
                    propostas: []
                });
            }
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/admin/consultarFuncionarios');
            }, 2000);
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
            setError(error.message || 'Ocorreu um erro ao salvar os dados do funcionário.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="cadastrar-funcionario-container">
                <h2>{id ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</h2>
                
                {success && (
                    <div className="success-message">
                        {success} Redirecionando...
                    </div>
                )}
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Informações Profissionais</h3>
                        
                        <div className="form-group">
                            <label htmlFor="cargo_id">Cargo/Função*</label>
                            <select
                                id="cargo_id"
                                name="cargo_id"
                                value={formData.cargo_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione um cargo</option>
                                {carregandoCargos ? (
                                    <option disabled>Carregando cargos...</option>
                                ) : (
                                    cargos.map(cargo => (
                                        <option key={cargo.id} value={cargo.id}>
                                            {cargo.nome}
                                        </option>
                                    ))
                                )}
                            </select>
                            {cargoSelecionado && (
                                <div className="cargo-info">
                                    <h4>Informações de Valores por Hora (HH)</h4>
                                    <p><strong>Valor HH Normal:</strong> {formatarMoeda(cargoSelecionado.valor_hh)}</p>
                                    <p><strong>Valor HH + 60%:</strong> {formatarMoeda(cargoSelecionado.valor_hh * 1.6)}</p>
                                    <p><strong>Valor HH + 100%:</strong> {formatarMoeda(cargoSelecionado.valor_hh * 2)}</p>
                                    <p className="cargo-info-note">Estes valores serão usados nos registros de horas trabalhadas para este funcionário.</p>
                                </div>
                            )}
                            <div className="form-group-footer">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/cadastrarCargo'); }}>
                                    + Cadastrar novo cargo
                                </a>
                            </div>
                        </div>
                        
                        {/* <div className="form-group">
                            <label htmlFor="cargo">Cargo/Função (Descrição Manual)</label>
                            <input
                                type="text"
                                id="cargo"
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleInputChange}
                                placeholder="Descrição opcional do cargo (caso não selecione acima)"
                            />
                        </div> */}
                        
                        <div className="form-group">
                            <label htmlFor="propostas">Propostas/Obras (Múltipla seleção)</label>
                            <select
                                id="propostas"
                                name="propostas"
                                value={formData.propostas}
                                onChange={handlePropostasChange}
                                multiple
                                className="select-multiple"
                            >
                                {carregandoPropostas ? (
                                    <option disabled>Carregando propostas...</option>
                                ) : propostas.length > 0 ? (
                                    propostas.map(proposta => (
                                        <option key={proposta.id} value={proposta.id}>
                                            {proposta.id} - {formatarNomeProposta(proposta)}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Nenhuma proposta disponível</option>
                                )}
                            </select>
                            <div className="form-hint">
                                Use CTRL+Clique para selecionar múltiplas propostas
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Informações Pessoais</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nome">Nome Completo*</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.dados.nome || ''}
                                    onChange={handleDadosChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cpf">CPF*</label>
                                <input
                                    type="text"
                                    id="cpf"
                                    name="cpf"
                                    value={formData.dados.cpf || ''}
                                    onChange={handleDadosChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="rg">RG</label>
                                <input
                                    type="text"
                                    id="rg"
                                    name="rg"
                                    value={formData.dados.rg || ''}
                                    onChange={handleDadosChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="data_nascimento">Data de Nascimento</label>
                                <input
                                    type="date"
                                    id="data_nascimento"
                                    name="data_nascimento"
                                    value={formData.dados.data_nascimento || ''}
                                    onChange={handleDadosChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Informações de Contato</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">E-mail</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.contato.email || ''}
                                    onChange={handleContatoChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefone">Telefone*</label>
                                <input
                                    type="text"
                                    id="telefone"
                                    name="telefone"
                                    value={formData.contato.telefone || ''}
                                    onChange={handleContatoChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="endereco">Endereço</label>
                                <input
                                    type="text"
                                    id="endereco"
                                    name="endereco"
                                    value={formData.contato.endereco || ''}
                                    onChange={handleContatoChange}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Informações Bancárias</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="banco">Banco</label>
                                <input
                                    type="text"
                                    id="banco"
                                    name="banco"
                                    value={formData.dados.banco || ''}
                                    onChange={handleDadosChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="agencia">Agência</label>
                                <input
                                    type="text"
                                    id="agencia"
                                    name="agencia"
                                    value={formData.dados.agencia || ''}
                                    onChange={handleDadosChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="conta">Conta</label>
                                <input
                                    type="text"
                                    id="conta"
                                    name="conta"
                                    value={formData.dados.conta || ''}
                                    onChange={handleDadosChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pix">Chave PIX</label>
                                <input
                                    type="text"
                                    id="pix"
                                    name="pix"
                                    value={formData.dados.pix || ''}
                                    onChange={handleDadosChange}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => navigate('/admin/consultarFuncionarios')}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : id ? 'Atualizar Funcionário' : 'Cadastrar Funcionário'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default CadastrarFuncionario; 