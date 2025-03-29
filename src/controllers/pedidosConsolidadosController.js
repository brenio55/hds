exports.findAll = async (req, res) => {
    console.log("========== INÍCIO - PEDIDOS CONSOLIDADOS CONTROLLER ==========");
    console.time("pedidos-consolidados-controller");
    
    // Inicialize arrays vazios para cada tipo de pedido
    let pedidosCompra = [];
    let pedidosLocacao = [];
    let pedidosServico = [];
    
    // Obter pedidos de compra com tratamento de erro
    try {
        console.time("buscar-pedidos-compra");
        pedidosCompra = await PedidoCompraModel.findAll();
        console.timeEnd("buscar-pedidos-compra");
        console.log(`Encontrados ${pedidosCompra.length} pedidos de compra`);
        if (pedidosCompra.length > 0) {
            console.log("Exemplo pedido compra:", JSON.stringify(pedidosCompra[0]).substring(0, 100) + "...");
        }
    } catch (error) {
        console.error("Erro ao buscar pedidos de compra:", error);
        pedidosCompra = [];
    }
    
    // Obter pedidos de locação com tratamento de erro
    try {
        console.time("buscar-pedidos-locacao");
        pedidosLocacao = await PedidoLocacaoModel.findAll();
        console.timeEnd("buscar-pedidos-locacao");
        console.log(`Encontrados ${pedidosLocacao.length} pedidos de locação`);
        if (pedidosLocacao.length > 0) {
            console.log("Exemplo pedido locação:", JSON.stringify(pedidosLocacao[0]).substring(0, 100) + "...");
        }
    } catch (error) {
        console.error("Erro ao buscar pedidos de locação:", error);
        pedidosLocacao = [];
    }
    
    // Obter serviços com tratamento de erro
    try {
        console.time("buscar-servicos");
        pedidosServico = await ServicoModel.findAll();
        console.timeEnd("buscar-servicos");
        console.log(`Encontrados ${pedidosServico.length} serviços`);
        if (pedidosServico.length > 0) {
            console.log("Exemplo serviço:", JSON.stringify(pedidosServico[0]).substring(0, 100) + "...");
        }
    } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        pedidosServico = [];
    }

    // Coletar IDs únicos para buscas relacionadas
    const idsPropostas = new Set();
    const idsFornecedores = new Set();
    const idsClientes = new Set();
    
    try {
        // Pedidos de compra
        pedidosCompra.forEach(pedido => {
            if (pedido.id_proposta) idsPropostas.add(pedido.id_proposta);
            if (pedido.id_fornecedor) idsFornecedores.add(pedido.id_fornecedor);
        });
        
        // Pedidos de locação
        pedidosLocacao.forEach(pedido => {
            if (pedido.id_proposta) idsPropostas.add(pedido.id_proposta);
            if (pedido.id_fornecedor) idsFornecedores.add(pedido.id_fornecedor);
        });
        
        // Serviços
        pedidosServico.forEach(servico => {
            if (servico.id_proposta) idsPropostas.add(servico.id_proposta);
            if (servico.id_fornecedor) idsFornecedores.add(servico.id_fornecedor);
        });
    } catch (error) {
        console.error("Erro ao coletar IDs para buscas relacionadas:", error);
    }
    
    // Buscar propostas relacionadas
    let propostas = [];
    try {
        if (idsPropostas.size > 0) {
            console.time("buscar-propostas");
            propostas = await PropostaModel.findAllByIds(Array.from(idsPropostas));
            console.timeEnd("buscar-propostas");
            console.log(`Encontradas ${propostas.length} propostas relacionadas`);
            
            // Coletar IDs de clientes das propostas
            propostas.forEach(proposta => {
                if (proposta.id_cliente) idsClientes.add(proposta.id_cliente);
            });
        }
    } catch (error) {
        console.error("Erro ao buscar propostas:", error);
        propostas = [];
    }
    
    // Buscar fornecedores relacionados
    let fornecedores = [];
    try {
        if (idsFornecedores.size > 0) {
            console.time("buscar-fornecedores");
            fornecedores = await FornecedorModel.findAllByIds(Array.from(idsFornecedores));
            console.timeEnd("buscar-fornecedores");
            console.log(`Encontrados ${fornecedores.length} fornecedores relacionados`);
        }
    } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
        fornecedores = [];
    }
    
    // Buscar clientes relacionados
    let clientes = [];
    try {
        if (idsClientes.size > 0) {
            console.time("buscar-clientes");
            clientes = await ClienteModel.findAllByIds(Array.from(idsClientes));
            console.timeEnd("buscar-clientes");
            console.log(`Encontrados ${clientes.length} clientes relacionados`);
        }
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        clientes = [];
    }
    
    // Criar um mapa para acesso rápido às entidades relacionadas
    const mapPropostas = propostas.reduce((map, proposta) => {
        map[proposta.id] = proposta;
        return map;
    }, {});
    
    const mapFornecedores = fornecedores.reduce((map, fornecedor) => {
        map[fornecedor.id] = fornecedor;
        return map;
    }, {});
    
    const mapClientes = clientes.reduce((map, cliente) => {
        map[cliente.id] = cliente;
        return map;
    }, {});
    
    // Formatar pedidos para resposta
    let pedidosFormatados = [];
    
    try {
        // Sanitização e preparação dos dados para evitar problemas de serialização
        console.log("Preparando dados para resposta...");
        let pedidosSanitizados = [];
        
        // Sanitizar/preparar cada pedido para serialização segura
        const sanitizarPedido = (pedido, tipo) => {
            try {
                // Criar objeto simples sem getter/setters ou propriedades não-enumeráveis
                let pedidoSimples = {
                    id: pedido.id,
                    tipo: tipo,
                    data_criacao: pedido.data_criacao || pedido.created_at || null,
                    status: pedido.status || null,
                    valor_total: pedido.valor_total || 0,
                    forma_pagamento: pedido.forma_pagamento || null,
                    prazo_entrega: pedido.prazo_entrega || null,
                    observacoes: pedido.observacoes || null
                };
                
                // Adicionar informações do fornecedor de forma segura
                if (pedido.id_fornecedor && mapFornecedores[pedido.id_fornecedor]) {
                    let fornecedor = mapFornecedores[pedido.id_fornecedor];
                    pedidoSimples.fornecedor = {
                        id: fornecedor.id,
                        nome: fornecedor.nome || null,
                        email: fornecedor.email || null,
                        telefone: fornecedor.telefone || null
                    };
                } else {
                    pedidoSimples.fornecedor = null;
                }
                
                // Adicionar informações da proposta e cliente de forma segura
                if (pedido.id_proposta && mapPropostas[pedido.id_proposta]) {
                    let proposta = mapPropostas[pedido.id_proposta];
                    pedidoSimples.proposta = {
                        id: proposta.id,
                        numero: proposta.numero || null,
                        data: proposta.data || null
                    };
                    
                    if (proposta.id_cliente && mapClientes[proposta.id_cliente]) {
                        let cliente = mapClientes[proposta.id_cliente];
                        pedidoSimples.cliente = {
                            id: cliente.id,
                            nome: cliente.nome || null,
                            email: cliente.email || null,
                            telefone: cliente.telefone || null
                        };
                    } else {
                        pedidoSimples.cliente = null;
                    }
                } else {
                    pedidoSimples.proposta = null;
                    pedidoSimples.cliente = null;
                }
                
                // Tratar itens de forma específica para cada tipo de pedido
                if (tipo === 'compra' || tipo === 'locacao') {
                    // Sanitizar itens do pedido se existirem
                    if (pedido.itens && Array.isArray(pedido.itens)) {
                        pedidoSimples.itens = pedido.itens.map(item => ({
                            id: item.id || null,
                            descricao: item.descricao || null,
                            quantidade: item.quantidade || 0,
                            valor_unitario: item.valor_unitario || 0,
                            valor_total: item.valor_total || 0
                        }));
                    } else {
                        pedidoSimples.itens = [];
                    }
                } else if (tipo === 'servico') {
                    // Para serviços, tratar os itens de forma diferente se necessário
                    if (pedido.itens && typeof pedido.itens === 'string') {
                        try {
                            pedidoSimples.itens = JSON.parse(pedido.itens);
                        } catch (e) {
                            console.error(`Erro ao parsear itens do serviço ${pedido.id}:`, e);
                            pedidoSimples.itens = [];
                        }
                    } else if (pedido.itens && Array.isArray(pedido.itens)) {
                        pedidoSimples.itens = pedido.itens;
                    } else {
                        pedidoSimples.itens = [];
                    }
                }
                
                return pedidoSimples;
            } catch (error) {
                console.error(`Erro ao sanitizar pedido ${tipo} id ${pedido.id}:`, error);
                // Retornar objeto mínimo em caso de erro
                return { 
                    id: pedido.id || null,
                    tipo: tipo, 
                    erro: true,
                    mensagem: "Erro ao processar este pedido"
                };
            }
        };
        
        // Processar pedidos de compra
        for (const pedido of pedidosCompra) {
            try {
                pedidosSanitizados.push(sanitizarPedido(pedido, 'compra'));
            } catch (error) {
                console.error(`Erro ao sanitizar pedido de compra ${pedido.id}:`, error);
            }
        }
        
        // Processar pedidos de locação
        for (const pedido of pedidosLocacao) {
            try {
                pedidosSanitizados.push(sanitizarPedido(pedido, 'locacao'));
            } catch (error) {
                console.error(`Erro ao sanitizar pedido de locação ${pedido.id}:`, error);
            }
        }
        
        // Processar serviços
        for (const servico of pedidosServico) {
            try {
                pedidosSanitizados.push(sanitizarPedido(servico, 'servico'));
            } catch (error) {
                console.error(`Erro ao sanitizar serviço ${servico.id}:`, error);
            }
        }
        
        // Ordenar por data de criação (mais recentes primeiro)
        pedidosFormatados = pedidosSanitizados.sort((a, b) => {
            if (!a.data_criacao) return 1;
            if (!b.data_criacao) return -1;
            return new Date(b.data_criacao) - new Date(a.data_criacao);
        });
        
        console.log(`Total de pedidos formatados: ${pedidosFormatados.length}`);
    } catch (error) {
        console.error("Erro ao formatar pedidos para resposta:", error);
        pedidosFormatados = []; // Em caso de erro, retornar lista vazia
    }
    
    console.timeEnd("pedidos-consolidados-controller");
    
    // Preparar resposta final
    const totalPedidos = pedidosFormatados.length;
    console.log(`Enviando resposta: Total=${totalPedidos}, Pedidos=${pedidosFormatados.length}`);
    
    try {
        // Verificar se os dados podem ser serializados para JSON
        const jsonString = JSON.stringify({
            total: totalPedidos,
            pedidos: pedidosFormatados
        });
        
        console.log(`Resposta JSON gerada com sucesso, tamanho: ${jsonString.length} caracteres`);
        console.log("========== FIM - PEDIDOS CONSOLIDADOS CONTROLLER ==========");
        
        return res.json({
            total: totalPedidos,
            pedidos: pedidosFormatados
        });
    } catch (error) {
        console.error("Erro ao serializar resposta para JSON:", error);
        console.log("========== FIM COM ERRO - PEDIDOS CONSOLIDADOS CONTROLLER ==========");
        
        // Enviar resposta mínima com erro
        return res.status(500).json({
            total: 0,
            pedidos: [],
            erro: true,
            mensagem: "Erro ao processar dados para resposta: " + error.message
        });
    }
}; 