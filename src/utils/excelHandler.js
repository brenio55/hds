import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function preencherPedidoCompra(dadosPedido, itens) {
    try {
        const workbook = new ExcelJS.Workbook();
        const templatePath = '/docs/admin/pedidoDeCompraTemplate.xlsx';
        
        // Carrega o template
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        await workbook.xlsx.load(arrayBuffer);
        
        const worksheet = workbook.getWorksheet('BM 1');
        if (!worksheet) {
            throw new Error('Planilha "BM 1" não encontrada no arquivo');
        }

        // Preenche os dados
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

        // Cria o PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Extrai os dados da planilha para o PDF
        const data = [];
        for (let row = 15; row <= 50; row++) {
            const rowData = [];
            for (let col = 1; col <= 19; col++) {
                const cell = worksheet.getCell(row, col);
                rowData.push(cell.value || '');
            }
            data.push(rowData);
        }

        // Configura o estilo da tabela
        pdf.autoTable({
            head: [['Código', 'Descrição', 'UN', 'Qtd', 'IPI', 'Valor Unit.', 'Valor Total', 'Desc.', 'Prev. Entrega']],
            body: data,
            startY: 20,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 60 },
                2: { cellWidth: 15 },
                3: { cellWidth: 15 },
                4: { cellWidth: 15 },
                5: { cellWidth: 20 },
                6: { cellWidth: 20 },
                7: { cellWidth: 15 },
                8: { cellWidth: 20 }
            }
        });

        // Converte o PDF para blob
        const pdfBlob = pdf.output('blob');
        return URL.createObjectURL(pdfBlob);
    } catch (error) {
        console.error('Erro ao processar Excel:', error);
        throw error;
    }
} 