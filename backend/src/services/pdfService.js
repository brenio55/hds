const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PdfService {
  static async generatePdf(propostaData) {
    try {
      console.log('Dados recebidos:', JSON.stringify(propostaData, null, 2));

      const templatePath = path.join(__dirname, '../templates/proposta.html');
      const template = await fs.readFile(templatePath, 'utf-8');

      // Tenta parsear cada campo individualmente com logs
      let clientInfo, especificacoes, afazerHds, afazerContratante, naoFazerHds;
      
      try {
        clientInfo = typeof propostaData.client_info === 'string' 
          ? JSON.parse(propostaData.client_info)
          : propostaData.client_info;
        console.log('clientInfo parseado:', clientInfo);
      } catch (e) {
        console.error('Erro ao parsear client_info:', e);
        console.error('client_info original:', propostaData.client_info);
        clientInfo = {};
      }

      try {
        const docText = propostaData.documento_text || '{}';
        console.log('documento_text bruto:', docText);
        const docParsed = JSON.parse(docText);
        console.log('documento_text parseado:', docParsed);
        especificacoes = docParsed;
      } catch (e) {
        console.error('Erro ao parsear documento_text:', e);
        especificacoes = {};
      }

      try {
        afazerHds = JSON.parse(propostaData.afazer_hds || '[]');
        console.log('afazerHds parseado:', afazerHds);
      } catch (e) {
        console.error('Erro ao parsear afazer_hds:', e);
        afazerHds = [];
      }

      try {
        afazerContratante = JSON.parse(propostaData.afazer_contratante || '[]');
        console.log('afazerContratante parseado:', afazerContratante);
      } catch (e) {
        console.error('Erro ao parsear afazer_contratante:', e);
        afazerContratante = [];
      }

      try {
        naoFazerHds = JSON.parse(propostaData.naofazer_hds || '[]');
        console.log('naoFazerHds parseado:', naoFazerHds);
      } catch (e) {
        console.error('Erro ao parsear naofazer_hds:', e);
        naoFazerHds = [];
      }

      // Converte a imagem para base64 (usando a mesma imagem para ambos)
      const logoPath = path.join(__dirname, '../imgs/logo_horizontal.png');
      
      const logoBase64 = await fs.readFile(logoPath, { encoding: 'base64' });

      // Formata os dados
      const data = {
        ...propostaData,
        ano: new Date().getFullYear(),
        dataEmissao: new Date(propostaData.data_emissao).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        clientInfo,
        especificacoes,
        afazerHds,
        afazerContratante,
        naoFazerHds,
        valorFinal: new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(propostaData.valor_final),
        logoSrc: `data:image/png;base64,${logoBase64}`,
        logoHorizontalSrc: `data:image/png;base64,${logoBase64}`
      };

      console.log('Dados formatados para template:', {
        ...data,
        clientInfo: data.clientInfo
      });

      // Compila o template
      const compiledTemplate = handlebars.compile(template);
      const html = compiledTemplate(data);

      // Configurações do Puppeteer para Docker
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
      });

      const page = await browser.newPage();
      await page.setContent(html);

      // Gera um UUID para o arquivo
      const uid = uuidv4();
      const pdfPath = path.join(__dirname, `../../uploads/pdfs/${uid}.pdf`);

      // Garante que o diretório existe
      await fs.mkdir(path.dirname(pdfPath), { recursive: true });

      // Gera o PDF
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      await browser.close();

      return uid;
    } catch (error) {
      console.error('Stack completo do erro:', error);
      if (error.code === 'ENOENT') {
        console.error('Arquivo de logo não encontrado. Verifique se a imagem existe em src/imgs/logo_horizontal.png');
      }
      throw new Error(`Erro ao gerar PDF: ${error.message}\nStack: ${error.stack}`);
    }
  }
}

module.exports = PdfService; 