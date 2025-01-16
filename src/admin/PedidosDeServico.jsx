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
            // ... (mesmo código até o template)

            const response = await fetch('/docs/admin/pedidoDeCompraTemplateCode.html');
            let templateHtml = await response.text();

            // Substitui a referência da imagem no template com o caminho correto
            templateHtml = templateHtml.replace(
                /<img[^>]*>/,
                `<img src="/docs/admin/LOGO.png" alt="Logo" class="logo" style="height: 80px;">`
            );

            // Substituir "Pedido de Compra" por "Pedido de Serviço"
            templateHtml = templateHtml.replace(/Pedido de Compra/g, 'Pedido de Serviço');

            // ... (resto do código igual)
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