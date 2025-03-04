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
import { AdminProvider } from './contexts/AdminContext';


function App() {

  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/pedidosDeCompra" element={<PedidosDeCompra />} /> */}
          <Route path="/pedidosDeMaterial" element={<PedidosDeMaterial />} />
          <Route path="/pedidosDeLocacao" element={<PedidosDeLocacao />} />
          <Route path="/pedidosDeServico" element={<PedidosDeServico />} />
          <Route path="/gerarPropostas" element={<GerarPropostas />} />
          <Route path="/consultarPropostas" element={<ConsultarPropostas />} />
          <Route path="/consultarPedidos" element={<ConsultarPedidos />} />
          <Route path="/consultarFornecedores" element={<ConsultarFornecedores />} />
          <Route path="/cadastrarFornecedor" element={<CadastrarFornecedor />} />
          <Route path="/editarFornecedor/:id" element={<EditarFornecedor />} />
          <Route path="/visualizarFornecedor/:id" element={<VisualizarFornecedor />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  )
}

export default App
