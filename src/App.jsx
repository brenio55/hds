import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import UserHome from './UserHome';

import './css/style.css';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import PedidosDeCompra from './admin/pedidosDeCompra';


function App() {

  return (
    <>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserHome></UserHome>}></Route>
          <Route path="/login" element={<Login></Login>}></Route>
          <Route path="/Dashboard" element={<Dashboard />}></Route>
          <Route path="/PedidosDeCompra" element={<PedidosDeCompra />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
