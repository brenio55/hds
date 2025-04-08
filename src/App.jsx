import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import UserHome from './UserHome';

import './css/style.css';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
// import PedidosDeCompra from './admin/PedidosDeCompra';
import PedidosDeMaterial from './admin/PedidosDeMaterial';
import PedidosDeLocacao from './admin/PedidosDeLocacao';
import PedidosDeServico from './admin/PedidosDeServico';
import GerarPropostas from './admin/GerarPropostas';
import ConsultarPropostas from './admin/ConsultarPropostas';
import ConsultarPedidos from './admin/ConsultarPedidos';
import ConsultarFornecedores from './admin/ConsultarFornecedores';
import CadastrarFornecedor from './admin/CadastrarFornecedor';
import EditarFornecedor from './admin/EditarFornecedor';
import VisualizarFornecedor from './admin/VisualizarFornecedor';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import FaturarPedido from './admin/GerenciamentoDePedidos/FaturarPedido';
import ConsultarFaturamentos from './admin/GerenciamentoDePedidos/ConsultarFaturamentos';
import RCReembolso from './admin/Financeiro/RCReembolso';
import RCAluguel from './admin/Financeiro/RCAluguel';
import ConsultarCentroCusto from './admin/Financeiro/ConsultarCentroCusto';
import CadastrarFuncionario from './admin/CadastrarFuncionario';
import ConsultarFuncionarios from './admin/ConsultarFuncionarios';

function AppRoutes() {
  const { adminUser } = useAdmin();
  console.log('Estado do usuário admin:', adminUser);
  
  if (adminUser) {
    return (
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
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
