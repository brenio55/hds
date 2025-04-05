// AdminDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Importando o CSS
import HeaderAdmin from './HeaderAdmin';

function Dashboard(){
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <>
            <HeaderAdmin/>
            <div className="admin-container">
                <div className="services">
                    <div className="service-section">
                        <h2>Centros de Custo e Fornecedores</h2>
                        <div className="service-buttons">
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/gerarPropostas')}>Gerar Proposta (Centro de Custo)</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/consultarPropostas')}>Consultar Propostas (Centro de Custo)</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/cadastrarFornecedor')}>Cadastrar Fornecedor</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/consultarFornecedores')}>Consultar Fornecedores</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/cadastrarFuncionario')}>Cadastrar Funcionário</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/consultarFuncionarios')}>Consultar Funcionários</div>
                        </div>
                    </div>
                    <div className="service-section">
                        <h2>Gerenciamento de Pedidos</h2>
                        <div className="service-buttons"> 
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/pedidosDeMaterial')}>Gerar Pedido de Compra de Material</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/pedidosDeLocacao')}>Gerar Pedido de Locação</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/pedidosDeServico')}>Gerar Pedido de Serviço</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/admin/faturarPedido')}>Faturar Pedido de Compra</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/admin/consultarFaturamentos')}>Consultar Faturamentos</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/consultarPedidos')}>Consultar Pedidos C-L-S</div>
                            {/* <div className="serviceButton">HH</div> */}
                        </div>
                    </div>
                    <div className="service-section">
                        <h2>Financeiro - Registro e Consulta</h2>
                        <div className="service-buttons"> 
                            <div className="serviceButton">Relatório Geral de Centros de Custo</div>
                            <div className="serviceButton">Consultar Custo de Obra de Centro de Custo</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/rcAluguel')}>RC - Aluguel de Casas</div>
                            <div className="serviceButton working" onClick={() => handleNavigation('/admin/rcReembolso')}>RC - Reembolso Funcionário</div>
                        
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
