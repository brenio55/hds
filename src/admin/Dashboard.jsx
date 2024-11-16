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
                    <div className="service-card" onClick={() => handleNavigation('/usuarios')}>
                        <h2>Gerenciar Usuários</h2>
                        <p>Controle e modifique informações dos usuários cadastrados.</p>
                    </div>

                    <div className="service-card" onClick={() => handleNavigation('/produtos')}>
                        <h2>Preencher Pedido de Compra de Material</h2>
                        <p>Preencha e imprima um Pedido de Compra de Material</p>
                    </div>

                    <div className="service-card" onClick={() => handleNavigation('/produtos')}>
                        <h2>Preencher Pedido de Compra de Serviço</h2>
                        <p>Preencha e imprima um Pedido de Compra de Serviço</p>
                    </div>

                    <div className="service-card" onClick={() => handleNavigation('/relatorios')}>
                        <h2>Relatórios</h2>
                        <p>Busque Pedidos de Compra de Material e Serviço, verifique relatórios sobre acessos de usuários, dentre outros</p>
                    </div>
                </div>
            </div>
        </>
        
    );
};

export default Dashboard;
