import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/style.css';
import Header from './commonComponents/Header';
import MainBanner from './mainComponents/MainBanner';
import AboutUs from './mainComponents/AboutUs';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
      <MainBanner></MainBanner>
      <AboutUs></AboutUs>
    </>
  )
}

export default App
