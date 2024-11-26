export const formatCNPJ = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara do CNPJ: XX.XXX.XXX/XXXX-XX
    return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatCEP = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara do CEP: XXXXX-XXX
    return numbers
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
};

export const formatTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    
    // Verifica se é celular (9 dígitos) ou fixo (8 dígitos)
    if (numbers.length <= 10) {
        // Telefone fixo: (XX) XXXX-XXXX
        return numbers
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    } else {
        // Celular: (XX) X XXXX-XXXX
        return numbers
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{1})(\d{4})(\d)/, '$1 $2-$3')
            .replace(/(-\d{4})\d+?$/, '$1');
    }
}; 