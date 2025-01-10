import supabase from '../utils/Supabase';

// Funções relacionadas a Pedidos
export const pedidosService = {
    async criarPedido(dadosPedido) {
        try {
            // Inserir o pedido principal
            const { data: pedidoData, error: pedidoError } = await supabase
                .from('pedidos')
                .insert([{
                    pedido_id: dadosPedido.pedido,
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

            return pedidoData;
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw error;
        }
    },

    async inserirItensPedido(pedidoId, itens) {
        try {
            // Primeiro, vamos garantir que os materiais existam
            for (const item of itens) {
                // Verifica se o material já existe
                const { data: materialExistente } = await supabase
                    .from('materiais')
                    .select('material_id')
                    .eq('material_id', item.item)
                    .single();

                // Se o material não existe, cria-o
                if (!materialExistente) {
                    await supabase
                        .from('materiais')
                        .insert([{
                            material_id: item.item,
                            descricao: item.descricao,
                            unidade: item.unidade
                        }]);
                }

                // Insere o item do pedido
                const { error: itemError } = await supabase
                    .from('itens_pedido')
                    .insert([{
                        item_id: parseInt(item.item),
                        pedido_id: pedidoId,
                        material_id: item.item,
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
        const pedido = await pedidosService.criarPedido(dadosPedido);

        // 3. Inserir itens do pedido
        await pedidosService.inserirItensPedido(dadosPedido.pedido, itens);

        return { success: true, pedido };
    } catch (error) {
        console.error('Erro ao salvar pedido completo:', error);
        throw error;
    }
}; 