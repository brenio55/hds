/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FornecedorModel = require('../models/fornecedorModel');
const { registerPdfHelpers } = require('./pdfHelpers');

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
      console.log('Iniciando geração do PDF para pedido:', pedido.id);

      // Busca dados completos do fornecedor
      const fornecedor = await FornecedorModel.findById(pedido.fornecedor_id);
      if (!fornecedor) {
        throw new Error('Fornecedor não encontrado');
      }
      console.log('Fornecedor encontrado:', fornecedor.razao_social);

      // Lê o template
      const templatePath = path.join(__dirname, '../templates/pedido_locacao.html');
      console.log('Caminho do template:', templatePath);
      const templateContent = await fs.readFile(templatePath, 'utf8');

      // Prepara a imagem
      const logoHorizontalPath = path.join(__dirname, '../imgs/logo_horizontal.png');
      console.log('Caminho do logo:', logoHorizontalPath);
      const logoHorizontalSrc = await this.imageToBase64(logoHorizontalPath);

      // Registra os helpers globais
      registerPdfHelpers();

      // Parse itens if they are a string
      const itens = typeof pedido.itens === 'string' ? JSON.parse(pedido.itens) : pedido.itens;

      // Process each item to calculate IPI and discount values
      const itensProcessados = itens.map(item => {
        const valorTotal = parseFloat(item.valor_total) || 0;
        const ipi = parseFloat(item.ipi) || 0;
        const desconto = parseFloat(item.desconto) || 0;

        // Calculate IPI value
        const valor_ipi = valorTotal * (ipi / 100);

        // Calculate value with IPI
        const valor_com_ipi = valorTotal + valor_ipi;

        // Calculate discount on (PRODUCTS + IPI)
        const valor_desconto = valor_com_ipi * (desconto / 100);

        // Calculate final value for the item
        const valor_final = valor_com_ipi - valor_desconto;

        return {
          ...item,
          valor_ipi,
          valor_com_ipi,
          valor_desconto,
          valor_final
        };
      });

      // Prepara os dados
      const data = {
        ...pedido,
        fornecedor,
        logoHorizontalSrc,
        dataEmissao: new Date().toLocaleDateString('pt-BR'),
        ano: new Date().getFullYear(),
        itens: itensProcessados
      };
      console.log('Dados preparados para o template:', JSON.stringify(data, null, 2));

      // Compila o template
      const template = handlebars.compile(templateContent);
      const html = template(data);
      console.log('HTML gerado com sucesso');

      // Configura o Puppeteer
      console.log('Iniciando Puppeteer...');
      const browser = await puppeteer.launch({ 
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      console.log('Navegador iniciado');

      const page = await browser.newPage();
      console.log('Nova página criada');

      // Define o viewport
      await page.setViewport({
        width: 1754,
        height: 2481,
        deviceScaleFactor: 1
      });
      console.log('Viewport configurado');

      // Configura o conteúdo
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });
      console.log('Conteúdo HTML carregado na página');

      // Prepara o diretório e arquivo
      const uid = uuidv4();
      const pdfDir = path.join(__dirname, '../../uploads/pdfs');
      const pdfPath = path.join(pdfDir, `${uid}.pdf`);
      console.log('Caminho do PDF:', pdfPath);

      // Cria diretório se não existir
      try {
        await fs.access(pdfDir);
        console.log('Diretório de PDFs já existe');
      } catch (error) {
        console.log('Criando diretório de PDFs...');
        await fs.mkdir(pdfDir, { recursive: true });
        console.log('Diretório de PDFs criado:', pdfDir);
      }

      // Gera o PDF
      console.log('Gerando PDF...');
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
      console.log('PDF gerado');

      // Fecha o navegador
      await browser.close();
      console.log('Navegador fechado');

      // Verifica se o arquivo foi criado
      try {
        await fs.access(pdfPath);
        const stats = await fs.stat(pdfPath);
        console.log('PDF criado com sucesso. Tamanho:', stats.size, 'bytes');
      } catch (error) {
        console.error('Erro ao verificar arquivo PDF:', error);
        throw new Error('Falha ao gerar arquivo PDF');
      }

      return uid;

    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error);
      throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
  }
}

module.exports = PedidoLocacaoPdfService; 