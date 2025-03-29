const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FornecedorModel = require('../models/fornecedorModel');

class ServicoPdfService {
  static async imageToBase64(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      return '';
    }
  }

  static async generatePdf(servico) {
    try {
      // Lê o template
      const templatePath = path.join(__dirname, '../templates/servico.html');
      const templateContent = await fs.readFile(templatePath, 'utf8');

      // Prepara a imagem
      const logoPath = path.join(__dirname, '../imgs/logo_horizontal.png');
      const logoBase64 = await this.imageToBase64(logoPath);

      // Registra helpers do Handlebars
      handlebars.registerHelper('formatDate', function(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('pt-BR');
      });

      handlebars.registerHelper('formatMoney', function(value) {
        if (!value) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        });
      });

      // Busca dados do fornecedor
      let fornecedor = null;
      if (servico.fornecedor_id) {
        fornecedor = await FornecedorModel.findById(servico.fornecedor_id);
      }

      // Compila e renderiza o template
      const template = handlebars.compile(templateContent);
      const html = template({
        ...servico,
        fornecedor,
        logoBase64
      });

      // Inicia o navegador
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html);

      // Gera um UUID para o arquivo
      const uid = uuidv4();
      const pdfDir = path.join(__dirname, '../../uploads/pdfs');
      await fs.mkdir(pdfDir, { recursive: true });

      const pdfPath = path.join(pdfDir, `${uid}.pdf`);

      // Gera o PDF
      await page.pdf({
        path: pdfPath,
        format: 'A4',
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

module.exports = ServicoPdfService; 