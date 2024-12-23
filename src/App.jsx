import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import UserHome from './UserHome';

import './css/style.css';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import PedidosDeCompra from './admin/PedidosDeCompra';
// import PedidoGerado from './admin/PedidoGerado';
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
          {/* <Route path="/pedido-gerado" element={<PedidoGerado />} /> */}
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  )
}

export default App
