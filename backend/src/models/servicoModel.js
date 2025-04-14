const db = require('../config/database');

class ServicoModel {
  /**
   * Calculates valor_final for each item and the total sum
   * @param {Object|Array} itens - The items to process
   * @returns {Object} - Object containing processed items and total
   */
  static calculateValues(itens) {
    let total = 0;
    let totalFrete = 0;
    let totalOutrasDespesas = 0;
    let processedItens = itens;
    let freteDefined = false;
    let outrasDespesasDefined = false;
    
    if (!itens) {
      return { processedItens: {}, total: 0 };
    }
    
    const items = typeof itens === 'string' ? JSON.parse(itens) : itens;
    
    // Handle both array and object formats
    if (Array.isArray(items)) {
      processedItens = items.map(item => {
        if (!item) return item;
        
        const valor_total = parseFloat(item.valor_total) || 0;
        const ipi = parseFloat(item.ipi) || 0;
        const desconto = parseFloat(item.desconto) || 0;
        const valor_frete = parseFloat(item.valor_frete) || 0;
        const outras_despesas = parseFloat(item.outras_despesas) || 0;
        
        // Registramos o valor do frete e outras despesas apenas se ainda não definidos
        if (!freteDefined && valor_frete > 0) {
          totalFrete = valor_frete;
          freteDefined = true;
        }
        
        if (!outrasDespesasDefined && outras_despesas > 0) {
          totalOutrasDespesas = outras_despesas;
          outrasDespesasDefined = true;
        }
        
        // Calcular valor do IPI
        const valor_ipi = valor_total * (ipi / 100);
        
        // Valor com IPI
        const valor_com_ipi = valor_total + valor_ipi;
        
        // Calcular desconto sobre (PRODUTOS + IPI)
        const valor_desconto = valor_com_ipi * (desconto / 100);
        
        // Calcular valor final: (PRODUTOS + IPI) - DESCONTO (sem contar frete e outras despesas)
        const valor_final = valor_com_ipi - valor_desconto;
        
        // Somamos o valor_final ao total
        total += valor_final;
        
        return { 
          ...item, 
          valor_ipi,
          valor_com_ipi,
          valor_desconto,
          valor_final 
        };
      });
    } else if (typeof items === 'object') {
      // Handle object with numeric keys
      processedItens = {};
      
      // Process numeric keys (items)
      Object.entries(items).forEach(([key, item]) => {
        if (!item) {
          processedItens[key] = item;
          return;
        }
        
        if (key.match(/^[0-9]+$/) && typeof item === 'object') {
          const valor_total = parseFloat(item.valor_total) || 0;
          const ipi = parseFloat(item.ipi) || 0;
          const desconto = parseFloat(item.desconto) || 0;
          const valor_frete = parseFloat(item.valor_frete) || 0;
          const outras_despesas = parseFloat(item.outras_despesas) || 0;
          
          // Registramos o valor do frete e outras despesas apenas se ainda não definidos
          if (!freteDefined && valor_frete > 0) {
            totalFrete = valor_frete;
            freteDefined = true;
          }
          
          if (!outrasDespesasDefined && outras_despesas > 0) {
            totalOutrasDespesas = outras_despesas;
            outrasDespesasDefined = true;
          }
          
          // Calcular valor do IPI
          const valor_ipi = valor_total * (ipi / 100);
          
          // Valor com IPI
          const valor_com_ipi = valor_total + valor_ipi;
          
          // Calcular desconto sobre (PRODUTOS + IPI)
          const valor_desconto = valor_com_ipi * (desconto / 100);
          
          // Calcular valor final: (PRODUTOS + IPI) - DESCONTO (sem contar frete e outras despesas)
          const valor_final = valor_com_ipi - valor_desconto;
          
          // Somamos o valor_final ao total
          total += valor_final;
          
          processedItens[key] = { 
            ...item, 
            valor_ipi,
            valor_com_ipi,
            valor_desconto,
            valor_final 
          };
        } else {
          // Copy non-numeric keys as is (like afazer_contratada, afazer_contratante, informacao_importante)
          processedItens[key] = item;
        }
      });
      
      // Ensure afazer arrays exist
      if (!processedItens.afazer_contratada) {
        processedItens.afazer_contratada = [
          "- Fazer o que esta acordado em contrato",
          "- Ser responsavel"
        ];
      }
      
      if (!processedItens.afazer_contratante) {
        processedItens.afazer_contratante = [
          "- Ser responsavel",
          "- cumprir acordo"
        ];
      }
    }
    
    // Adicionar frete e outras despesas ao total final (apenas uma vez)
    total += totalFrete + totalOutrasDespesas;
    
    return { processedItens, total };
  }

