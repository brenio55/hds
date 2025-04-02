import supabase from '../utils/Supabase';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL;

// Verificar se o localStorage está disponível
const isLocalStorageAvailable = () => {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.error('localStorage não está disponível:', e);
        return false;
    }
};

// Função para gerenciar o token
const getStoredToken = () => {
    if (!isLocalStorageAvailable()) {
        console.error('Não foi possível recuperar o token: localStorage não disponível');
        return null;
    }
    const token = localStorage.getItem('authToken');
    console.log('Token recuperado do localStorage:', token);
    return token;
};

const setStoredToken = (token) => {
    if (!isLocalStorageAvailable()) {
        console.error('Não foi possível armazenar o token: localStorage não disponível');
        return;
    }
    console.log('Armazenando token no localStorage:', token);
    localStorage.setItem('authToken', token);
};

const removeStoredToken = () => {
    if (!isLocalStorageAvailable()) {
        console.error('Não foi possível remover o token: localStorage não disponível');
        return;
    }
    console.log('Removendo token do localStorage');
    localStorage.removeItem('authToken');
};

// Função para criar headers com autenticação
const createAuthHeaders = () => {
    const token = getStoredToken();
    console.log('Token usado nos headers:', token);
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Classe ApiService
class ApiService {
    // Métodos relacionados a Pedidos
    static async gerarNumeroPedido() {
        try {
            const response = await fetch(`${API_URL}/pedidos/proximo-numero`, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao gerar número do pedido');
            }

            const data = await response.json();
            return data.numero;
        } catch (error) {
            console.error('Erro ao gerar número do pedido:', error);
            throw error;
        }
    }

    static async criarPedido(pedidoData) {
        try {
            console.log('Iniciando criação de pedido de material:', pedidoData);
            
            // Garantir que os campos numéricos sejam números e não strings
            const formatarValor = (valor) => {
                if (valor === undefined || valor === null) return 0;
                if (typeof valor === 'number') return valor;
                if (typeof valor === 'string') {
                    // Remover símbolos de moeda, converter vírgula para ponto
                    return parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
                }
                return 0;
            };
            
            // Criar cópia dos dados para não modificar o original
            const dadosFormatados = { ...pedidoData };
            
            // O backend espera que materiais e frete sejam enviados como objetos JSON, não strings
            // No PostgreSQL serão armazenados como JSONB, mas o backend fará a conversão adequada
            
            // Verificar os materiais
            if (!dadosFormatados.materiais) {
                dadosFormatados.materiais = [];
            }
            
            // Verificar frete
            if (!dadosFormatados.frete) {
                dadosFormatados.frete = { tipo: 'CIF' };
            }
            
            // Garantir que os campos numéricos sejam números
            dadosFormatados.fornecedores_id = dadosFormatados.fornecedores_id ? parseInt(dadosFormatados.fornecedores_id) : null;
            dadosFormatados.clientinfo_id = dadosFormatados.clientinfo_id ? parseInt(dadosFormatados.clientinfo_id) : null;
            dadosFormatados.proposta_id = dadosFormatados.proposta_id ? parseInt(dadosFormatados.proposta_id) : null;
            dadosFormatados.desconto = formatarValor(dadosFormatados.desconto);
            dadosFormatados.valor_frete = formatarValor(dadosFormatados.valor_frete);
            dadosFormatados.despesas_adicionais = formatarValor(dadosFormatados.despesas_adicionais);
            
            console.log('Dados formatados para envio ao backend:', dadosFormatados);
            console.log('Tipo de materiais:', typeof dadosFormatados.materiais);
            console.log('Tipo de clientinfo_id:', typeof dadosFormatados.clientinfo_id);
            console.log('Tipo de fornecedores_id:', typeof dadosFormatados.fornecedores_id);
            
            const response = await fetch(`${API_URL}/api/pedidos-compra`, {
                method: 'POST',
                headers: {
                    ...await createAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosFormatados)
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(errorData.error || 'Erro ao criar pedido de compra');
            }
    
            const data = await response.json();
            console.log('Pedido de material criado com sucesso:', data);
            return data;
        } catch (error) {
            console.error('Erro ao criar pedido de material:', error);
            throw error;
        }
    }

    // Métodos relacionados a Clientes
    static async atualizarOuCriarCliente(dadosCliente) {
        try {
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosCliente)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar/criar cliente');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao atualizar/criar cliente:', error);
            throw error;
        }
    }

    // Métodos relacionados a Usuários
    static async registerUser(userData, authorizationCode) {
        try {
            const requestData = {
                username: userData.userName,
                password: userData.password,
                role: 'user'
            };

            console.log('URL da API:', API_URL);
            console.log('URL completa:', `${API_URL}/auth/register`);
            console.log('Enviando requisição de registro:', requestData);

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData),
                credentials: 'include',
                mode: 'cors'
            });

            console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
            console.log('Status da resposta:', response.status);
            console.log('Status text:', response.statusText);

            let responseText;
            try {
                responseText = await response.text();
                console.log('Resposta bruta:', responseText);
                const data = responseText ? JSON.parse(responseText) : {};
                console.log('Dados da resposta:', data);

                if (!response.ok) {
                    const errorMessage = data.errors ? 
                        data.errors.map(err => err.msg).join(', ') : 
                        data.error || 'Erro ao registrar usuário';
                    throw new Error(errorMessage);
                }

                return data;
            } catch (parseError) {
                console.error('Erro ao parsear resposta:', parseError);
                console.log('Resposta que falhou:', responseText);
                throw new Error('Erro ao processar resposta do servidor');
            }
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            throw error;
        }
    }

    static async login(username, password) {
        try {
            const requestData = {
                username,
                password
            };

            console.log('URL da API:', API_URL);
            console.log('URL completa:', `${API_URL}/auth/login`);
            console.log('Enviando requisição de login:', requestData);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData),
                credentials: 'include',
                mode: 'cors'
            });

            console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
            console.log('Status da resposta:', response.status);
            console.log('Status text:', response.statusText);

            let responseText;
            try {
                responseText = await response.text();
                console.log('Resposta bruta:', responseText);
                const data = responseText ? JSON.parse(responseText) : {};
                console.log('Dados da resposta:', data);

                if (!response.ok) {
                    const errorMessage = data.errors ? 
                        data.errors.map(err => err.msg).join(', ') : 
                        data.error || 'Erro ao fazer login';
                    throw new Error(errorMessage);
                }
                
                // Armazenar o token diretamente
                if (data.token) {
                    console.log('Token recebido do servidor:', data.token);
                    
                    // Validar o token antes de armazenar
                    if (typeof data.token !== 'string' || data.token.trim() === '') {
                        console.error('ERRO: Token inválido recebido do servidor:', data.token);
                    } else {
                        // Armazenar o token diretamente no localStorage
                        try {
                            localStorage.setItem('authToken', data.token);
                            console.log('Token armazenado diretamente no localStorage');
                            
                            // Verificar imediatamente se o token foi armazenado
                            const storedToken = localStorage.getItem('authToken');
                            console.log('Token verificado após armazenamento direto:', storedToken);
                            
                            if (!storedToken) {
                                console.error('ERRO: Token não foi armazenado no localStorage mesmo com acesso direto');
                                
                                // Tentar uma abordagem alternativa - armazenar em uma variável global
                                window.authToken = data.token;
                                console.log('Token armazenado em variável global como fallback');
                            }
                        } catch (storageError) {
                            console.error('Erro ao armazenar token no localStorage:', storageError);
                            
                            // Fallback para variável global
                            window.authToken = data.token;
                            console.log('Token armazenado em variável global devido a erro no localStorage');
                        }
                    }
                } else {
                    console.error('ERRO: Resposta de login não contém token');
                }

                return data;
            } catch (parseError) {
                console.error('Erro ao parsear resposta:', parseError);
                console.log('Resposta que falhou:', responseText);
                throw new Error('Erro ao processar resposta do servidor');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        }
    }

    static logout() {
        removeStoredToken();
    }

    static async getProfile() {
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar perfil do usuário');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            throw error;
        }
    }

    // Métodos relacionados a Propostas
    static async criarProposta(dadosProposta) {
        try {
            const response = await fetch(`${API_URL}/api/propostas`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosProposta)
            });

            if (!response.ok) {
                throw new Error('Erro ao criar proposta');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao criar proposta:', error);
            throw error;
        }
    }

    static async buscarPropostas(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/propostas/search${queryParams ? `?${queryParams}` : ''}`;
            
            console.log('Buscando propostas da API:', url);
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar propostas');
            }

            // Processar a resposta e garantir o formato correto
            const data = await response.json();
            console.log('Resposta da API propostas:', data);
            
            // Formatar a resposta para o formato esperado pelo frontend
            let propostas = [];
            
            // Se a resposta já for um array, use-a
            if (Array.isArray(data)) {
                propostas = data;
            } 
            // Se a resposta tiver uma propriedade 'propostas' que é um array, use-a
            else if (data && Array.isArray(data.propostas)) {
                propostas = data.propostas;
            } 
            // Se a resposta for um objeto com propostas como valores
            else if (data && typeof data === 'object') {
                propostas = Object.values(data);
            }
            
            // Verificar se cada proposta tem o campo client_info
            propostas = propostas.map(proposta => {
                // Se não tiver client_info, adicionar um objeto vazio
                if (!proposta.client_info) {
                    proposta.client_info = {};
                }
                return proposta;
            });
            
            return { 
                propostas,
                total: propostas.length
            };
        } catch (error) {
            console.error('Erro ao buscar propostas:', error);
            // Retornar objeto com array vazio em caso de erro
            return { 
                propostas: [],
                total: 0,
                erro: true,
                mensagem: error.message
            };
        }
    }

    // Método auxiliar para visualizar qualquer PDF
    static async _visualizarPdf(url) {
        try {
            console.log(`Iniciando visualização de PDF de: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...await createAuthHeaders()
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro ao buscar PDF`);
            }

            const blob = await response.blob();
            const url_objeto = window.URL.createObjectURL(blob);
            window.open(url_objeto, '_blank');
            
            // Limpar URL temporária após uso
            setTimeout(() => {
                window.URL.revokeObjectURL(url_objeto);
            }, 100);
            
            return true;
        } catch (error) {
            console.error(`Erro ao visualizar PDF:`, error);
            throw error;
        }
    }

    // --- Métodos de visualização de PDF ---
    // Visualizar PDF de pedido de material
    static async visualizarPedidoPdf(id) {
        return this._visualizarPdf(`${API_URL}/api/pedidos-compra/${id}/pdf/download`);
    }

    // Visualizar PDF de pedido de serviço
    static async visualizarPedidoServicoPdf(id) {
        return this._visualizarPdf(`${API_URL}/api/servicos/${id}/pdf/download`);
    }

    // Visualizar PDF de pedido de locação
    static async visualizarPedidoLocacaoPdf(id) {
        return this._visualizarPdf(`${API_URL}/api/pedidos-locacao/${id}/pdf/download`);
    }

    // Visualizar PDF de proposta
    static async visualizarPdf(id, version) {
        return this._visualizarPdf(`${API_URL}/api/propostas/${id}/pdf/download?version=${version}`);
    }

    // Método para download do PDF de pedido de compra
    static async downloadPedidoPdf(id) {
        try {
            const response = await fetch(
                `${API_URL}/api/pedidos-compra/${id}/pdf/download`,
                {
                    headers: createAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao baixar PDF do pedido');
            }

            // Obtém o nome do arquivo do header Content-Disposition
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'pedido.pdf';
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Cria um link temporário para download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Limpa após o download
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Erro ao baixar PDF do pedido:', error);
            throw error;
        }
    }

    // Métodos relacionados a Pedidos de Compra
    static async buscarPedidosCompra(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/pedidos-compra${queryParams ? `?${queryParams}` : ''}`;
            
            try {
                const response = await fetch(url, {
                    headers: createAuthHeaders()
                });
    
                if (!response.ok) {
                    throw new Error('Erro ao buscar pedidos de compra');
                }
    
                const data = await response.json();
                return data;
            } catch (apiError) {
                console.warn('Erro ao buscar da API, usando dados de exemplo:', apiError);
                // Se a API falhar, carrega dados de exemplo
                const dadosExemplo = await this.carregarDadosExemplo();
                
                // Aplicar filtros nos dados de exemplo
                if (Object.keys(filtros).length > 0) {
                    return dadosExemplo.filter(pedido => {
                        let match = true;
                        if (filtros.id && pedido.id.toString() !== filtros.id.toString()) {
                            match = false;
                        }
                        if (filtros.tipo && pedido.tipo !== filtros.tipo) {
                            match = false;
                        }
                        if (filtros.centroCusto && pedido.proposta_id.toString() !== filtros.centroCusto.toString()) {
                            match = false;
                        }
                        return match;
                    });
                }
                
                return dadosExemplo;
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos de compra:', error);
            throw error;
        }
    }

    

    static async buscarPedidosDeLocacao(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/pedidos-locacao${queryParams ? `?${queryParams}` : ''}`;
            
            try {
                const response = await fetch(url, {
                    headers: createAuthHeaders()
                });
    
                if (!response.ok) {
                    throw new Error('Erro ao buscar pedidos de compra');
                }
    
                const data = await response.json();
                return data;
            } catch (apiError) {
                console.warn('Erro ao buscar da API, usando dados de exemplo:', apiError);
                // Se a API falhar, carrega dados de exemplo
                const dadosExemplo = await this.carregarDadosExemplo();
                
                // Aplicar filtros nos dados de exemplo
                if (Object.keys(filtros).length > 0) {
                    return dadosExemplo.filter(pedido => {
                        let match = true;
                        if (filtros.id && pedido.id.toString() !== filtros.id.toString()) {
                            match = false;
                        }
                        if (filtros.tipo && pedido.tipo !== filtros.tipo) {
                            match = false;
                        }
                        if (filtros.centroCusto && pedido.proposta_id.toString() !== filtros.centroCusto.toString()) {
                            match = false;
                        }
                        return match;
                    });
                }
                
                return dadosExemplo;
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos de compra:', error);
            throw error;
        }
    }

     // ===== Métodos para Pedidos de Locação =====
    
    /**
     * Cria um novo pedido de locação
     * @param {Object} pedidoData - Dados do pedido de locação
     * @returns {Promise<Object>} - Dados do pedido criado
     */
    static async criarPedidoLocacao(pedidoData) {
        try {
            console.log('ApiService: Enviando pedido de locação:', pedidoData);
            
            // Garantir que os itens estejam em formato string JSON
            if (pedidoData.itens && typeof pedidoData.itens !== 'string') {
                pedidoData.itens = JSON.stringify(pedidoData.itens);
            }
            
            const response = await fetch(`${API_URL}/api/pedidos-locacao`, {
                method: 'POST',
                headers: {
                    ...createAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedidoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar pedido de locação');
            }

            const data = await response.json();
            console.log('ApiService: Pedido de locação criado com sucesso:', data);
            return data;
        } catch (error) {
            console.error('ApiService: Erro ao criar pedido de locação:', error);
            throw error;
        }
    }

    /**
     * Atualiza um pedido de locação existente
     * @param {number} id - ID do pedido a ser atualizado
     * @param {Object} dadosPedido - Novos dados do pedido
     * @returns {Promise<Object>} - Dados do pedido atualizado
     */
    static async atualizarPedidoLocacao(id, dadosPedido) {
        try {
            const response = await fetch(`${API_URL}/api/pedidos-locacao/${id}`, {
                method: 'PUT',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosPedido)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar pedido de locação');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar pedido de locação:', error);
            throw error;
        }
    }

    /**
     * Lista todos os pedidos de locação com filtros opcionais
     * @param {Object} filtros - Filtros a serem aplicados na busca
     * @returns {Promise<Array>} - Lista de pedidos de locação
     */
    static async listarPedidosLocacao(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/pedidos-locacao${queryParams ? `?${queryParams}` : ''}`;
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao listar pedidos de serviço');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao listar pedidos de serviço:', error);
            throw error;
        }
    }

    /**
     * Busca um pedido de serviço por ID
     * @param {number} id - ID do pedido a ser buscado
     * @returns {Promise<Object>} - Dados do pedido 
     */
    static async buscarPedidoServicoPorId(id) {
        try {
            const response = await fetch(`${API_URL}/api/servicos/${id}`, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar pedido de serviço');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar pedido de serviço:', error);
            throw error;
        }
    }

    /**
     * Faz o download do PDF de um pedido de serviço
     * @param {number} id - ID do pedido 
     * @returns {Promise<Blob>} - Blob contendo o PDF
     */
    static async downloadPedidoServicoPdf(id) {
        try {
            const response = await fetch(
                `${API_URL}/api/servicos/${id}/pdf/download`,
                {
                    headers: createAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao baixar PDF do pedido de serviço');
            }

            // Obtém o nome do arquivo do header Content-Disposition
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'pedido-servico.pdf';
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Cria um link temporário para download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Limpa após o download
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return true;
        } catch (error) {
            console.error('Erro ao baixar PDF do pedido de serviço:', error);
            throw error;
        }
    }

    /**
     * Busca pedidos de serviço com filtros opcionais (com fallback para dados de exemplo)
     * @param {Object} filtros - Filtros para a busca
     * @returns {Promise<Object>} - Objeto com total e lista de pedidos
     */
    static async buscarPedidosServico(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/servicos${queryParams ? `?${queryParams}` : ''}`;
            
            try {
                const response = await fetch(url, {
                    headers: createAuthHeaders()
                });
    
                if (!response.ok) {
                    throw new Error('Erro ao buscar pedidos de serviço');
                }
    
                const data = await response.json();
                return data;
            } catch (apiError) {
                console.warn('Erro ao buscar da API, usando dados de exemplo:', apiError);
                // Se a API falhar, carrega dados de exemplo
                const dadosExemplo = await this.carregarDadosExemplo();
                
                // Aplica filtros nos dados de exemplo
                if (Object.keys(filtros).length > 0) {
                    return dadosExemplo.filter(pedido => {
                        let match = true;
                        if (filtros.id && pedido.id.toString() !== filtros.id.toString()) {
                            match = false;
                        }
                        if (filtros.tipo && pedido.tipo !== 'servico') {
                            match = false;
                        }
                        if (filtros.centroCusto && pedido.proposta_id.toString() !== filtros.centroCusto.toString()) {
                            match = false;
                        }
                        return match;
                    });
                }
                
                return dadosExemplo.filter(pedido => pedido.tipo === 'servico');
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos de serviço:', error);
            throw error;
        }
    }

    /**
     * Busca todos os pedidos consolidados (compra, locação e serviço)
     * @param {Object} filtros - Filtros a serem aplicados na busca
     * @returns {Promise<Object>} - Objeto com a lista de pedidos e total
     */
    static async buscarPedidosConsolidados(filtros = {}) {
        try {
            console.log("ApiService: Buscando pedidos consolidados");
            
            // Adicionar token de autorização ao cabeçalho
            const authHeaders = createAuthHeaders();
            
            // Construir URL com parâmetros de consulta
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/pedidos-consolidados${queryParams ? `?${queryParams}` : ''}`;
            
            console.log(`ApiService: URL da requisição: ${url}`);

            const response = await fetch(url, {
                headers: authHeaders,
                method: 'GET'
            });

            if (!response.ok) {
                console.error(`ApiService: Erro na resposta (status ${response.status}): ${response.statusText}`);
                throw new Error(`Erro ao buscar pedidos consolidados: ${response.statusText}`);
            }

            console.log(`ApiService: Resposta recebida (status ${response.status})`);
            
            try {
                const data = await response.json();
                console.log(`ApiService: JSON parseado com sucesso. Total: ${data.total || 0}`);
                
                // Garantir que o formato dos dados está correto
                if (!data.pedidos || !Array.isArray(data.pedidos)) {
                    console.warn('ApiService: Resposta da API não contém um array de pedidos');
                    data.pedidos = [];
                }
                
                // Garantir que cada pedido tenha as propriedades necessárias
                const pedidosFormatados = data.pedidos.map(pedido => {
                    // Adicionar valores padrão para campos importantes
                    if (!pedido.cliente) {
                        pedido.cliente = { id: 0, nome: 'Cliente não especificado' };
                    }
                    if (!pedido.fornecedor) {
                        pedido.fornecedor = { id: 0, nome: 'Fornecedor não especificado' };
                    }
                    if (!pedido.proposta) {
                        pedido.proposta = { id: 0, descricao: 'Proposta não especificada' };
                    }
                    
                    // Garantir que os valores financeiros existam
                    pedido.valor_total = pedido.valor_total || 0;
                    pedido.valor_faturado = pedido.valor_faturado || 0;
                    pedido.valor_a_faturar = pedido.valor_a_faturar || 0;
                    
                    return pedido;
                });
                
                return {
                    total: data.total || pedidosFormatados.length,
                    pedidos: pedidosFormatados
                };
                
                } catch (jsonError) {
                console.error('ApiService: Erro ao processar JSON da resposta:', jsonError);
                    throw new Error('Erro ao processar resposta do servidor');
            }
        } catch (error) {
            console.error('ApiService: Erro geral ao buscar pedidos consolidados:', error);
            
            // Retornar um objeto vazio em caso de erro para não quebrar a UI
            return { 
                total: 0, 
                pedidos: [], 
                erro: true,
                mensagem: error.message 
            };
        }
    }

    // Métodos para Faturamentos
    static async criarFaturamento(dadosFaturamento) {
        try {
            const response = await fetch(`${API_URL}/api/faturamentos`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosFaturamento)
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar faturamento: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar faturamento:', error);
            throw error;
        }
    }

    static async buscarFaturamentos(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/faturamentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar faturamentos: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar faturamentos:', error);
            throw error;
        }
    }

    static async atualizarFaturamento(id, dadosFaturamento) {
        try {
            const response = await fetch(`${API_URL}/api/faturamentos/${id}`, {
                method: 'PUT',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosFaturamento)
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar faturamento: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar faturamento:', error);
            throw error;
        }
    }

    static async deletarFaturamento(id) {
        try {
            const response = await fetch(`${API_URL}/api/faturamentos/${id}`, {
                method: 'DELETE',
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Erro ao deletar faturamento: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao deletar faturamento:', error);
            throw error;
        }
    }

    // Métodos para Funcionários
    static async criarFuncionario(dadosFuncionario) {
        try {
            const response = await fetch(`${API_URL}/api/funcionarios`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosFuncionario)
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar funcionário: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            throw error;
        }
    }

    static async buscarFuncionarios() {
        try {
            const response = await fetch(`${API_URL}/api/funcionarios`, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar funcionários: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            throw error;
        }
    }

    static async buscarFuncionarioPorId(id) {
        try {
            const response = await fetch(`${API_URL}/api/funcionarios/${id}`, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar funcionário: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar funcionário:', error);
            throw error;
        }
    }

    static async atualizarFuncionario(id, dadosFuncionario) {
        try {
            const response = await fetch(`${API_URL}/api/funcionarios/${id}`, {
                method: 'PUT',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosFuncionario)
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar funcionário: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            throw error;
        }
    }

    static async deletarFuncionario(id) {
        try {
            const response = await fetch(`${API_URL}/api/funcionarios/${id}`, {
                method: 'DELETE',
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Erro ao deletar funcionário: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao deletar funcionário:', error);
            throw error;
        }
    }

    // Métodos para Reembolsos
    static async criarReembolso(dadosReembolso) {
        console.log("ApiService: Criando reembolso (enviando como JSON):", dadosReembolso);
        const url = `${API_URL}/api/reembolso`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosReembolso)
            });
            
            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.mensagem || 'Erro ao criar reembolso');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar reembolso:', error);
            throw error;
        }
    }
    
    static async buscarReembolsos(filtros = {}) {
        console.log("ApiService: Buscando reembolsos com filtros:", filtros);
        let url = `${API_URL}/api/reembolso`;
        
        // Adicionar filtros à URL se houver
        if (Object.keys(filtros).length > 0) {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(filtros)) {
                if (value) params.append(key, value);
            }
            url += `?${params.toString()}`;
        }
        
        console.log("URL para buscar reembolsos:", url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: createAuthHeaders()
            });
            
            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.mensagem || 'Erro ao buscar reembolsos');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar reembolsos:', error);
            throw error;
        }
    }
    
    static async atualizarReembolso(id, dadosReembolso) {
        console.log(`ApiService: Atualizando reembolso ID ${id} (enviando como JSON):`, dadosReembolso);
        const url = `${API_URL}/api/reembolso/${id}`;
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosReembolso)
            });
            
            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.mensagem || 'Erro ao atualizar reembolso');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar reembolso:', error);
            throw error;
        }
    }
    
    static async excluirReembolso(id) {
        try {
            console.log(`Excluindo reembolso ${id}`);
            const response = await fetch(`${API_URL}/api/reembolso/${id}`, {
                method: 'DELETE',
                headers: createAuthHeaders()
            });
            
            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.mensagem || 'Erro ao excluir reembolso');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao excluir reembolso:', error);
            throw error;
        }
    }

    /**
     * Consulta os pedidos que já foram faturados
     * @param {Object} filtros - Filtros opcionais para a consulta 
     * @returns {Promise<Array>} - Lista de pedidos faturados
     */
    static async consultarPedidosFaturados(filtros = {}) {
        try {
            console.log('Consultando pedidos faturados com filtros:', filtros);
            
            // Construir query string com os filtros
            const queryParams = new URLSearchParams();
            
            if (filtros.tipo && filtros.tipo !== 'todos') {
                queryParams.append('tipo', filtros.tipo);
            }
            
            if (filtros.numeroPedido) {
                queryParams.append('numeroPedido', filtros.numeroPedido);
            }
            
            if (filtros.dataInicial) {
                queryParams.append('dataInicial', filtros.dataInicial);
            }
            
            if (filtros.dataFinal) {
                queryParams.append('dataFinal', filtros.dataFinal);
            }
            
            // Adicionar flag específica para pedidos faturados
            queryParams.append('faturado', 'true');
            
            const url = `${API_URL}/api/pedidos-consolidados${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            console.log('URL para consulta de pedidos faturados:', url);
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na resposta ao consultar pedidos faturados:', errorText);
                throw new Error(`Erro ao consultar pedidos faturados: ${response.statusText || errorText}`);
            }
            
            const pedidosFaturados = await response.json();
            console.log('Pedidos faturados recebidos:', pedidosFaturados);
            
            // Buscar informações de faturamento para cada pedido para calcular valores atualizados
            const pedidosDetalhados = [];
            
            // Mapear para o formato esperado pelo frontend
            if (Array.isArray(pedidosFaturados)) {
                for (const pedido of pedidosFaturados) {
                    try {
                        // Buscar faturamentos específicos do pedido para calcular valor faturado atual
                        const faturamentosPedido = await this.consultarFaturamentos({
                            tipo: pedido.tipo || 'compra',
                            numeroPedido: pedido.id
                        });
                        
                        // Calcular valor total faturado somando todos os faturamentos
                        const valorFaturado = faturamentosPedido.reduce(
                            (total, fat) => total + parseFloat(fat.valorFaturado || 0), 
                            0
                        );
                        
                        // Calcular valor total do pedido, valor faturado e valor restante
                        const valorTotal = parseFloat(pedido.valor_total || 0);
                        const valorRestante = Math.max(0, valorTotal - valorFaturado);
                        const porcentagemFaturada = valorTotal > 0 
                            ? Math.min(100, (valorFaturado / valorTotal * 100))
                            : 0;
                        
                        pedidosDetalhados.push({
                            id: pedido.id,
                            numero: pedido.numero || pedido.id,
                            tipo: pedido.tipo || 'compra',
                            dataFaturamento: pedido.data_faturamento || pedido.created_at,
                            valorTotal: valorTotal,
                            valorFaturado: valorFaturado,
                            valorAFaturar: valorRestante,
                            porcentagemFaturada: porcentagemFaturada.toFixed(2),
                            cliente: pedido.cliente || 'N/A',
                            fornecedor: pedido.fornecedor || 'N/A',
                            status: pedido.status || 'faturado',
                            faturamentos: faturamentosPedido
                        });
                    } catch (err) {
                        console.error(`Erro ao processar pedido ID ${pedido.id}:`, err);
                    }
                }
            }
            
            return pedidosDetalhados;
        } catch (error) {
            console.error('Erro ao consultar pedidos faturados:', error);
            return [];
        }
    }

    static async consultarFaturamentos(filtros = {}) {
        try {
            console.log('Consultando faturamentos com filtros:', filtros);
            
            // Construir query string com os filtros
            const queryParams = new URLSearchParams();
            
            // Backend espera um formato específico de filtros: campo e valor
            if (filtros.tipo && filtros.tipo !== 'todos') {
                queryParams.append('campo', 'id_type');
                queryParams.append('valor', filtros.tipo);
            } else if (filtros.numeroPedido) {
                queryParams.append('campo', 'id_number');
                queryParams.append('valor', filtros.numeroPedido);
            } else if (filtros.dataInicial && filtros.dataFinal) {
                // Para data, usamos uma abordagem diferente: buscar tudo e filtrar no cliente
                // já que o backend não suporta filtragem por data diretamente
                console.log("Filtragem por data será aplicada após buscar os resultados");
            }
            
            const url = `${API_URL}/api/faturamentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            console.log('URL para consulta de faturamentos:', url);
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na resposta ao consultar faturamentos:', errorText);
                throw new Error(`Erro ao consultar faturamentos: ${response.statusText || errorText}`);
            }
            
            let faturamentos = await response.json();
            console.log('Faturamentos recebidos do backend:', faturamentos);
            
            // Filtrar por data se necessário (já que o backend não suporta isso diretamente)
            if (filtros.dataInicial && filtros.dataFinal) {
                const dataInicial = new Date(filtros.dataInicial);
                const dataFinal = new Date(filtros.dataFinal);
                dataFinal.setHours(23, 59, 59); // Incluir todo o último dia
                
                faturamentos = faturamentos.filter(fat => {
                    const dataFaturamento = new Date(fat.created_at);
                    return dataFaturamento >= dataInicial && dataFaturamento <= dataFinal;
                });
                
                console.log(`Após filtro de data: ${faturamentos.length} faturamentos`);
            }
            
            // Para cada faturamento, buscar o valor total do pedido para calcular valor restante
            const faturamentosDetalhados = [];
            
            for (const fat of faturamentos) {
                try {
                    // Mapear as propriedades do objeto retornado pelo backend para o formato esperado pelo frontend
                    const valorTotalPedido = parseFloat(fat.valor_total_pedido || 0);
                    const valorAFaturar = parseFloat(fat.valor_a_faturar || 0);
                    
                    // Obter valor faturado em valor monetário a partir da porcentagem
                    const porcentagemFaturada = parseFloat(fat.valor_faturado || 0); // 0-100
                    const valorFaturadoCalculado = (porcentagemFaturada / 100) * valorTotalPedido;
                    
                    faturamentosDetalhados.push({
                        id: fat.id,
                        numeroPedido: fat.id_number,
                        tipoPedido: fat.id_type,
                        valorTotal: valorTotalPedido,
                        valorFaturado: valorAFaturar, // Usar valor monetário, não porcentagem
                        valorTotalFaturado: valorFaturadoCalculado,
                        valorAFaturar: Math.max(0, valorTotalPedido - valorFaturadoCalculado),
                        dataFaturamento: fat.created_at,
                        dataVencimento: fat.data_vencimento,
                        numeroNF: fat.nf,
                        arquivoNF: fat.nf_anexo,
                        metodoPagamento: fat.pagamento, // Agora é string no backend, não objeto
                        codigoBoleto: fat.numero_boleto, // Movido para o nível principal
                        arquivoBoleto: fat.boleto_anexo, // Movido para o nível principal
                        dadosConta: fat.dados_conta // Movido para o nível principal
                    });
                } catch (err) {
                    console.error(`Erro ao processar faturamento ID ${fat.id}:`, err);
                    // Adicionar versão básica se ocorrer um erro
                    faturamentosDetalhados.push({
                        id: fat.id,
                        numeroPedido: fat.id_number,
                        tipoPedido: fat.id_type,
                        valorTotal: parseFloat(fat.valor_total_pedido || 0),
                        valorFaturado: parseFloat(fat.valor_a_faturar || 0),
                        valorAFaturar: 0,
                        dataFaturamento: fat.created_at,
                        dataVencimento: fat.data_vencimento,
                        numeroNF: fat.nf,
                        arquivoNF: fat.nf_anexo,
                        metodoPagamento: fat.pagamento || 'N/A',
                        codigoBoleto: fat.numero_boleto,
                        arquivoBoleto: fat.boleto_anexo,
                        dadosConta: fat.dados_conta
                    });
                }
            }
            
            return faturamentosDetalhados;
        } catch (error) {
            console.error('Erro ao consultar faturamentos:', error);
            return [];
        }
    }
    
    // Método auxiliar para converter arquivo para base64
    static async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    static async buscarFornecedores(filtros = {}) {
        try {
            console.log("ApiService: Iniciando busca de fornecedores com filtros:", filtros);
            
            // Construir query params
            const queryParams = new URLSearchParams();
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            
            const url = `${API_URL}/api/fornecedores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            console.log("ApiService: URL para busca de fornecedores:", url);
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`ApiService: Erro na requisição de fornecedores (${response.status}):`, errorText);
                throw new Error(`Erro ao buscar fornecedores: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("ApiService: Resposta da API de fornecedores:", data);
            
            // Garantir que temos um array de fornecedores
            let fornecedores = [];
            
            if (Array.isArray(data)) {
                console.log("ApiService: Dados retornados como array");
                fornecedores = data;
            } else if (data && Array.isArray(data.fornecedores)) {
                console.log("ApiService: Dados retornados no formato { fornecedores: [...] }");
                fornecedores = data.fornecedores;
            } else if (data && typeof data === 'object') {
                console.log("ApiService: Formato de resposta não esperado, tentando extrair fornecedores");
                // Tentativa de extrair fornecedores de qualquer formato de resposta
                fornecedores = Object.values(data).filter(item => 
                    item && typeof item === 'object' && item.id !== undefined
                );
            }
            
            console.log(`ApiService: Total de ${fornecedores.length} fornecedores processados`);
            return { fornecedores };
        } catch (error) {
            console.error('ApiService: Erro ao buscar fornecedores:', error);
            return { fornecedores: [], error: error.message };
        }
    }

    static async buscarFornecedorPorId(id) {
        try {
            console.log(`ApiService: Buscando fornecedor com ID ${id}`);
            
            if (!id) {
                console.error("ApiService: ID do fornecedor não fornecido");
                throw new Error('ID do fornecedor é obrigatório');
            }
            
            const url = `${API_URL}/api/fornecedores/${id}`;
            console.log(`ApiService: URL para busca do fornecedor: ${url}`);
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`ApiService: Erro na resposta (${response.status}): ${errorText}`);
                throw new Error(`Erro ao buscar fornecedor: ${response.status} ${response.statusText}`);
            }
            
            const fornecedor = await response.json();
            console.log(`ApiService: Fornecedor ${id} encontrado:`, fornecedor);
            
            // Verificar se o fornecedor tem ID e se é o mesmo fornecedor solicitado
            if (!fornecedor || !fornecedor.id) {
                console.warn(`ApiService: Resposta não contém dados válidos do fornecedor ${id}`);
                throw new Error('Fornecedor não encontrado ou dados incompletos');
            }
            
            // Garantir que todas as propriedades importantes estejam presentes
            return {
                ...fornecedor,
                razao_social: fornecedor.razao_social || fornecedor.nome || 'Sem nome',
                endereco: fornecedor.endereco || '',
                cnpj: fornecedor.cnpj || '',
                telefone: fornecedor.telefone || fornecedor.celular || '',
                email: fornecedor.email || '',
                contato: fornecedor.contato || ''
            };
        } catch (error) {
            console.error(`ApiService: Erro ao buscar fornecedor ${id}:`, error);
            throw error;
        }
    }

    static async downloadPedidoLocacaoPdf(id) {
        try {
            const response = await fetch(`${API_URL}/api/pedidos-locacao/${id}/pdf/download`, {
                method: 'GET',
                headers: {
                    ...createAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao baixar PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pedido-locacao-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            throw error;
        }
    }

    static async criarPedidoServico(pedidoData) {
        try {
            console.log('Enviando pedido de serviço para API:', pedidoData);
            
            // Garantir que os dados estejam no formato exato especificado
            const dadosFormatados = {
                fornecedor_id: parseInt(pedidoData.fornecedor_id) || 1,
                data_vencimento: pedidoData.data_vencimento || new Date().toISOString().split('T')[0],
                proposta_id: parseInt(pedidoData.proposta_id) || null,
                clientinfo_id: parseInt(pedidoData.clientinfo_id) || null,
                itens: pedidoData.itens || {}
            };
            
            console.log('Dados formatados conforme especificação:', dadosFormatados);
            
            const response = await fetch(`${API_URL}/api/servicos`, {
                method: 'POST',
                headers: {
                    ...await createAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosFormatados)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar pedido de serviço');
            }

            const data = await response.json();
            console.log('Resposta da API ao criar pedido de serviço:', data);
            return data;
        } catch (error) {
            console.error('Erro ao criar pedido de serviço:', error);
            throw error;
        }
    }

    // ===== Métodos para Aluguéis =====
    
    /**
     * Registra um novo aluguel
     * @param {Object} dadosAluguel - Dados do aluguel a ser registrado
     * @returns {Promise<Object>} - Dados do aluguel criado
     */
    static async registrarAluguel(dadosAluguel) {
        try {
            console.log('Registrando novo aluguel:', dadosAluguel);
            
            // Validar dados obrigatórios
            if (!dadosAluguel.valor || !dadosAluguel.detalhes?.dia_vencimento || 
                !dadosAluguel.detalhes?.pagamento || !dadosAluguel.detalhes?.obra_id) {
                throw new Error('Dados incompletos para registro de aluguel');
            }
            
            // Verificar se o dia de vencimento é válido (1-31)
            const diaVencimento = parseInt(dadosAluguel.detalhes.dia_vencimento);
            if (isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
                throw new Error('Dia de vencimento deve ser um número entre 1 e 31');
            }
            
            const response = await fetch(`${API_URL}/api/alugueis`, {
                method: 'POST',
                headers: {
                    ...createAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAluguel)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao registrar aluguel');
            }

            const data = await response.json();
            console.log('Aluguel registrado com sucesso:', data);
            return data;
        } catch (error) {
            console.error('Erro ao registrar aluguel:', error);
            throw error;
        }
    }
    
    /**
     * Busca aluguéis com filtros opcionais
     * @param {Object} filtros - Filtros para busca (campo, valor, data_inicial, data_final, obraId)
     * @returns {Promise<Array>} - Lista de aluguéis
     */
    static async buscarAlugueis(filtros = {}) {
        try {
            console.log('Buscando aluguéis com filtros:', filtros);
            let url = `${API_URL}/api/alugueis`;
            const queryParams = [];
            
            // Se tiver filtros de campo e valor, adicionar como query params
            if (filtros.campo && filtros.valor) {
                queryParams.push(`campo=${filtros.campo}`);
                queryParams.push(`valor=${encodeURIComponent(filtros.valor)}`);
            }
            // Se tiver filtro de obra (centro de custo)
            else if (filtros.obraId) {
                queryParams.push(`campo=obra_id`);
                queryParams.push(`valor=${encodeURIComponent(filtros.obraId)}`);
            }
            
            // Adicionar filtros de data se fornecidos
            if (filtros.dataInicial) {
                queryParams.push(`data_inicial=${filtros.dataInicial}`);
            }
            if (filtros.dataFinal) {
                queryParams.push(`data_final=${filtros.dataFinal}`);
            }
            
            // Adicionar query params à URL
            if (queryParams.length > 0) {
                url += '?' + queryParams.join('&');
            }
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao buscar aluguéis');
            }

            const alugueis = await response.json();
            console.log(`Total de ${alugueis.length} aluguéis encontrados`);
            return alugueis;
        } catch (error) {
            console.error('Erro ao buscar aluguéis:', error);
            throw error;
        }
    }
    
    /**
     * Busca um aluguel por ID
     * @param {number} id - ID do aluguel
     * @returns {Promise<Object>} - Dados do aluguel
     */
    static async buscarAluguelPorId(id) {
        try {
            console.log(`Buscando aluguel com ID ${id}`);
            
            const response = await fetch(`${API_URL}/api/alugueis/${id}`, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ao buscar aluguel com ID ${id}`);
            }

            const aluguel = await response.json();
            console.log('Aluguel encontrado:', aluguel);
            return aluguel;
        } catch (error) {
            console.error(`Erro ao buscar aluguel com ID ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Atualiza um aluguel existente
     * @param {number} id - ID do aluguel
     * @param {Object} dadosAluguel - Novos dados do aluguel
     * @returns {Promise<Object>} - Dados do aluguel atualizado
     */
    static async atualizarAluguel(id, dadosAluguel) {
        try {
            console.log(`Atualizando aluguel com ID ${id}:`, dadosAluguel);
            
            // Validar dados obrigatórios
            if (!dadosAluguel.valor || !dadosAluguel.detalhes?.dia_vencimento || 
                !dadosAluguel.detalhes?.pagamento || !dadosAluguel.detalhes?.obra_id) {
                throw new Error('Dados incompletos para atualização de aluguel');
            }
            
            // Verificar se o dia de vencimento é válido (1-31)
            const diaVencimento = parseInt(dadosAluguel.detalhes.dia_vencimento);
            if (isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
                throw new Error('Dia de vencimento deve ser um número entre 1 e 31');
            }
            
            const response = await fetch(`${API_URL}/api/alugueis/${id}`, {
                method: 'PUT',
                headers: {
                    ...createAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAluguel)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ao atualizar aluguel com ID ${id}`);
            }

            const data = await response.json();
            console.log('Aluguel atualizado com sucesso:', data);
            return data;
        } catch (error) {
            console.error(`Erro ao atualizar aluguel com ID ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Finaliza um aluguel (marca como finalizado)
     * @param {number} id - ID do aluguel
     * @returns {Promise<Object>} - Dados do aluguel finalizado
     */
    static async finalizarAluguel(id) {
        try {
            console.log(`Finalizando aluguel com ID ${id}`);
            
            // Buscar dados atuais do aluguel
            const aluguelAtual = await this.buscarAluguelPorId(id);
            
            // Marcar como finalizado (adicionar campo finalizado)
            const dadosAtualizados = {
                ...aluguelAtual,
                finalizado: true
            };
            
            // Atualizar o aluguel
            const response = await fetch(`${API_URL}/api/alugueis/${id}`, {
                method: 'PUT',
                headers: {
                    ...createAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAtualizados)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ao finalizar aluguel com ID ${id}`);
            }

            const data = await response.json();
            console.log('Aluguel finalizado com sucesso:', data);
            return data;
        } catch (error) {
            console.error(`Erro ao finalizar aluguel com ID ${id}:`, error);
            throw error;
        }
    }
}

export default ApiService; 