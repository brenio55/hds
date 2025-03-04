import supabase from '../utils/Supabase';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL;

// Função para gerenciar o token
const getStoredToken = () => localStorage.getItem('authToken');
const setStoredToken = (token) => localStorage.setItem('authToken', token);
const removeStoredToken = () => localStorage.removeItem('authToken');

// Funções relacionadas a Pedidos
export const pedidosService = {
    async gerarNumeroPedido() {
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
    },

    async criarPedido(dadosPedido) {
        try {
            const response = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(dadosPedido)
            });

            if (!response.ok) {
                throw new Error('Erro ao criar pedido');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw error;
        }
    },

    async inserirItensPedido(pedidoId, itens) {
        try {
            const response = await fetch(`${API_URL}/pedidos/${pedidoId}/itens`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify({ itens })
            });

            if (!response.ok) {
                throw new Error('Erro ao inserir itens do pedido');
            }

            return true;
        } catch (error) {
            console.error('Erro ao inserir itens do pedido:', error);
            throw error;
        }
    }
};

// Funções relacionadas a Clientes
export const clientesService = {
    async atualizarOuCriarCliente(dadosCliente) {
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
};

// Função para criar headers com autenticação
const createAuthHeaders = () => {
    const token = getStoredToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Função para salvar pedido completo
export const salvarPedidoCompleto = async (dadosPedido, itens) => {
    try {
        // 1. Atualizar ou criar cliente
        await clientesService.atualizarOuCriarCliente({
            codigo: dadosPedido.codigo,
            fornecedor: dadosPedido.fornecedor,
            cnpj: dadosPedido.cnpj,
            endereco: dadosPedido.endereco,
            contato: dadosPedido.contato
        });

        // 2. Criar pedido
        const { numeroPedido } = await pedidosService.criarPedido(dadosPedido);

        // 3. Inserir itens do pedido
        await pedidosService.inserirItensPedido(numeroPedido, itens);

        return { success: true, numeroPedido };
    } catch (error) {
        console.error('Erro ao salvar pedido completo:', error);
        throw error;
    }
};

// Funções relacionadas a Usuários
export const userService = {
    async registerUser(userData, authorizationCode) {
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
    },

    async login(username, password) {
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
                
                if (data.token) {
                    setStoredToken(data.token);
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
    },

    logout() {
        removeStoredToken();
    },

    async getProfile() {
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
};

const getServiceOrderTemplate = async (serviceOrder) => {
    try {
        const response = await api.post('/service-orders/template', serviceOrder);
        return response.data;
    } catch (error) {
        console.error('Erro ao obter template do pedido de serviço:', error);
        throw error;
    }
};

// Funções relacionadas a Propostas
export const propostasService = {
    async criarProposta(dadosProposta) {
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
    },

    async buscarPropostas(filtros = {}) {
        try {
            const queryParams = new URLSearchParams(filtros).toString();
            const url = `${API_URL}/api/propostas/search${queryParams ? `?${queryParams}` : ''}`;
            
            const response = await fetch(url, {
                headers: createAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar propostas');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar propostas:', error);
            throw error;
        }
    },

    async downloadPdf(id, version) {
        try {
            const response = await fetch(
                `${API_URL}/api/propostas/${id}/pdf/download${version ? `?version=${version}` : ''}`,
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
}; 