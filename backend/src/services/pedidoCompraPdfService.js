const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { registerPdfHelpers } = require('./pdfHelpers');

class PedidoCompraPdfService {
  static async imageToBase64(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/png';
      return `data:${mimeType};base64,${base64Image}`;
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      throw error;
    }
  }

  static async generatePdf(pedidoData, propostaData, fornecedorData) {
    try {
      console.log('Dados recebidos:', JSON.stringify(pedidoData, null, 2));

      // Buscar informações da proposta
      let descricaoProposta = '';
      if (pedidoData.proposta_id) {
        try {
          const propostaResult = await db.query(
            'SELECT descricao FROM propostas WHERE id = $1',
            [pedidoData.proposta_id]
          );
          if (propostaResult.rows.length > 0) {
            descricaoProposta = propostaResult.rows[0].descricao;
          }
        } catch (error) {
          console.error('Erro ao buscar proposta:', error);
        }
      }

      const templatePath = path.join(__dirname, '../templates/pedido_compra1.html');
      const template = await fs.readFile(templatePath, 'utf-8');

      // Converter logo para base64
      const logoPath = path.join(__dirname, '../imgs/logo_horizontal.png');
      const logoBase64 = await this.imageToBase64(logoPath);

      // Registra os helpers globais
      registerPdfHelpers();

      // Calcular total bruto
      const totalBruto = pedidoData.materiais.reduce((acc, item) => acc + Number(item.valor_total || 0), 0);

      // Calcular IPI total
      const totalIPI = pedidoData.materiais.reduce((acc, item) => {
        const valorTotal = Number(item.valor_total || 0);
        const ipi = Number(item.ipi || 0);
        return acc + (valorTotal * ipi / 100);
      }, 0);

      // Valor com IPI
      const valorComIPI = totalBruto + totalIPI;

      // Calcular desconto total (agora sobre PRODUTOS + IPI)
      const descontoTotal = pedidoData.materiais.reduce((acc, item) => {
        const valorTotal = Number(item.valor_total || 0);
        const ipi = Number(item.ipi || 0);
        const valorIPI = valorTotal * ipi / 100;
        const desconto = Number(item.desconto || 0);
        return acc + ((valorTotal + valorIPI) * desconto / 100);
      }, 0);

      // Frete e despesas adicionais
      const valorFrete = parseFloat(pedidoData.valor_frete || 0);
      const despesasAdicionais = parseFloat(pedidoData.despesas_adicionais || 0);

      // Ajustar o cálculo do total final usando a nova fórmula
      // (PRODUTOS + IPI) + OUTRAS DESPESAS + FRETE - DESCONTO
      const totalFinal = valorComIPI + despesasAdicionais + valorFrete - descontoTotal;

      // Encontrar a data de entrega mais distante
      const dataEntregaMaisDistante = pedidoData.materiais.reduce((maxDate, item) => {
        const itemDate = new Date(item.data_entrega);
        return itemDate > maxDate ? itemDate : maxDate;
      }, new Date(0));

      // Processar endereço do fornecedor
      const enderecoCompleto = fornecedorData.endereco || '';
      const [endereco = '', bairro = ''] = enderecoCompleto.split(' - ');
      const [cidade = '', uf = ''] = (fornecedorData.municipio_uf || '').split('-').map(s => s.trim());

      // Ajustar os dados incluindo a descrição da proposta
      const data = {
        logoSrc: logoBase64,
        pedidoData: {
          ...pedidoData,
          centro_custo: descricaoProposta || 'Não especificado'
        },
        descricao: propostaData.descricao,
        dataEmissao: new Date(pedidoData.created_at).toLocaleDateString('pt-BR'),
        fornecedor: {
          ...fornecedorData,
          endereco: endereco.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          uf: uf.trim()
        },
        clientInfo: {
          razao_social: "Hds Serviço Ltda",
          cnpj: "40.931.075/0001-00",
          inscricao_estadual: "688.578.880.111",
          inscricao_municipal: "000000000091587",
          endereco: "Av Dom Pedro I, 242",
          bairro: "Campos Eliseos",
          cidade: "Taubaté",
          uf: "SP"
        },
        totalBruto: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalBruto),
        desconto: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(pedidoData.desconto || 0),
        frete: {
          tipo: pedidoData.frete?.tipo || 'CIF',
          valor: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(pedidoData.valor_frete || 0)
        },
        despesas_adicionais: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(pedidoData.despesas_adicionais || 0),
        totalFinal: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalFinal),
        dataEntregaMaisDistante: new Date(dataEntregaMaisDistante).toLocaleDateString('pt-BR'),
        dados_adicionais: pedidoData.dados_adicionais || ''
      };

      console.log('Dados formatados para template:', data);

      // Compila o template
      const compiledTemplate = handlebars.compile(template);
      const html = compiledTemplate(data);

      // Configurações do Puppeteer
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
      
      // Configurar viewport para A3 com largura aumentada
      await page.setViewport({
        width: 1400,  // Aumentada a largura para melhor comportar o conteúdo
        height: 1587, // A3 height aproximado em pixels (420mm)
        deviceScaleFactor: 1
      });
      
      await page.setContent(html);

      // Gera um UUID para o arquivo
      const uid = uuidv4();
      const pdfDir = path.join(__dirname, '../../uploads/pdfs');
      await fs.mkdir(pdfDir, { recursive: true });

      const pdfPath = path.join(pdfDir, `${uid}.pdf`);

      // Gera o PDF com configurações A3 e margens mínimas
      await page.pdf({
        path: pdfPath,
        format: 'A3',
        landscape: false,
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

module.exports = PedidoCompraPdfService;
