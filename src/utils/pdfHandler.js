import { PDFDocument, rgb } from 'pdf-lib';

export async function gerarPedidoCompra(dadosPedido, itens) {
    try {
        // Carrega o template HTML
        const response = await fetch('/docs/admin/pedidoDeCompraTemplateCode.html');
        let template = await response.text();

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
        const itensHTML = itens.map(item => `
            <tr>
                <td>${item.descricao}</td>
                <td>${item.unidade}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.valorUnitario}</td>
                <td>R$ ${item.valorTotal}</td>
                <td>${item.ipi}%</td>
                <td>${item.previsaoEntrega}</td>
            </tr>
        `).join('');

        // Substitui a tabela de exemplo por itens reais
        template = template.replace(
            /<tr>\s*<td>Material A<\/td>[\s\S]*?<\/tr>\s*<tr>\s*<td>Material B<\/td>[\s\S]*?<\/tr>/, 
            itensHTML
        );

        return template;
    } catch (error) {
        console.error('Erro ao gerar pedido:', error);
        throw error;
    }
} 