import { PDFDocument, rgb } from 'pdf-lib';

export async function gerarPedidoCompra(dadosPedido) {
    try {
        console.log('Dados recebidos no pdfHandler:', {
            dadosPedido,
            totais: {
                descontos: dadosPedido.descontos,
                valorFrete: dadosPedido.valorFrete,
                outrasDespesas: dadosPedido.outrasDespesas,
                totalBruto: dadosPedido.totalBruto,
                totalFinal: dadosPedido.totalFinal
            }
        });
        
        let template = await fetch('/docs/admin/pedidoDeCompraTemplateCode.html').then(r => r.text());
        
        // Dados fixos da contratante
        const dadosContratante = {
            nome: 'Hds Serviço Ltda',
            cnpj: '40.931.075/0001-00',
            inscricaoEstadual: '688.578.880.111',
            inscricaoMunicipal: '000000000091587',
            endereco: 'Av Dom Pedro I, 242 Campos Eliseos',
            cidade: 'Taubaté',
            uf: 'SP'
        };

        // Mantém os dados da contratante fixos
        template = template.replace(
            /<div class="contratante">([\s\S]*?)<\/div>/,
            `<div class="contratante">
                <h3>Contratante</h3>
                <table>
                    <tbody>
                        <tr>
                            <th>Nome</th>
                            <td>${dadosContratante.nome}</td>
                        </tr>
                        <tr>
                            <th>CNPJ</th>
                            <td>${dadosContratante.cnpj}</td>
                        </tr>
                        <tr>
                            <th>Inscrição Estadual</th>
                            <td>${dadosContratante.inscricaoEstadual}</td>
                        </tr>
                        <tr>
                            <th>Inscrição Municipal</th>
                            <td>${dadosContratante.inscricaoMunicipal}</td>
                        </tr>
                        <tr>
                            <th>Endereço</th>
                            <td>${dadosContratante.endereco}</td>
                        </tr>
                        <tr>
                            <th>Cidade/UF</th>
                            <td>${dadosContratante.cidade}/${dadosContratante.uf}</td>
                        </tr>
                    </tbody>
                </table>
            </div>`
        );

        // Substitui os dados da contratada (fornecedor)
        template = template.replace(
            /<div class="contratada">([\s\S]*?)<\/div>/,
            `<div class="contratada">
                <h3>Contratada</h3>
                <table>
                    <tbody>
                        <tr>
                            <th>Nome</th>
                            <td>${dadosPedido.fornecedor}</td>
                        </tr>
                        <tr>
                            <th>CNPJ</th>
                            <td>${dadosPedido.cnpj}</td>
                        </tr>
                        <tr>
                            <th>Endereço</th>
                            <td>${dadosPedido.endereco}</td>
                        </tr>
                        <tr>
                            <th>CEP</th>
                            <td>${dadosPedido.cep}</td>
                        </tr>
                        <tr>
                            <th>Contato</th>
                            <td>${dadosPedido.contato}</td>
                        </tr>
                    </tbody>
                </table>
            </div>`
        );

        // Gera a tabela de itens dinamicamente
        const itensHTML = (dadosPedido.itens || []).map(item => `
            <tr>
                <td>${item.descricao || ''}</td>
                <td>${item.unidade || ''}</td>
                <td>${item.quantidade || ''}</td>
                <td>R$ ${item.valorUnitario || ''}</td>
                <td>R$ ${item.valorTotal || ''}</td>
                <td>${item.ipi || ''}%</td>
                <td>${item.previsaoEntrega || ''}</td>
            </tr>
        `).join('');

        // Substitui a tabela de exemplo por itens reais
        template = template.replace(
            /<tr>\s*<td>Material A<\/td>[\s\S]*?<\/tr>\s*<tr>\s*<td>Material B<\/td>[\s\S]*?<\/tr>/, 
            itensHTML
        );

        // Substitui os valores dos totais
        template = template.replace(
            /<tr>\s*<th>Descontos<\/th>\s*<td>R\$ 100,00<\/td><\/tr>/,
            `<tr><th>Descontos</th><td>R$ ${dadosPedido.descontos || '0,00'}</td></tr>`
        );

        template = template.replace(
            /<tr>\s*<th>Frete<\/th>\s*<td>R\$ 50,00<\/td><\/tr>/,
            `<tr><th>Frete</th><td>R$ ${dadosPedido.valorFrete || '0,00'}</td></tr>`
        );

        template = template.replace(
            /<tr>\s*<th>Outras Despesas<\/th>\s*<td>R\$ 30,00<\/td><\/tr>/,
            `<tr><th>Outras Despesas</th><td>R$ ${dadosPedido.outrasDespesas || '0,00'}</td></tr>`
        );

        template = template.replace(
            /<tr>\s*<th>Total Bruto<\/th>\s*<td>R\$ 1.100,00<\/td><\/tr>/,
            `<tr><th>Total Bruto</th><td>R$ ${dadosPedido.totalBruto || '0,00'}</td></tr>`
        );

        template = template.replace(
            /<tr>\s*<th>Total Final<\/th>\s*<td>R\$ 1.080,00<\/td><\/tr>/,
            `<tr><th>Total Final</th><td>R$ ${dadosPedido.totalFinal || '0,00'}</td></tr>`
        );

        // Substitui as informações importantes
        if (dadosPedido.informacoesImportantes) {
            template = template.replace(
                /<h2>Descrição dos Materiais<\/h2>/,
                `<h2>Descrição dos Materiais</h2>
                <div class="informacoes-importantes">
                    <h3>Informações Importantes para o Fornecedor</h3>
                    <p>${dadosPedido.informacoesImportantes}</p>
                </div>`
            );
        }

        return template;
    } catch (error) {
        console.error('Erro ao gerar pedido:', error);
        throw error;
    }
} 