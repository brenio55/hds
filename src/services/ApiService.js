import supabase from '../utils/Supabase';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL;

// Função para gerenciar o token
const getStoredToken = () => localStorage.getItem('authToken');
const setStoredToken = (token) => localStorage.setItem('authToken', token);
const removeStoredToken = () => localStorage.removeItem('authToken');

// Função para criar headers com autenticação
const createAuthHeaders = () => {
    const token = getStoredToken();
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
}

export default ApiService; 