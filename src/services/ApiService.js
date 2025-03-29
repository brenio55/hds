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

    static async criarPedido(dadosPedido, itens) {
        try {
            // Transformar os dados para o novo formato
            const pedidoFormatado = {
                clientinfo_id: parseInt(dadosPedido.codigo) || 1,
                fornecedores_id: parseInt(dadosPedido.fornecedor_id) || 1,
                ddl: parseInt(dadosPedido.condPagto) || 30,
                data_vencimento: dadosPedido.dataVencto,
                proposta_id: parseInt(dadosPedido.proposta_id) || 1,
                materiais: itens.map((item, index) => ({
                    item: index + 1,
                    descricao: item.descricao,
                    uni: item.unidade,
                    quantidade: parseFloat(item.quantidade.replace(',', '.')) || 0,
                    ipi: parseFloat(item.ipi.replace(',', '.')) || 0,
                    valor_unit: parseFloat(item.valorUnitario.replace(',', '.')) || 0,
                    valor_total: parseFloat(item.valorTotal.replace(',', '.')) || 0,
                    porcentagem: parseFloat(item.desconto.replace(',', '.')) || 0,
                    data_entrega: item.previsaoEntrega || new Date().toISOString().split('T')[0]
                })),
                desconto: parseFloat(dadosPedido.totalDescontos?.replace(',', '.')) || 0,
                valor_frete: parseFloat(dadosPedido.valorFrete?.replace(',', '.')) || 0,
                despesas_adicionais: parseFloat(dadosPedido.outrasDespesas?.replace(',', '.')) || 0,
                dados_adicionais: dadosPedido.informacoesImportantes || '',
                frete: {
                    tipo: dadosPedido.frete || 'CIF',
                    valor: parseFloat(dadosPedido.valorFrete?.replace(',', '.')) || 0
                }
            };
    
            // Enviar para a API
            const response = await fetch(`${API_URL}/api/pedidos-compra`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(pedidoFormatado)
            });
    
            if (!response.ok) {
                throw new Error('Erro ao criar pedido');
            }
    
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao salvar pedido completo:', error);
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

            const data = await response.json();
            console.log('Resposta da API propostas:', data);
            
            // Garantir que a resposta seja um array
            if (Array.isArray(data)) {
                return data;
            } else if (data && data.propostas && Array.isArray(data.propostas)) {
                return data.propostas;
            } else if (data && typeof data === 'object') {
                // Se for um objeto, retorna seus valores como array
                return Object.values(data);
            } else {
                console.warn('Formato de resposta inesperado para propostas:', data);
                return [];
            }
        } catch (error) {
            console.error('Erro ao buscar propostas:', error);
            // Retorna array vazio em caso de erro para não quebrar a UI
            return [];
        }
    }

    static async downloadPdf(id, version) {
        try {
            const response = await fetch(
                `${API_URL}/api/propostas/${id}/pdf/download`,
                {
                    headers: createAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao baixar PDF');
            }

            // Obtém o nome do arquivo do header Content-Disposition
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'proposta.pdf';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Converte a resposta para blob e cria URL para download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return true;
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            throw error;
        }
    }

    // Método para visualizar o PDF em uma nova guia
    static async visualizarPdf(id, version) {
        try {
            const response = await fetch(
                `${API_URL}/api/propostas/${id}/pdf/download`,
                {
                    headers: createAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Erro ao visualizar PDF:', error);
            throw error;
        }
    }

    // Método para visualizar o PDF de pedido de compra em uma nova guia
    static async visualizarPedidoPdf(id) {
        try {
            const response = await fetch(
                `${API_URL}/api/pedidos-compra/${id}/pdf/download`,
                {
                    headers: createAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar PDF do pedido');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Erro ao visualizar PDF do pedido:', error);
            throw error;
        }
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
     * @param {Object} dadosPedido - Dados do pedido de locação
     * @returns {Promise<Object>} - Dados do pedido criado
     */
    static async criarPedidoLocacao(dadosPedido) {
        try {
            const response = await fetch(`${API_URL}/api/pedidos-locacao`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosPedido)
            });

            if (!response.ok) {
                throw new Error('Erro ao criar pedido de locação');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar pedido de locação:', error);
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
                throw new Error('Erro ao listar pedidos de locação');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao listar pedidos de locação:', error);
            throw error;
        }
    }

    /**
     * Busca um pedido de locação por ID
     * @param {number} id - ID do pedido a ser buscado
     * @returns {Promise<Object>} - Dados do pedido 
     */
    static async buscarPedidoLocacaoPorId(id) {
        try {
            const response = await fetch(`${API_URL}/api/pedidos-locacao/${id}`, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar pedido de locação');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar pedido de locação:', error);
            throw error;
        }
    }

    /**
     * Faz o download do PDF de um pedido de locação
     * @param {number} id - ID do pedido 
     * @returns {Promise<Blob>} - Blob contendo o PDF
     */
    static async downloadPedidoLocacaoPdf(id) {
        try {
            const response = await fetch(
                `${API_URL}/api/pedidos-locacao/${id}/pdf/download`,
                {
                    headers: createAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao baixar PDF do pedido de locação');
            }

            // Obtém o nome do arquivo do header Content-Disposition
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'pedido-locacao.pdf';
            
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
            console.error('Erro ao baixar PDF do pedido de locação:', error);
            throw error;
        }
    }

    /**
     * Visualiza o PDF de um pedido de locação em nova aba
     * @param {number} id - ID do pedido 
     * @returns {Promise<void>}
     */
    static async visualizarPedidoLocacaoPdf(id) {
        try {
            const response = await fetch(
                `${API_URL}/api/pedidos-locacao/${id}/pdf/download`,
                {
                    headers: createAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar PDF do pedido de locação');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            return true;
        } catch (error) {
            console.error('Erro ao visualizar PDF do pedido de locação:', error);
            throw error;
        }
    }


    static async buscarPedidoCompraPorId(id) {
        try {
            try {
                const response = await fetch(`${API_URL}/api/pedidos-compra/${id}`, {
                    headers: createAuthHeaders()
                });
    
                if (!response.ok) {
                    throw new Error('Erro ao buscar pedido de compra');
                }
    
                const data = await response.json();
                return data;
            } catch (apiError) {
                console.warn('Erro ao buscar da API, usando dados de exemplo:', apiError);
                // Se a API falhar, carrega dados de exemplo
                const dadosExemplo = await this.carregarDadosExemplo();
                const pedido = dadosExemplo.find(p => p.id.toString() === id.toString());
                
                if (!pedido) {
                    throw new Error('Pedido não encontrado');
                }
                
                return pedido;
            }
        } catch (error) {
            console.error('Erro ao buscar pedido de compra:', error);
            throw error;
        }
    }

    // Método para carregar dados de exemplo quando a API não estiver disponível
    static async carregarDadosExemplo() {
        return [
            {
                "id": 2,
                "clientinfo_id": 1,
                "fornecedores_id": 1,
                "ddl": 30,
                "data_vencimento": "2025-03-04T00:00:00.000Z",
                "proposta_id": 1,
                "materiais": [
                    {
                        "ipi": 10,
                        "uni": "UN",
                        "item": 1,
                        "descricao": "Material de Teste",
                        "quantidade": 10,
                        "valor_unit": 100,
                        "porcentagem": 5,
                        "valor_total": 1000,
                        "data_entrega": "2025-03-04"
                    },
                    {
                        "ipi": 10,
                        "uni": "UN",
                        "item": 2,
                        "descricao": "Material de Teste",
                        "quantidade": 10,
                        "valor_unit": 100,
                        "porcentagem": 5,
                        "valor_total": 1000,
                        "data_entrega": "2025-03-04"
                    }
                ],
                "desconto": "100.00",
                "valor_frete": "1231.00",
                "despesas_adicionais": "0.00",
                "dados_adicionais": "testestestetes",
                "frete": {
                    "tipo": "CIF",
                    "valor": 1231
                },
                "created_at": "2025-03-04T20:18:29.148Z",
                "fornecedor_nome": null
            },
            {
                "id": 1,
                "clientinfo_id": 1,
                "fornecedores_id": 30,
                "ddl": 30,
                "data_vencimento": "2025-07-22T00:00:00.000Z",
                "proposta_id": 8,
                "materiais": [
                    {
                        "ipi": 5,
                        "uni": "pç",
                        "item": 1,
                        "descricao": "Material A",
                        "quantidade": 10,
                        "valor_unit": 100,
                        "porcentagem": 10,
                        "valor_total": 1000,
                        "data_entrega": "2024-04-01"
                    }
                ],
                "desconto": "22.00",
                "valor_frete": "2.00",
                "despesas_adicionais": null,
                "dados_adicionais": "pdf gerado automaticamente, aqui estariam com observações gerai",
                "frete": 400,
                "created_at": "2025-02-06T21:20:15.445Z",
                "fornecedor_nome": "CONSTRUCAP CCPS ENGENHARIA E COMERCIO SA"
            }
        ];
    }

    // Métodos relacionados a Fornecedores
    static async buscarFornecedores(filtros = {}) {
        try {
            // Construir a URL com os parâmetros de consulta
            const queryParams = new URLSearchParams();
            Object.entries(filtros)
                .filter(([_, value]) => value && value.trim() !== '')
                .forEach(([key, value]) => {
                    queryParams.append(key, value);
                });

            const url = `${API_URL}/api/fornecedores${queryParams.toString() ? `?${queryParams}` : ''}`;
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar fornecedores');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
            throw error;
        }
    }

    static async buscarFornecedorPorId(id) {
        try {
            const response = await fetch(`${API_URL}/api/fornecedores/${id}`, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar fornecedor');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar fornecedor:', error);
            throw error;
        }
    }

    static async criarFornecedor(dadosFornecedor) {
        try {
            const response = await fetch(`${API_URL}/api/fornecedores`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosFornecedor)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar fornecedor');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar fornecedor:', error);
            throw error;
        }
    }

    static async atualizarFornecedor(id, dadosFornecedor) {
        try {
            const response = await fetch(`${API_URL}/api/fornecedores/${id}`, {
                method: 'PUT',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosFornecedor)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao atualizar fornecedor');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar fornecedor:', error);
            throw error;
        }
    }

    static async consultarPedidos() {
        return await this.get('/pedidos');
    }

    static async faturarPedidoCompra(formData) {
        return await this.post('/pedidos/faturar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async consultarFaturamentos(filtros = {}) {
        const { tipo = 'todos', numeroPedido, dataInicial, dataFinal } = filtros;
        const params = new URLSearchParams();
        
        if (tipo !== 'todos') params.append('tipo', tipo);
        if (numeroPedido) params.append('numeroPedido', numeroPedido);
        if (dataInicial) params.append('dataInicial', dataInicial);
        if (dataFinal) params.append('dataFinal', dataFinal);

        return await this.get(`/pedidos/faturamentos?${params.toString()}`);
    }

    // Métodos relacionados a Aluguel de Casas
    static async registrarAluguel(formData) {
        return await this.post('/api/alugueis', formData);
    }

    /**
     * Atualiza os dados de um aluguel existente
     * @param {Number} id - ID do aluguel a ser atualizado
     * @param {Object} formData - Dados do aluguel a serem atualizados
     * @returns {Promise<Object>} - Aluguel atualizado
     */
    static async atualizarAluguel(id, formData) {
        return await this.put(`/api/alugueis/${id}`, formData);
    }

    /**
     * Busca aluguéis com filtros opcionais
     * @param {Object} filtros - Filtros opcionais (campo, valor)
     * @returns {Promise<Array>} - Lista de aluguéis
     */
    static async buscarAlugueis(filtros = {}) {
        try {
            let endpoint = '/api/alugueis';
            const params = new URLSearchParams();
            
            // Adicionar filtros se existirem
            if (filtros.campo && filtros.valor) {
                params.append('campo', filtros.campo);
                params.append('valor', filtros.valor);
            } else if (filtros.dataInicial && filtros.dataFinal) {
                // Suporte para filtro por período de data
                params.append('campo', 'detalhes');
                params.append('valor', JSON.stringify({
                    data_inicio: filtros.dataInicial,
                    data_fim: filtros.dataFinal
                }));
            } else if (filtros.obraId) {
                // Suporte para filtro por obra
                params.append('campo', 'detalhes');
                params.append('valor', `"obra_id":${filtros.obraId}`);
            }
            
            const queryString = params.toString();
            if (queryString) {
                endpoint += `?${queryString}`;
            }
            
            return await this.get(endpoint);
        } catch (error) {
            console.error('Erro ao buscar aluguéis:', error);
            throw error;
        }
    }

    /**
     * Busca um aluguel pelo ID
     * @param {Number} id - ID do aluguel a ser buscado
     * @returns {Promise<Object>} - Aluguel encontrado
     */
    static async buscarAluguelPorId(id) {
        return await this.get(`/api/alugueis/${id}`);
    }

    static async buscarCentrosCusto() {
        return await this.get('/centros-custo');
    }

    // Método para finalizar aluguel
    static async finalizarAluguel(id) {
        return await this.put(`/api/alugueis/${id}/finalizar`);
    }

    // Método auxiliar para requisições GET
    static async get(endpoint, options = {}) {
        try {
            const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: createAuthHeaders(),
                ...options
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição GET para ${url}: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro na requisição GET para ${endpoint}:`, error);
            throw error;
        }
    }

    // Método auxiliar para requisições POST
    static async post(endpoint, data = {}, options = {}) {
        try {
            const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
            const isFormData = data instanceof FormData;
            
            const headers = isFormData 
                ? { ...createAuthHeaders(), ...options.headers } 
                : { ...createAuthHeaders(), 'Content-Type': 'application/json', ...options.headers };
            
            // Removemos Content-Type para FormData pois o navegador define automaticamente com boundary
            if (isFormData && headers['Content-Type']) {
                delete headers['Content-Type'];
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: isFormData ? data : JSON.stringify(data),
                ...options
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição POST para ${url}: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro na requisição POST para ${endpoint}:`, error);
            throw error;
        }
    }

    // Método auxiliar para requisições PUT
    static async put(endpoint, data = {}, options = {}) {
        try {
            const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
            const isFormData = data instanceof FormData;
            
            const headers = isFormData 
                ? { ...createAuthHeaders(), ...options.headers } 
                : { ...createAuthHeaders(), 'Content-Type': 'application/json', ...options.headers };
            
            // Removemos Content-Type para FormData pois o navegador define automaticamente com boundary
            if (isFormData && headers['Content-Type']) {
                delete headers['Content-Type'];
            }
            
            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body: Object.keys(data).length > 0 ? (isFormData ? data : JSON.stringify(data)) : undefined,
                ...options
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição PUT para ${url}: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro na requisição PUT para ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Métodos relacionados a Pedidos de Serviço
     */
    
    /**
     * Cria um novo pedido de serviço
     * @param {Object} dadosPedido - Dados do pedido de serviço
     * @returns {Promise<Object>} - Dados do pedido criado
     */
    static async criarPedidoServico(dadosPedido) {
        try {
            const response = await fetch(`${API_URL}/api/servicos`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosPedido)
            });

            if (!response.ok) {
                throw new Error('Erro ao criar pedido de serviço');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar pedido de serviço:', error);
            throw error;
        }
    }

    /**
     * Atualiza um pedido de serviço existente
     * @param {number} id - ID do pedido a ser atualizado
     * @param {Object} dadosPedido - Novos dados do pedido
     * @returns {Promise<Object>} - Dados do pedido atualizado
     */
    static async atualizarPedidoServico(id, dadosPedido) {
        try {
            const response = await fetch(`${API_URL}/api/servicos/${id}`, {
                method: 'PUT',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosPedido)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar pedido de serviço');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar pedido de serviço:', error);
            throw error;
        }
    }

    /**
     * Lista todos os pedidos de serviço com filtros opcionais
     * @param {Object} filtros - Filtros a serem aplicados na busca
     * @returns {Promise<Array>} - Lista de pedidos de serviço
     */
    static async listarPedidosServico(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/servicos${queryParams ? `?${queryParams}` : ''}`;
            
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
     * Visualiza o PDF de um pedido de serviço em nova aba
     * @param {number} id - ID do pedido 
     * @returns {Promise<void>}
     */
    static async visualizarPedidoServicoPdf(id) {
        try {
            const response = await fetch(
                `${API_URL}/api/servicos/${id}/pdf/download`,
                {
                    headers: createAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar PDF do pedido de serviço');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            return true;
        } catch (error) {
            console.error('Erro ao visualizar PDF do pedido de serviço:', error);
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
            
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/pedidos-consolidados${queryParams ? `?${queryParams}` : ''}`;
            
            console.log(`ApiService: URL da requisição: ${url}`);

            const response = await fetch(url, {
                headers: createAuthHeaders(),
                method: 'GET',
                timeout: 30000 // timeout maior para esta operação pesada (30 segundos)
            });

            if (!response.ok) {
                console.error(`ApiService: Erro na resposta (status ${response.status}): ${response.statusText}`);
                throw new Error(`Erro ao buscar pedidos consolidados: ${response.statusText}`);
            }

            console.log(`ApiService: Resposta recebida (status ${response.status})`);
            
            try {
                // Converter para texto primeiro para debug
                const responseText = await response.text();
                console.log(`ApiService: Tamanho da resposta: ${responseText.length} caracteres`);
                
                if (!responseText || responseText.trim() === '') {
                    console.error('ApiService: Resposta vazia recebida');
                    return { total: 0, pedidos: [] };
                }
                
                try {
                    // Tentar converter o texto para JSON
                    const data = JSON.parse(responseText);
                    console.log(`ApiService: JSON parseado com sucesso. Total: ${data.total || 0}`);
                    return data;
                } catch (jsonError) {
                    console.error('ApiService: Erro ao fazer parse do JSON:', jsonError);
                    console.error('ApiService: Primeiros 200 caracteres da resposta:', responseText.substring(0, 200));
                    throw new Error('Erro ao processar resposta do servidor');
                }
            } catch (textError) {
                console.error('ApiService: Erro ao ler resposta como texto:', textError);
                throw new Error('Erro ao ler resposta do servidor');
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
            const url = `${API_URL}/api/faturamentos${queryParams ? `?${queryParams}` : ''}`;
            
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
        try {
            console.log('Enviando dados de reembolso para o backend:', dadosReembolso);
            
            // Verificar se estamos enviando FormData
            const isFormData = dadosReembolso instanceof FormData;
            
            let headers = createAuthHeaders();
            let body;
            
            if (isFormData) {
                // Se for FormData, remove Content-Type para que o navegador defina automaticamente com boundary
                delete headers['Content-Type'];
                body = dadosReembolso;
                
                // Log para debug dos dados no FormData
                console.log('Enviando FormData com as seguintes chaves:');
                for (let pair of dadosReembolso.entries()) {
                    console.log(pair[0] + ': ' + (pair[1] instanceof File ? 'File: ' + pair[1].name : pair[1]));
                }
            } else {
                // Se for objeto normal, mantém Content-Type JSON e serializa
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify(dadosReembolso);
            }
            
            const response = await fetch(`${API_URL}/api/reembolso`, {
                method: 'POST',
                headers: headers,
                body: body
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na resposta do servidor:', errorText);
                throw new Error(`Erro ao criar reembolso: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar reembolso:', error);
            throw error;
        }
    }

    static async buscarReembolsos(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/reembolso${queryParams ? `?${queryParams}` : ''}`;
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar reembolsos: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar reembolsos:', error);
            throw error;
        }
    }

    static async atualizarReembolso(id, dadosReembolso) {
        try {
            console.log(`Atualizando reembolso ${id}:`, dadosReembolso);
            const isFormData = dadosReembolso instanceof FormData;
            const response = await this.put(`/reembolso/${id}`, dadosReembolso, { isFormData });
            return response;
        } catch (error) {
            console.error(`Erro ao atualizar reembolso ${id}:`, error);
            throw error;
        }
    }
}

export default ApiService; 