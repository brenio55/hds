import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderAdmin from './HeaderAdmin';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function PedidoGerado() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pedidoData, excelUrl } = location.state || {};
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPDF = async () => {
            try {
                const response = await fetch(excelUrl);
                const blob = await response.blob();
                const pdfUrl = URL.createObjectURL(blob);
                
                const container = document.getElementById('excel-preview');
                if (container) {
                    const iframe = document.createElement('iframe');
                    iframe.src = pdfUrl;
                    iframe.style.width = '100%';
                    iframe.style.height = '800px';
                    iframe.style.border = 'none';
                    
                    container.innerHTML = '';
                    container.appendChild(iframe);
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar PDF:', error);
                setLoading(false);
            }
        };

        if (excelUrl) {
            loadPDF();
        }
    }, [excelUrl]);

    const handleDownload = async () => {
        try {
            const element = document.getElementById('excel-preview');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: true
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            pdf.save('pedido-de-compra.pdf');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF. Por favor, tente novamente.');
        }
    };

    return (
        <>
            <HeaderAdmin />
            <div className="pedido-gerado-container">
                <h1>Pedido de Compra Gerado</h1>
                
                {loading ? (
                    <div>Carregando...</div>
                ) : (
                    <>
                        <div id="excel-preview" className="excel-preview"></div>
                        <div className="acoes-container">
                            <button onClick={handleDownload}>Baixar PDF</button>
                            <button onClick={() => navigate('/pedidosDeCompra')}>
                                Novo Pedido
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default PedidoGerado; 