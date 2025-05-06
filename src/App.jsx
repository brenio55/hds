import { useEffect  } from 'react'
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom'
import UserHome from './UserHome';

import './css/style.css';
import './App.css';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import DashboardOptimzed from './admin/DashboardOptimzed';

import PedidosDeMaterial from './admin/GerenciamentoDePedidos/Pedidos/Material/PedidosDeMaterial';
import PedidosDeLocacao from './admin/GerenciamentoDePedidos/Pedidos/Locacao/PedidosDeLocacao';
import PedidosDeServico from './admin/GerenciamentoDePedidos/Pedidos/Servico/PedidosDeServico';
import ConsultarPedidos from './admin/GerenciamentoDePedidos/Pedidos/Consulta/ConsultarPedidos';

import GerarPropostas from './admin/GerenciamentoDePedidos/Propostas/GerarPropostas';
import ConsultarPropostas from './admin/GerenciamentoDePedidos/Propostas/ConsultarPropostas';

import ConsultarFornecedores from './admin/GerenciamentoDePedidos/Fornecedores/ConsultarFornecedores';
import CadastrarFornecedor from './admin/GerenciamentoDePedidos/Fornecedores/CadastrarFornecedor';
import EditarFornecedor from './admin/GerenciamentoDePedidos/Fornecedores/EditarFornecedor';
import VisualizarFornecedor from './admin/GerenciamentoDePedidos/Fornecedores/VisualizarFornecedor';

import { AdminProvider, useAdmin } from './contexts/AdminContext';
import FaturarPedido from './admin/GerenciamentoDePedidos/Faturamento/FaturarPedido';
import ConsultarFaturamentos from './admin/GerenciamentoDePedidos/Faturamento/ConsultarFaturamentos';
import RCReembolso from './admin/Financeiro/RCReembolso';
import RCAluguel from './admin/Financeiro/RCAluguel';
import ConsultarCentroCusto from './admin/Financeiro/ConsultarCentroCusto';
import CadastrarFuncionario from './admin/RH/CadastrarFuncionario';
import ConsultarFuncionarios from './admin/RH/ConsultarFuncionarios';
import CadastrarCargo from './admin/RH/CadastrarCargo';
import ConsultarCargos from './admin/RH/ConsultarCargos';
import HH from './admin/RH/HH';

function AppRoutes() {
  const { adminUser } = useAdmin();
  console.log('Estado do usuário admin:', adminUser);

  let html;
  let h2;
  let header;
  const reactRouterLocation = useLocation();

  useEffect(() => {
    
    html = document.querySelector('html');
    h2 = document.querySelectorAll('h2');
    header = document.querySelector('header');
    
    if (reactRouterLocation.pathname.includes('admin')) {
      html.setAttribute('data-theme', 'dark');
      // header.style.backgroundColor = 'unset';
    }
    if(!reactRouterLocation.pathname.includes('admin')){
      html.style.backgroundColor = '#f0f0f0';
      // header.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
      html.style.color = '#000';
      html.setAttribute('data-theme', 'light');

      h2.forEach( (element) => {
        element.style.fontWeight = 'bold';
      });
    }

    if(reactRouterLocation.pathname.includes('admin') && !reactRouterLocation.pathname.includes('dashboardoptimzed')){
      html.setAttribute('data-theme', 'dark');
    }

    if(reactRouterLocation.pathname.includes('admin') && 
    !reactRouterLocation.pathname.includes('hh') && 
    !reactRouterLocation.pathname.includes('dashboardoptimzed')){
      html.setAttribute('data-theme', 'light');
    }
  }, [reactRouterLocation]);
  
  if (adminUser) {
    return (
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />

        <Route path="/admin/dashboardOptimzed" element={<DashboardOptimzed />} />
        <Route path="/admin/hh" element={<HH />} />

        {/* <Route path="/pedidosDeCompra" element={<PedidosDeCompra />} /> */}
        <Route path="/admin/pedidosDeMaterial" element={<PedidosDeMaterial />} />
        <Route path="/admin/pedidosDeLocacao" element={<PedidosDeLocacao />} />
        <Route path="/admin/pedidosDeServico" element={<PedidosDeServico />} />
        <Route path="/admin/gerarPropostas" element={<GerarPropostas />} />
        <Route path="/admin/consultarPropostas" element={<ConsultarPropostas />} />
        <Route path="/admin/consultarPedidos" element={<ConsultarPedidos />} />
        <Route path="/admin/consultarFornecedores" element={<ConsultarFornecedores />} />
        <Route path="/admin/cadastrarFornecedor" element={<CadastrarFornecedor />} />
        <Route path="/admin/editarFornecedor/:id" element={<EditarFornecedor />} />
        <Route path="/admin/visualizarFornecedor/:id" element={<VisualizarFornecedor />} />
        <Route path="/admin/faturarPedido" element={<FaturarPedido />} />
        <Route path="/admin/consultarFaturamentos" element={<ConsultarFaturamentos />} />
        <Route path="/admin/rcReembolso" element={<RCReembolso />} />
        <Route path="/admin/rcAluguel" element={<RCAluguel />} />
        <Route path="/admin/consultarCentroCusto" element={<ConsultarCentroCusto />} />
        <Route path="/admin/cadastrarFuncionario" element={<CadastrarFuncionario />} />
        <Route path="/admin/consultarFuncionarios" element={<ConsultarFuncionarios />} />
        <Route path="/admin/cadastrarCargo" element={<CadastrarCargo />} />
        <Route path="/admin/consultarCargos" element={<ConsultarCargos />} />
      </Routes>
    );
  } else {
    return (
      <Routes>
        <Route path="/admin/*" element={<Login />} />
        <Route path="/" element={<UserHome />} />
      </Routes>
    );
  }
}

function App() {


  return (
    <AdminProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AdminProvider>
  );
}

export default App
