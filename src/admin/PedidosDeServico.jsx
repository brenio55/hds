import React, { useState, useEffect } from 'react';
import { formatCNPJ, formatCEP, formatTelefone } from '../utils/formatters';
import HeaderAdmin from './HeaderAdmin';
import './pedidos.scss';
import { salvarPedidoCompleto } from '../services/ApiService';

function PedidosDeServico() {
    // Mesmo código do PedidosDeMaterial.jsx, apenas alterando os títulos e textos
    const [itens, setItens] = useState([]);
    const [itemAtual, setItemAtual] = useState({
        item: '',
        descricao: '',
        unidade: '',
        quantidade: '',
        ipi: '',
        valorUnitario: '',
        valorTotal: '',
        desconto: '',
        previsaoEntrega: '',
    });
    // ... (mesmo código do estado)

    // ... (mesmas funções de manipulação)

    const handleGerarPedido = async () => {
        try {
            const totalBruto = calcularTotalBruto();
            const ipiTotal = calcularTotalIPI();
            const totalDescontos = calcularTotalDescontos();
            const totalFinal = calcularTotalFinal();

            const pedidoParaSalvar = {
                codigo: document.querySelector('[name="codigo"]').value,
                fornecedor: document.querySelector('[name="fornecedor"]').value,
                cnpj: cnpj,
                endereco: document.querySelector('[name="endereco"]').value,
                contato: contato,
                pedido: document.querySelector('[name="pedido"]').value,
                dataVencto: document.querySelector('[name="dataVencto"]').value,
                totalBruto,
                totalDescontos,
                valorFrete: dadosPedido.valorFrete,
                outrasDespesas: dadosPedido.outrasDespesas,
                totalFinal,
                previsaoEntrega: new Date().toISOString().split('T')[0]
            };

            const { numeroPedido } = await salvarPedidoCompleto(pedidoParaSalvar, itens);

            const formatarValorMonetario = (valor) => {
                if (!valor) return '0,00';
                return typeof valor === 'string' ? valor : valor.toString().replace('.', ',');
            };

            const formatarData = (data) => {
                if (!data) return '';
                const [ano, mes, dia] = data.split('-');
                return `${dia}/${mes}/${ano}`;
            };

            // Carregar a imagem como base64
            const logoResponse = await fetch('/docs/admin/LOGO.png');
            const logoBlob = await logoResponse.blob();
            const logoBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(logoBlob);
            });

            const response = await fetch('/docs/admin/pedidoDeCompraTemplateCode.html');
            let templateHtml = await response.text();

            // Substitui a referência da imagem no template com a versão base64
            templateHtml = templateHtml.replace(
                /<img[^>]*>/,
                `<img src="${logoBase64}" alt="Logo" class="logo" style="height: 80px;">`
            );

            // Substituir "Pedido de Compra" por "Pedido de Serviço"
            templateHtml = templateHtml.replace(/PEDIDO DE COMPRA/g, 'PEDIDO DE SERVIÇO');

            // Atualizar a tabela de detalhes do pedido
            const hoje = new Date();
            const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
            
            // Atualizar informações do cabeçalho
            templateHtml = templateHtml.replace(/<td>20000001<\/td>\s*<td>12\/12\/2024<\/td>\s*<td>1<\/td>/, 
                `<td>${numeroPedido}</td><td>${dataFormatada}</td><td>1</td>`);

            // Atualizar detalhes do pedido
            templateHtml = templateHtml.replace(
                /<td>12345<\/td>\s*<td>Fornecedor XYZ<\/td>\s*<td>00\.000\.000\/0000-00<\/td>\s*<td>Rua Exemplo, 123<\/td>\s*<td>12000-000<\/td>\s*<td>\(12\) 3456-7890<\/td>/,
                `<td>${document.querySelector('[name="codigo"]').value}</td>
                <td>${document.querySelector('[name="fornecedor"]').value}</td>
                <td>${cnpj}</td>
                <td>${document.querySelector('[name="endereco"]').value}</td>
                <td>${cep}</td>
                <td>${contato}</td>`
            );

            // Atualizar informações do pedido
            templateHtml = templateHtml.replace(
                /<td>001<\/td>\s*<td>01\/01\/2024<\/td>\s*<td>À vista<\/td>\s*<td>Financeiro<\/td>/,
                `<td>${document.querySelector('[name="pedido"]').value}</td>
                <td>${formatarData(document.querySelector('[name="dataVencto"]').value)}</td>
                <td>${dadosPedido.condPagto || 'N/A'}</td>
                <td>${document.querySelector('[name="centroCusto"]')?.value || 'N/A'}</td>`
            );

            // Atualizar totais
            templateHtml = templateHtml.replace(
                /<td>R\$ 100,00<\/td>[\s\S]*?<td>R\$ 50,00<\/td>[\s\S]*?<td>R\$ 30,00<\/td>[\s\S]*?<td>R\$ 1\.100,00<\/td>[\s\S]*?<td>R\$ 1\.080,00<\/td>/,
                `<td>R$ ${formatarValorMonetario(totalDescontos)}</td>
                <td>R$ ${formatarValorMonetario(dadosPedido.valorFrete)}</td>
                <td>R$ ${formatarValorMonetario(dadosPedido.outrasDespesas)}</td>
                <td>R$ ${formatarValorMonetario(totalBruto)}</td>
                <td>R$ ${formatarValorMonetario(totalFinal)}</td>`
            );

            // Atualizar data final de entrega
            templateHtml = templateHtml.replace(
                /<td>15\/01\/2024<\/td>/,
                `<td>${dadosPedido.prazoEntrega || 'A combinar'}</td>`
            );

            // Limpar a tabela de materiais existente e adicionar os novos itens
            const tabelaMateriais = itens.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.descricao}</td>
                    <td>${item.unidade}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${formatarValorMonetario(item.valorUnitario)}</td>
                    <td>R$ ${formatarValorMonetario(item.valorTotal)}</td>
                    <td>${item.ipi}%</td>
                    <td>${formatarData(item.previsaoEntrega)}</td>
                </tr>
            `).join('');

            templateHtml = templateHtml.replace(
                /<tr>\s*<td>1<\/td>[\s\S]*?<\/tr>\s*<tr>\s*<td>2<\/td>[\s\S]*?<\/tr>/,
                tabelaMateriais
            );

            // Atualizar dados adicionais
            templateHtml = templateHtml.replace(
                /<h2>Dados Adicionais<\/h2>\s*<table>\s*<tr>\s*<td><\/td>\s*<\/tr>\s*<\/table>/,
                `<h2>Dados Adicionais</h2>
                <table>
                    <tr>
                        <td>${dadosPedido.informacoesImportantes || 'Nenhuma informação adicional'}</td>
                    </tr>
                </table>`
            );

            // Atualizar informações de frete
            templateHtml = templateHtml.replace(
                /Frete \(  \) CIF     \(   \) FOB/,
                `Frete (${dadosPedido.frete === 'CIF' ? 'X' : '  '}) CIF     (${dadosPedido.frete === 'FOB' ? 'X' : '  '}) FOB`
            );

            // Criar o Blob e abrir em nova janela
            const blob = new Blob([templateHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao gerar pedido:', error);
            alert('Erro ao gerar pedido. Por favor, tente novamente.');
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="pedidos-container">
                <h2>Gerar Pedido de Serviço</h2>
                {/* Resto do JSX igual */}
            </div>
        </>
    );
}

export default PedidosDeServico; 