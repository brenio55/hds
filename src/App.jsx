import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/style.css';
import Header from './commonComponents/Header';
import MainBanner from './mainComponents/MainBanner';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
      <MainBanner></MainBanner>
    </>
  )
}

export default App
