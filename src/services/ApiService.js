import supabase from '../utils/Supabase';

// Funções relacionadas a Pedidos
export const pedidosService = {
    async gerarNumeroPedido() {
        try {
            // Busca o último pedido
            const { data, error } = await supabase
                .from('pedidos')
                .select('pedido_id')
                .order('pedido_id', { ascending: false })
                .limit(1);

            if (error) throw error;

            // Se não houver pedidos, começa do 1
            if (!data || data.length === 0) {
                return 1;
            }

            // Retorna o próximo número
            return parseInt(data[0].pedido_id) + 1;
        } catch (error) {
            console.error('Erro ao gerar número do pedido:', error);
            throw error;
        }
    },

    async criarPedido(dadosPedido) {
        try {
            // Gera um novo número de pedido
            const numeroPedido = await this.gerarNumeroPedido();

            // Inserir o pedido principal
            const { data: pedidoData, error: pedidoError } = await supabase
                .from('pedidos')
                .insert([{
                    pedido_id: numeroPedido,
                    data_criacao: new Date().toISOString().split('T')[0],
                    total_bruto: parseFloat(dadosPedido.totalBruto.replace(',', '.')),
                    descontos: parseFloat(dadosPedido.totalDescontos.replace(',', '.')),
                    frete: parseFloat(dadosPedido.valorFrete.replace(',', '.')),
                    outras_despesas: parseFloat(dadosPedido.outrasDespesas.replace(',', '.')),
                    total_final: parseFloat(dadosPedido.totalFinal.replace(',', '.')),
                    prev_entrega: dadosPedido.previsaoEntrega
                }])
                .select();

            if (pedidoError) throw pedidoError;

            return { ...pedidoData[0], numeroPedido };
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw error;
        }
    },

    async inserirItensPedido(pedidoId, itens) {
        try {
            // Primeiro, vamos garantir que os materiais existam
            for (let index = 0; index < itens.length; index++) {
                const item = itens[index];
                // Converte o ID do item para número, removendo qualquer texto
                const materialId = parseInt(item.item.replace(/\D/g, ''));
                
                // Verifica se o material já existe
                const { data: materialExistente } = await supabase
                    .from('materiais')
                    .select('material_id')
                    .eq('material_id', materialId)
                    .single();

                // Se o material não existe, cria-o
                if (!materialExistente) {
                    await supabase
                        .from('materiais')
                        .insert([{
                            material_id: materialId,
                            descricao: item.descricao,
                            unidade: item.unidade
                        }]);
                }

                // Insere o item do pedido com numeração sequencial
                const { error: itemError } = await supabase
                    .from('itens_pedido')
                    .insert([{
                        item_id: index + 1, // Numeração sequencial começando do 1
                        pedido_id: parseInt(pedidoId),
                        material_id: materialId,
                        quantidade: parseFloat(item.quantidade.replace(',', '.')),
                        ipi: parseFloat(item.ipi.replace(',', '.')),
                        valor_unitario: parseFloat(item.valorUnitario.replace(',', '.')),
                        valor_total: parseFloat(item.valorTotal.replace(',', '.'))
                    }]);

                if (itemError) throw itemError;
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
            // Verifica se o cliente já existe
            const { data: clienteExistente } = await supabase
                .from('clientInfo')
                .select('*')
                .eq('clientCode', dadosCliente.codigo)
                .single();

            if (clienteExistente) {
                // Atualiza o cliente existente
                const { data, error } = await supabase
                    .from('clientInfo')
                    .update({
                        RazaoSocial: dadosCliente.fornecedor,
                        CNPJ: dadosCliente.cnpj,
                        Endereço: dadosCliente.endereco,
                        Telefone: dadosCliente.contato
                    })
                    .eq('clientCode', dadosCliente.codigo)
                    .select();

                if (error) throw error;
                return data;
            } else {
                // Cria um novo cliente
                const { data, error } = await supabase
                    .from('clientInfo')
                    .insert([{
                        clientCode: dadosCliente.codigo,
                        RazaoSocial: dadosCliente.fornecedor,
                        CNPJ: dadosCliente.cnpj,
                        Endereço: dadosCliente.endereco,
                        Telefone: dadosCliente.contato
                    }])
                    .select();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Erro ao atualizar/criar cliente:', error);
            throw error;
        }
    }
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