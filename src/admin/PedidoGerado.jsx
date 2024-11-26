import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderAdmin from './HeaderAdmin';

function PedidoGerado() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pdfUrl } = location.state || {};

    if (!pdfUrl) {
        return <div>Erro: PDF não encontrado</div>;
    }

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'pedido-de-compra.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    console.log('Estado recebido:', location.state);
    console.log('PDF URL na página de preview:', pdfUrl);

    return (
        <>
            <HeaderAdmin />
            <div className="pedido-gerado-container">
                <h1>Pedido de Compra Gerado</h1>
                
                <div className="pdf-preview">
                    <embed 
                        src={pdfUrl}
                        type="application/pdf"
                        width="1400px"
                        height="800px"
                    />
                </div>

                <div className="acoes-container">
                    <button onClick={handleDownload}>
                        Baixar PDF
                    </button>
                    <button onClick={() => navigate('/pedidosDeCompra')}>
                        Novo Pedido
                    </button>
                </div>
            </div>
        </>
    );
}

export default PedidoGerado; 