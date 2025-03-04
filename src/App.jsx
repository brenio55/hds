import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import UserHome from './UserHome';

import './css/style.css';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import PedidosDeCompra from './admin/PedidosDeCompra';
import PedidosDeMaterial from './admin/PedidosDeMaterial';
import PedidosDeLocacao from './admin/PedidosDeLocacao';
import PedidosDeServico from './admin/PedidosDeServico';
import GerarPropostas from './admin/GerarPropostas';
import ConsultarPropostas from './admin/ConsultarPropostas';
import { AdminProvider } from './contexts/AdminContext';


function App() {

  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pedidosDeCompra" element={<PedidosDeCompra />} />
          <Route path="/pedidosDeMaterial" element={<PedidosDeMaterial />} />
          <Route path="/pedidosDeLocacao" element={<PedidosDeLocacao />} />
          <Route path="/pedidosDeServico" element={<PedidosDeServico />} />
          <Route path="/gerarPropostas" element={<GerarPropostas />} />
          <Route path="/consultarPropostas" element={<ConsultarPropostas />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  )
}

export default App
