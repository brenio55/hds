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
                            <div className="serviceButton" onClick={() => handleNavigation('/gerarPropostas')}>Gerar Proposta (Centro de Custo)</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/consultarPropostas')}>Consultar Propostas (Centro de Custo)</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/cadastrarFornecedor')}>Cadastrar Fornecedor</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/consultarFornecedores')}>Consultar Fornecedores</div>
                        </div>
                    </div>
                    <div className="service-section">
                        <h2>Gerenciamento de Pedidos</h2>
                        <div className="service-buttons"> 
                            <div className="serviceButton" onClick={() => handleNavigation('/pedidosDeMaterial')}>Gerar Pedido de Compra de Material</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/pedidosDeLocacao')}>Gerar Pedido de Locação</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/pedidosDeServico')}>Gerar Pedido de Serviço</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/faturarPedido')}>Faturar Pedido de Compra</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/consultarFaturamentos')}>Consultar Faturamentos</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/consultarPedidos')}>Consultar Pedidos C-L-S</div>
                            <div className="serviceButton">HH</div>
                        </div>
                    </div>
                    <div className="service-section">
                        <h2>Financeiro - Registro e Consulta</h2>
                        <div className="service-buttons"> 
                            <div className="serviceButton">Relatório Geral de Centros de Custo</div>
                            <div className="serviceButton">Consultar Custo de Obra de Centro de Custo</div>
                            <div className="serviceButton">RC - Aluguel de Casas</div>
                            <div className="serviceButton" onClick={() => handleNavigation('/rcReembolso')}>RC - Reembolso Funcionário</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
