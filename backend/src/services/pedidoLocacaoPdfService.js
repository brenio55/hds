const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FornecedorModel = require('../models/fornecedorModel');

class PedidoLocacaoPdfService {
  static async imageToBase64(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      return '';
    }
  }

  static async generatePdf(pedido) {
    try {
      // Busca dados completos do fornecedor
      const fornecedor = await FornecedorModel.findById(pedido.fornecedor_id);
      if (!fornecedor) {
        throw new Error('Fornecedor não encontrado');
      }

      // Lê o template
      const templatePath = path.join(__dirname, '../templates/pedido_locacao.html');
      const templateContent = await fs.readFile(templatePath, 'utf8');

      // Prepara a imagem
      const logoHorizontalPath = path.join(__dirname, '../imgs/logo_horizontal.png');
      const logoHorizontalSrc = await this.imageToBase64(logoHorizontalPath);

      // Registra helper para formatar data
      handlebars.registerHelper('formatDate', function(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
      });

      // Compila o template
      const template = handlebars.compile(templateContent);

      // Prepara os dados
      const data = {
        ...pedido,
        fornecedor,
        logoHorizontalSrc,
        dataEmissao: new Date().toLocaleDateString('pt-BR'),
        ano: new Date().getFullYear(),
        itens: Array.isArray(pedido.itens) ? pedido.itens : JSON.parse(pedido.itens || '[]')
      };

      // Gera o HTML
      const html = template(data);

      // Gera o PDF
      const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox']
      });
      const page = await browser.newPage();

      // Define o viewport para A3 com largura maior
      await page.setViewport({
        width: 1754,  // A3 width em pixels (297mm)
        height: 2481, // A3 height em pixels (420mm)
        deviceScaleFactor: 1
      });

      await page.setContent(html);

      // Gera um UID único para o arquivo
      const uid = uuidv4();
      const pdfPath = path.join(__dirname, `../../uploads/pdfs/${uid}.pdf`);

      // Garante que o diretório existe
      const pdfDir = path.dirname(pdfPath);
      await fs.mkdir(pdfDir, { recursive: true });

      // Gera o PDF com margens
      await page.pdf({
        path: pdfPath,
        format: 'A3',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        printBackground: true
      });

      await browser.close();
      return uid;

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
  }
}

module.exports = PedidoLocacaoPdfService; 