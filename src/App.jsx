import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/style.css';
import Header from './commonComponents/Header';
import MainBanner from './mainComponents/MainBanner';
import AboutUs from './mainComponents/AboutUs';
import Services from './mainComponents/Services';
import ContactUs from './mainComponents/ContactUs';
import Footer from './commonComponents/Footer';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
      <MainBanner></MainBanner>
      <AboutUs></AboutUs>
      <Services></Services>
      <ContactUs></ContactUs>
      <Footer></Footer>
    </>
  )
}

export default App
