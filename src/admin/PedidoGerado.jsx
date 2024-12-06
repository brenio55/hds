import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Document, Page, PDFViewer } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import ReactDOM from 'react-dom';
import HeaderAdmin from './HeaderAdmin';
import './PedidoGerado.css';

function PedidoGerado() {
    const pedidoRef = useRef(null);
    const location = useLocation();
    const { pedidoData, htmlContent } = location.state || {};

    useEffect(() => {
        if (htmlContent) {
            pedidoRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        try {
            const MyDocument = () => (
                <Document>
                    <Page size="A4">
                        <Html>{htmlContent}</Html>
                    </Page>
                </Document>
            );

            const container = document.createElement('div');
            container.id = 'pdf-viewer';
            document.body.appendChild(container);

            ReactDOM.render(
                <PDFViewer width="100%" height="100%" showToolbar={true}>
                    <MyDocument />
                </PDFViewer>,
                container
            );
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF. Por favor, tente novamente.');
        }
    };

    if (!htmlContent) {
        return <div>Erro: Conteúdo não encontrado</div>;
    }

    return (
        <>
            <HeaderAdmin />
            <div className="pedido-container">
                <div className="acoes-container">
                    <h3>Ações</h3>
                    <div className="buttons-container">
                        <button onClick={handlePrint}>Imprimir</button>
                        <button onClick={handleExportPDF}>Exportar PDF</button>
                    </div>
                </div>
                <div ref={pedidoRef} className="pedido-content">
                    {/* O conteúdo HTML será injetado aqui */}
                </div>
            </div>
        </>
    );
}

export default PedidoGerado; 