  static async create(data) {
    console.log("========== INÍCIO - CREATE SERVIÇO MODEL ==========");
    console.log("Dados recebidos para criar serviço:", JSON.stringify(data, null, 2));
    
    try {
      // Calculate total and valor_final from itens using the utility function
      const { processedItens, total } = this.calculateValues(data.itens);
      
      const query = `
        INSERT INTO servico (
          fornecedor_id,
          data_vencimento,
          proposta_id,
          itens,
          total
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [
        data.fornecedor_id,
        data.data_vencimento,
        data.proposta_id,
        typeof processedItens === 'string' ? processedItens : JSON.stringify(processedItens),
        total
      ];
      
      console.log("Query SQL:", query);
      console.log("Valores para a query:", JSON.stringify(values, null, 2));

      const result = await db.query(query, values);
      console.log("Resultado da inserção:", JSON.stringify(result.rows[0], null, 2));
      console.log("========== FIM - CREATE SERVIÇO MODEL ==========");
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar serviço no banco de dados:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async findById(id) {
    console.log(`========== INÍCIO - FIND SERVIÇO BY ID: ${id} ==========`);
    
    const query = 'SELECT * FROM servico WHERE id = $1';
    console.log("Query SQL:", query);
    console.log("Valores:", [id]);
    
    try {
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        console.log(`Nenhum serviço encontrado com ID: ${id}`);
        console.log("========== FIM - FIND SERVIÇO BY ID ==========");
        return null;
      }
      
      console.log("Serviço encontrado:", JSON.stringify(result.rows[0], null, 2));
      console.log("========== FIM - FIND SERVIÇO BY ID ==========");
      return result.rows[0];
    } catch (error) {
      console.error(`Erro ao buscar serviço com ID ${id}:`, error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async findAll() {
    console.log('========== INÍCIO - SERVIÇO MODEL - FIND ALL ==========');
    
    const query = 'SELECT * FROM servico ORDER BY created_at DESC';
    console.log('Executando query SQL:', query);
    
    try {
      const result = await db.query(query);
      console.log(`Resultados encontrados: ${result.rows.length}`);
      
      if (result.rows.length === 0) {
        console.log('AVISO: Nenhum serviço encontrado no banco de dados');
      } else {
        // Vamos inspecionar detalhadamente o primeiro resultado para debug
        const primeiroServico = result.rows[0];
        console.log(`Exemplo do primeiro resultado: ID=${primeiroServico.id}, Fornecedor=${primeiroServico.fornecedor_id}`);
        console.log('Estrutura completa do primeiro serviço:', JSON.stringify(primeiroServico, null, 2));
        
        // Verificar a estrutura de itens para entender se está no formato esperado
        if (primeiroServico.itens) {
          console.log('Tipo de dados do campo itens:', typeof primeiroServico.itens);
          
          try {
            // Se for string, vamos tentar parsear para entender o conteúdo
            if (typeof primeiroServico.itens === 'string') {
              const itensParsed = JSON.parse(primeiroServico.itens);
              console.log('Conteúdo do campo itens parseado:', JSON.stringify(itensParsed, null, 2));
            } else {
              console.log('Conteúdo do campo itens:', JSON.stringify(primeiroServico.itens, null, 2));
            }
          } catch (parseError) {
            console.error('ERRO ao parsear campo itens:', parseError.message);
          }
        } else {
          console.log('AVISO: Campo itens não existe ou é nulo no primeiro serviço');
        }
      }
      
      // Processar todos os serviços para garantir que o campo itens esteja no formato correto
      const processedResults = result.rows.map(servico => {
        try {
          // Criar uma cópia do serviço para não modificar o original
          const processedServico = { ...servico };
          
          // Verificar e processar o campo itens
          if (processedServico.itens) {
            // Se for string, tentar converter para objeto
            if (typeof processedServico.itens === 'string') {
              try {
                processedServico.itens = JSON.parse(processedServico.itens);
                console.log(`Serviço ID=${processedServico.id}: Campo itens convertido de string para objeto`);
              } catch (parseError) {
                console.error(`Serviço ID=${processedServico.id}: ERRO ao parsear campo itens:`, parseError.message);
                // Manter como array vazio em caso de erro
                processedServico.itens = [];
              }
            } 
            // Se não for array após o parsing, converter para array vazio
            if (!Array.isArray(processedServico.itens)) {
              console.warn(`Serviço ID=${processedServico.id}: Campo itens não é um array, convertendo para array vazio`);
              processedServico.itens = [];
            }
          } else {
            // Se não existir, inicializar como array vazio
            processedServico.itens = [];
          }
          
          return processedServico;
        } catch (error) {
          console.error(`Erro ao processar serviço ID=${servico.id}:`, error);
          // Retornar o serviço original em caso de erro
          return servico;
        }
      });
      
      console.log('========== FIM - SERVIÇO MODEL - FIND ALL ==========');
      return processedResults;
    } catch (error) {
      console.error('ERRO ao buscar serviços:', error);
      console.error('Stack trace:', error.stack);
      console.log('========== FIM COM ERRO - SERVIÇO MODEL - FIND ALL ==========');
      throw error;
    }
  }

  static async update(id, data) {
    console.log(`========== INÍCIO - UPDATE SERVIÇO ID: ${id} ==========`);
    console.log("Dados recebidos para atualização:", JSON.stringify(data, null, 2));
    
    try {
      // Calculate total and valor_final from itens using the utility function
      const { processedItens, total } = this.calculateValues(data.itens);
      
      const query = `
        UPDATE servico
        SET 
          fornecedor_id = $1,
          data_vencimento = $2,
          proposta_id = $3,
          itens = $4,
          pdf_uid = $5,
          total = $6
        WHERE id = $7
        RETURNING *
      `;
      
      const values = [
        data.fornecedor_id,
        data.data_vencimento,
        data.proposta_id,
        typeof processedItens === 'string' ? processedItens : JSON.stringify(processedItens),
        data.pdf_uid,
        total,
        id
      ];
      
      console.log("Query SQL:", query);
      console.log("Valores para a query:", JSON.stringify(values, null, 2));

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        console.log(`Nenhum serviço encontrado com ID: ${id} para atualizar`);
        console.log("========== FIM - UPDATE SERVIÇO ==========");
        return null;
      }
      
      console.log("Serviço atualizado:", JSON.stringify(result.rows[0], null, 2));
      console.log("========== FIM - UPDATE SERVIÇO ==========");
      return result.rows[0];
    } catch (error) {
      console.error('Error in ServicoModel.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    console.log(`========== INÍCIO - DELETE SERVIÇO ID: ${id} ==========`);
    
    const query = 'DELETE FROM servico WHERE id = $1 RETURNING *';
    console.log("Query SQL:", query);
    console.log("Valores:", [id]);
    
    try {
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        console.log(`Nenhum serviço encontrado com ID: ${id} para deletar`);
        console.log("========== FIM - DELETE SERVIÇO ==========");
        return null;
      }
      
      console.log("Serviço deletado:", JSON.stringify(result.rows[0], null, 2));
      console.log("========== FIM - DELETE SERVIÇO ==========");
      return result.rows[0];
    } catch (error) {
      console.error(`Erro ao deletar serviço com ID ${id}:`, error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  static async findByField(campo, valor) {
    console.log(`========== INÍCIO - FIND SERVIÇO BY FIELD: ${campo} = ${valor} ==========`);
    
    try {
      let query = 'SELECT * FROM servico WHERE ';
      let params = [];
      
      if (campo === 'itens') {
        // Busca em campos JSON
        query += `itens::text ILIKE '%${valor}%'`;
        console.log("Busca em campo JSON");
      } else if (['id', 'fornecedor_id', 'proposta_id'].includes(campo)) {
        // Busca exata para IDs
        query += `${campo} = $1`;
        params.push(valor);
        console.log("Busca exata por ID");
      } else if (campo === 'data_vencimento') {
        // Busca exata para data
        query += `${campo}::text = $1`;
        params.push(valor);
        console.log("Busca por data");
      } else {
        console.log(`Campo de busca inválido: ${campo}`);
        throw new Error('Campo de busca inválido');
      }

      query += ' ORDER BY created_at DESC';
      console.log("Query SQL:", query);
      console.log("Parâmetros:", params);
      
      const result = await db.query(query, params);
      console.log(`Encontrados ${result.rows.length} serviços com ${campo} = ${valor}`);
      console.log("========== FIM - FIND SERVIÇO BY FIELD ==========");
      
      return result.rows;
    } catch (error) {
      console.error(`Erro ao buscar por ${campo}:`, error);
      console.error("Stack trace:", error.stack);
      throw new Error(`Erro ao buscar por ${campo}: ${error.message}`);
    }
  }
}

module.exports = ServicoModel; 