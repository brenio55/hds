const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FornecedorModel = require('../models/fornecedorModel');

class ServicoPdfService {
  static async imageToBase64(imagePath) {
    try {
      console.log(`[imageToBase64] Carregando imagem de: ${imagePath}`);
      const imageBuffer = await fs.readFile(imagePath);
      console.log(`[imageToBase64] Imagem carregada com sucesso. Tamanho: ${imageBuffer.length} bytes`);
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      return '';
    }
  }

  static async generatePdf(servico) {
    try {
      console.log('========== INÍCIO DA GERAÇÃO DE PDF DE SERVIÇO ==========');
      console.log('Dados recebidos do serviço:', JSON.stringify(servico, null, 2));
      
      // Lê o template
      const templatePath = path.join(__dirname, '../templates/servico.html');
      console.log(`[generatePdf] Caminho do template: ${templatePath}`);
      
      try {
        await fs.access(templatePath);
        console.log(`[generatePdf] Template existe e está acessível`);
      } catch (err) {
        console.error(`[generatePdf] ERRO: Template não encontrado ou não acessível:`, err);
      }
      
      const templateContent = await fs.readFile(templatePath, 'utf8');
      console.log(`[generatePdf] Template carregado. Tamanho: ${templateContent.length} caracteres`);

      // Prepara a imagem
      const logoPath = path.join(__dirname, '../imgs/logo_horizontal.png');
      console.log(`[generatePdf] Caminho da logo: ${logoPath}`);
      
      try {
        await fs.access(logoPath);
        console.log(`[generatePdf] Logo existe e está acessível`);
      } catch (err) {
        console.error(`[generatePdf] ERRO: Logo não encontrada ou não acessível:`, err);
      }
      
      const logoBase64 = await this.imageToBase64(logoPath);
      console.log(`[generatePdf] Logo convertida para base64. Tamanho: ${logoBase64.length} caracteres`);

      // Registra helpers do Handlebars
      console.log(`[generatePdf] Registrando helpers do Handlebars`);
      handlebars.registerHelper('formatDate', function(date) {
        console.log(`[formatDate helper] Formatando data: ${date}`);
        if (!date) return '';
        return new Date(date).toLocaleDateString('pt-BR');
      });

      handlebars.registerHelper('formatMoney', function(value) {
        console.log(`[formatMoney helper] Formatando valor: ${value}`);
        if (!value) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        });
      });

      // Busca dados do fornecedor
      let fornecedor = null;
      if (servico.fornecedor_id) {
        console.log(`[generatePdf] Buscando fornecedor ID: ${servico.fornecedor_id}`);
        fornecedor = await FornecedorModel.findById(servico.fornecedor_id);
        console.log(`[generatePdf] Fornecedor encontrado:`, JSON.stringify(fornecedor, null, 2));
      } else {
        console.log(`[generatePdf] AVISO: ID do fornecedor não foi fornecido no serviço`);
      }

      // Prepara os dados para o template
      const dadosTemplate = {
        ...servico,
        fornecedor,
        logoBase64
      };
      console.log(`[generatePdf] Dados preparados para template:`, JSON.stringify({
        ...dadosTemplate,
        logoBase64: logoBase64 ? '(base64 string omitida)' : null,
        itens: servico.itens ? { 
          ...servico.itens,
          materiais: Array.isArray(servico.itens.materiais) 
            ? `${servico.itens.materiais.length} itens encontrados` 
            : 'Materiais não são um array ou não estão presentes'
        } : 'Nenhum item encontrado'
      }, null, 2));

      // Compila e renderiza o template
      console.log(`[generatePdf] Compilando template`);
      const template = handlebars.compile(templateContent);
      
      console.log(`[generatePdf] Renderizando HTML`);
      const html = template(dadosTemplate);
      console.log(`[generatePdf] HTML renderizado. Tamanho: ${html.length} caracteres`);

      // Inicia o navegador
      console.log(`[generatePdf] Iniciando navegador Puppeteer`);
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      console.log(`[generatePdf] Configurando conteúdo da página`);
      await page.setContent(html);

      // Gera um UUID para o arquivo
      const uid = uuidv4();
      console.log(`[generatePdf] UUID gerado: ${uid}`);
      
      const pdfDir = path.join(__dirname, '../../uploads/pdfs');
      console.log(`[generatePdf] Diretório para PDFs: ${pdfDir}`);
      
      try {
        await fs.mkdir(pdfDir, { recursive: true });
        console.log(`[generatePdf] Diretório de PDFs criado/verificado com sucesso`);
      } catch (err) {
        console.error(`[generatePdf] ERRO ao criar diretório para PDFs:`, err);
      }

      const pdfPath = path.join(pdfDir, `${uid}.pdf`);
      console.log(`[generatePdf] Caminho completo do arquivo PDF: ${pdfPath}`);

      // Gera o PDF
      console.log(`[generatePdf] Gerando arquivo PDF`);
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
      console.log(`[generatePdf] PDF gerado com sucesso`);

      console.log(`[generatePdf] Fechando navegador`);
      await browser.close();
      
      console.log(`========== FIM DA GERAÇÃO DE PDF DE SERVIÇO ==========`);
      return uid;
    } catch (error) {
      console.error('ERRO CRÍTICO ao gerar PDF:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
  }
}

module.exports = ServicoPdfService; 