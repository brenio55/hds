const handlebars = require('handlebars');

// Registra todos os helpers globais para uso nos templates PDF
function registerPdfHelpers() {
  // Helper para formatar datas
  handlebars.registerHelper('formatDate', (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  });

  // Helper para formatar valores monetários
  handlebars.registerHelper('formatMoney', (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  });

  // Helper para formatar percentuais
  handlebars.registerHelper('formatPercent', (value) => {
    if (!value && value !== 0) return '';
    return `${Number(value).toFixed(2)}%`;
  });

  // Helper para somar valores de objetos numéricos
  handlebars.registerHelper('sumNumericObjects', function(obj, field) {
    if (!obj) return 0;
    
    // Se for um array
    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
    }
    
    // Se for um objeto com chaves numéricas
    const numericKeys = Object.keys(obj).filter(key => !isNaN(key));
    return numericKeys.reduce((sum, key) => {
      const value = obj[key][field];
      return sum + (Number(value) || 0);
    }, 0);
  });

  // Helper para calcular média de valores de objetos numéricos
  handlebars.registerHelper('avgNumericObjects', function(obj, field) {
    if (!obj) return 0;
    
    // Se for um array
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 0;
      const sum = obj.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
      return sum / obj.length;
    }
    
    // Se for um objeto com chaves numéricas
    const numericKeys = Object.keys(obj).filter(key => !isNaN(key));
    if (numericKeys.length === 0) return 0;
    
    const sum = numericKeys.reduce((acc, key) => {
      const value = obj[key][field];
      return acc + (Number(value) || 0);
    }, 0);
    
    return sum / numericKeys.length;
  });

  // Helper para calcular o total final com IPI e desconto
  handlebars.registerHelper('total_final', function(total_bruto, ipi_percent, desconto_percent, frete, despesas_adicionais) {
    // Converte todos os valores para número, tratando nulos como 0
    const valorBruto = Number(total_bruto) || 0;
    const ipi = Number(ipi_percent) || 0;
    const desconto = Number(desconto_percent) || 0;
    const valorFrete = Number(frete) || 0;
    const valorDespesas = Number(despesas_adicionais) || 0;
    
    // Calcula o valor do IPI
    const valorIPI = valorBruto * (ipi / 100);
    
    // Soma produtos + IPI
    const valorComIPI = valorBruto + valorIPI;
    
    // Calcula o valor do desconto sobre (PRODUTOS + IPI)
    const valorDesconto = valorComIPI * (desconto / 100);
    
    // (PRODUTOS + IPI) - DESCONTO + OUTRAS DESPESAS + FRETE
    const total = (valorComIPI - valorDesconto) + valorDespesas + valorFrete;
    
    return total;
  });

  // Helper para somar múltiplos valores
  handlebars.registerHelper('sum', function(...args) {
    // Remove o último argumento que é o objeto do Handlebars
    const numbers = args.slice(0, -1);
    
    return numbers.reduce((total, num) => {
      // Converte para número e soma, tratando valores nulos/undefined como 0
      return total + (Number(num) || 0);
    }, 0);
  });

  // Helper para verificar igualdade
  handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Helper para obter o valor de uma propriedade do primeiro item
  handlebars.registerHelper('getFirstValue', function(obj, field) {
    if (!obj) return 0;
    
    // Se for um array
    if (Array.isArray(obj) && obj.length > 0) {
      return Number(obj[0][field]) || 0;
    }
    
    // Se for um objeto com chaves numéricas
    const numericKeys = Object.keys(obj).filter(key => !isNaN(key));
    if (numericKeys.length > 0) {
      const firstKey = numericKeys.sort((a, b) => Number(a) - Number(b))[0];
      return Number(obj[firstKey][field]) || 0;
    }
    
    return 0;
  });

  // Helper para obter o primeiro valor não zero de uma propriedade
  handlebars.registerHelper('getFirstNonZeroValue', function(obj, field) {
    if (!obj) return 0;
    
    // Se for um array
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const value = Number(item[field]) || 0;
        if (value > 0) return value;
      }
    }
    
    // Se for um objeto com chaves numéricas
    const numericKeys = Object.keys(obj).filter(key => !isNaN(key));
    for (const key of numericKeys.sort((a, b) => Number(a) - Number(b))) {
      const value = Number(obj[key][field]) || 0;
      if (value > 0) return value;
    }
    
    return 0;
  });

  // Helper para calcular o valor total do IPI em R$
  handlebars.registerHelper('calculateTotalValue', function(total_bruto, ipi_percent) {
    // Converte todos os valores para número, tratando nulos como 0
    const valorBruto = Number(total_bruto) || 0;
    const ipi = Number(ipi_percent) || 0;
    
    // Calcula o valor do IPI em reais
    return valorBruto * (ipi / 100);
  });

  // Helper para calcular o valor total do desconto em R$
  handlebars.registerHelper('calculateDiscountValue', function(total_bruto, ipi_percent, desconto_percent) {
    // Converte todos os valores para número, tratando nulos como 0
    const valorBruto = Number(total_bruto) || 0;
    const ipi = Number(ipi_percent) || 0;
    const desconto = Number(desconto_percent) || 0;
    
    // Calcula o valor do IPI
    const valorIPI = valorBruto * (ipi / 100);
    
    // Soma produtos + IPI
    const valorComIPI = valorBruto + valorIPI;
    
    // Calcula o valor do desconto sobre (PRODUTOS + IPI) em reais
    return valorComIPI * (desconto / 100);
  });
}

module.exports = {
  registerPdfHelpers
}; 