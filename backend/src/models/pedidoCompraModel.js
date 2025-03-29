const db = require('../config/database');

class PedidoCompraModel {
  static async create(data) {
    const query = `
      INSERT INTO pedido_compra (
        clientinfo_id, fornecedores_id, ddl, data_vencimento,
        proposta_id, materiais, desconto, valor_frete,
        despesas_adicionais, dados_adicionais, frete, ativo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING *
    `;

    // Garantir que os campos JSON sejam strings JSON válidas
    const materiais = Array.isArray(data.materiais) ? JSON.stringify(data.materiais) : '[]';
    const frete = typeof data.frete === 'object' ? JSON.stringify(data.frete) : '{}';

    const values = [
      data.clientinfo_id,
      data.fornecedores_id,
      data.ddl,
      data.data_vencimento,
      data.proposta_id,
      materiais,  // Agora é uma string JSON
      data.desconto,
      data.valor_frete,
      data.despesas_adicionais,
      data.dados_adicionais,
      frete  // Agora é uma string JSON
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro SQL:', error);
      throw error;
    }
  }

  static async findAll() {
    console.log('========== INÍCIO - PEDIDO COMPRA MODEL - FIND ALL ==========');
    
    const query = `
      SELECT pc.*, f.razao_social as fornecedor_nome
      FROM pedido_compra pc
      LEFT JOIN fornecedores f ON pc.fornecedores_id = f.id
      ORDER BY pc.created_at DESC
    `;
    
    console.log('Executando query SQL:', query);
    
    try {
      const result = await db.query(query);
      console.log(`Resultados encontrados: ${result.rows.length}`);
      
      if (result.rows.length === 0) {
        console.log('AVISO: Nenhum pedido de compra encontrado no banco de dados');
      } else {
        console.log(`Exemplo do primeiro resultado: ID=${result.rows[0].id}, Cliente=${result.rows[0].clientinfo_id}, Fornecedor=${result.rows[0].fornecedores_id}`);
      }
      
      console.log('========== FIM - PEDIDO COMPRA MODEL - FIND ALL ==========');
      return result.rows;
    } catch (error) {
      console.error('ERRO ao buscar pedidos de compra:', error);
      console.error('Stack trace:', error.stack);
      console.log('========== FIM COM ERRO - PEDIDO COMPRA MODEL - FIND ALL ==========');
      throw error;
    }
  }

  static async findById(id) {
    const query = `
        SELECT 
            pc.*,
            f.razao_social as fornecedor_nome,
            f.cnpj as fornecedor_cnpj,
            f.inscricao_estadual as fornecedor_ie,
            f.inscricao_municipal as fornecedor_im,
            f.endereco as fornecedor_endereco,
            f.telefone as fornecedor_telefone,
            f.contato as fornecedor_contato,
            ci."RazaoSocial" as cliente_razao_social,
            ci."Endereço" as cliente_endereco,
            ci."CNPJ" as cliente_cnpj,
            ci."Telefone" as cliente_telefone,
            ci."InscricaoEstadual" as cliente_ie,
            ci."InscricaoMunicipal" as cliente_im,
            ci."clientCode" as cliente_code,
            p.descricao as proposta_descricao,
            p.valor_final as proposta_valor
        FROM pedido_compra pc
        LEFT JOIN fornecedores f ON pc.fornecedores_id = f.id
        LEFT JOIN "clientInfo" ci ON pc.clientinfo_id = ci.id
        LEFT JOIN propostas p ON pc.proposta_id = p.id
        WHERE pc.id = $1
    `;
    const result = await db.query(query, [id]);
    
    // Reorganizar os dados em uma estrutura mais conscisa
    if (result.rows[0]) {
        const row = result.rows[0];
        const formattedResult = {
            ...row,
            fornecedor: {
                razao_social: row.fornecedor_nome,
                cnpj: row.fornecedor_cnpj,
                inscricao_estadual: row.fornecedor_ie,
                inscricao_municipal: row.fornecedor_im,
                endereco: row.fornecedor_endereco,
                telefone: row.fornecedor_telefone,
                contato: row.fornecedor_contato
            },
            clientInfo: {
                code: row.cliente_code,
                razao_social: row.cliente_razao_social,
                endereco: row.cliente_endereco,
                cnpj: row.cliente_cnpj,
                telefone: row.cliente_telefone,
                inscricao_estadual: row.cliente_ie,
                inscricao_municipal: row.cliente_im
            },
            proposta: {
                descricao: row.proposta_descricao,
                valor_final: row.proposta_valor
            }
        };

        // Remover as propriedades antigas
        delete formattedResult.fornecedor_nome;
        delete formattedResult.fornecedor_cnpj;
        delete formattedResult.fornecedor_ie;
        delete formattedResult.fornecedor_im;
        delete formattedResult.fornecedor_endereco;
        delete formattedResult.fornecedor_telefone;
        delete formattedResult.fornecedor_contato;
        delete formattedResult.cliente_code;
        delete formattedResult.cliente_razao_social;
        delete formattedResult.cliente_endereco;
        delete formattedResult.cliente_cnpj;
        delete formattedResult.cliente_telefone;
        delete formattedResult.cliente_ie;
        delete formattedResult.cliente_im;
        delete formattedResult.proposta_descricao;
        delete formattedResult.proposta_valor;

        return formattedResult;
    }
    return null;
  }

  static async update(id, data) {
    const query = `
      UPDATE pedido_compra
      SET clientinfo_id = $1, fornecedores_id = $2, ddl = $3,
          data_vencimento = $4, proposta_id = $5, materiais = $6,
          desconto = $7, valor_frete = $8, despesas_adicionais = $9,
          dados_adicionais = $10, frete = $11, ativo = $13
      WHERE id = $12
      RETURNING *
    `;

    const values = [
      data.clientinfo_id,
      data.fornecedores_id,
      data.ddl,
      data.data_vencimento,
      data.proposta_id,
      data.materiais,
      data.desconto,
      data.valor_frete,
      data.despesas_adicionais,
      data.dados_adicionais,
      data.frete,
      id,
      data.ativo
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByField(campo, valor) {
    try {
      let query = `
        SELECT pc.*, f.razao_social as fornecedor_nome
        FROM pedido_compra pc
        LEFT JOIN fornecedores f ON pc.fornecedores_id = f.id
      `;

      // Tratamento especial para campos que são JSON
      if (campo === 'materiais' || campo === 'frete') {
        query += `WHERE pc.${campo}::text ILIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Tratamento para campos de data
      if (campo === 'data_vencimento' || campo === 'created_at') {
        query += `WHERE pc.${campo}::text LIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Busca case-insensitive para campos de texto
      if (typeof valor === 'string') {
        query += `WHERE CAST(pc.${campo} AS TEXT) ILIKE $1`;
        const result = await db.query(query, [`%${valor}%`]);
        return result.rows;
      }

      // Busca exata para números e outros tipos
      query += `WHERE pc.${campo} = $1`;
      const result = await db.query(query, [valor]);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar pedidos por campo:', error);
      throw new Error(`Erro ao buscar pedidos por ${campo}: ${error.message}`);
    }
  }
}

module.exports = PedidoCompraModel; 