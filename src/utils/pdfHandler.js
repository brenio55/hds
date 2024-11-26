import { PDFDocument, rgb } from 'pdf-lib';

export async function preencherPedidoCompra(dadosPedido, itens) {
    try {
        const templatePath = '/docs/admin/pedidoDeCompraTemplate.pdf';
        const response = await fetch(templatePath);
        const templateBytes = await response.arrayBuffer();

        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Obtém as dimensões da página
        const { width, height } = firstPage.getSize();
        const centerX = width / 2;
        let currentY = height - 100; // Começa do topo com margem
        const lineHeight = 25; // Espaçamento entre linhas

        // Função auxiliar para escrever texto centralizado
        const writeText = (text, y) => {
            firstPage.drawText(text, {
                x: centerX - 150, // Ajuste conforme necessário
                y: y,
                size: 12,
                color: rgb(0, 0, 0)
            });
        };

        // Escreve os dados do cabeçalho
        writeText(`Código: ${dadosPedido.codigo}`, currentY);
        currentY -= lineHeight;
        
        writeText(`Fornecedor: ${dadosPedido.fornecedor}`, currentY);
        currentY -= lineHeight;
        
        writeText(`CNPJ: ${dadosPedido.cnpj}`, currentY);
        currentY -= lineHeight;
        
        writeText(`Endereço: ${dadosPedido.endereco}`, currentY);
        currentY -= lineHeight;
        
        writeText(`CEP: ${dadosPedido.cep}`, currentY);
        currentY -= lineHeight;
        
        writeText(`Contato: ${dadosPedido.contato}`, currentY);
        currentY -= lineHeight;
        
        writeText(`Pedido: ${dadosPedido.pedido}`, currentY);
        currentY -= lineHeight;
        
        writeText(`Data Vencimento: ${dadosPedido.dataVencto}`, currentY);
        currentY -= lineHeight;
        
        writeText(`Cond. Pagto: ${dadosPedido.condPagto}`, currentY);
        currentY -= lineHeight;
        
        writeText(`Centro de Custo: ${dadosPedido.centroCusto}`, currentY);
        currentY -= lineHeight * 2; // Espaço extra antes dos itens

        // Escreve o cabeçalho dos itens
        writeText('ITENS DO PEDIDO', currentY);
        currentY -= lineHeight;

        // Escreve os itens
        itens.forEach((item, index) => {
            writeText(`Item ${index + 1}:`, currentY);
            currentY -= lineHeight;
            
            writeText(`  Código: ${item.item}`, currentY);
            currentY -= lineHeight;
            
            writeText(`  Descrição: ${item.descricao}`, currentY);
            currentY -= lineHeight;
            
            writeText(`  Unidade: ${item.unidade}`, currentY);
            currentY -= lineHeight;
            
            writeText(`  Quantidade: ${item.quantidade}`, currentY);
            currentY -= lineHeight;
            
            writeText(`  IPI: ${item.ipi}%`, currentY);
            currentY -= lineHeight;
            
            writeText(`  Valor Unitário: R$ ${item.valorUnitario}`, currentY);
            currentY -= lineHeight;
            
            writeText(`  Valor Total: R$ ${item.valorTotal}`, currentY);
            currentY -= lineHeight;
            
            writeText(`  Desconto: ${item.desconto}%`, currentY);
            currentY -= lineHeight;
            
            writeText(`  Previsão de Entrega: ${item.previsaoEntrega}`, currentY);
            currentY -= lineHeight * 1.5; // Espaço extra entre itens
        });

        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        return URL.createObjectURL(pdfBlob);
    } catch (error) {
        console.error('Erro ao processar PDF:', error);
        throw error;
    }
} 