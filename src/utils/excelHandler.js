import ExcelJS from 'exceljs';

export async function preencherPedidoCompra(dadosPedido, itens) {
    try {
        const workbook = new ExcelJS.Workbook();
        const templatePath = '/docs/admin/pedidoDeCompraTemplate.xlsx';
        
        // Busca o arquivo usando fetch com responseType blob
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        
        // Converte blob para array buffer
        const arrayBuffer = await blob.arrayBuffer();
        
        // Carrega o workbook a partir do array buffer
        await workbook.xlsx.load(arrayBuffer);
        
        // Verifica se a planilha existe
        const worksheet = workbook.getWorksheet('BM 1');
        if (!worksheet) {
            throw new Error('Planilha "BM 1" não encontrada no arquivo');
        }

        // Preenche os dados do cabeçalho
        worksheet.getCell('D15').value = dadosPedido.codigo;
        worksheet.getCell('D17').value = dadosPedido.endereco;
        worksheet.getCell('H15').value = dadosPedido.fornecedor;
        worksheet.getCell('H17').value = dadosPedido.cep;
        worksheet.getCell('O15').value = dadosPedido.cnpj;
        worksheet.getCell('O17').value = dadosPedido.contato;
        worksheet.getCell('D24').value = dadosPedido.condPagto;
        worksheet.getCell('H24').value = dadosPedido.dataVencto;
        worksheet.getCell('E26').value = dadosPedido.centroCusto;
        
        // Preenche os itens
        itens.forEach((item, index) => {
            const linha = 33 + index;
            worksheet.getCell(`C${linha}`).value = item.item;
            worksheet.getCell(`D${linha}`).value = item.descricao;
            worksheet.getCell(`H${linha}`).value = item.unidade;
            worksheet.getCell(`J${linha}`).value = item.quantidade;
            worksheet.getCell(`L${linha}`).value = item.ipi;
            worksheet.getCell(`M${linha}`).value = item.valorUnitario;
            worksheet.getCell(`O${linha}`).value = item.valorTotal;
            worksheet.getCell(`Q${linha}`).value = item.desconto;
            worksheet.getCell(`S${linha}`).value = item.previsaoEntrega;
        });
        
        // Gera o buffer do arquivo modificado
        const buffer = await workbook.xlsx.writeBuffer();
        
        // Cria um Blob com o buffer
        const excelBlob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        return URL.createObjectURL(excelBlob);
    } catch (error) {
        console.error('Erro ao processar Excel:', error);
        throw error;
    }
} 