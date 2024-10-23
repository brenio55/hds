import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import UserHome from './UserHome';

import './css/style.css';
import Login from './admin/Login';


function App() {

  return (
    <>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserHome></UserHome>}></Route>
          <Route path="/login" element={<Login></Login>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
