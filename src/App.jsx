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

import Aos from 'aos';
import 'aos/dist/aos.css';

function App() {
  const [count, setCount] = useState(0)

  Aos.init({
      // Global settings:
      disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
      startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
      initClassName: 'aos-init', // class applied after initialization
      animatedClassName: 'aos-animate', // class applied on animation
      useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
      disableMutationObserver: false, // disables automatic mutations' detections (advanced)
      debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
      throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)
      

      // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
      offset: 10, // offset (in px) from the original trigger point
      delay: 0, // values from 0 to 3000, with step 50ms
      duration: 800, // values from 0 to 3000, with step 50ms
      easing: 'ease', // default easing for AOS animations
      once: false, // whether animation should happen only once - while scrolling down
      mirror: false, // whether elements should animate out while scrolling past them
      anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

  });

  return (
    <>
      <div data-aos="fade-right">
      <Header></Header>    
      
      <MainBanner></MainBanner>
      </div>
      <div data-aos="fade-up">
      <AboutUs></AboutUs>
      </div>
      <div data-aos="fade-up">
      <Services></Services>
      </div>
      <div data-aos="fade-up">
      <ContactUs></ContactUs>
      </div>
      <div data-aos="fade-up">
      <Footer></Footer>
      </div>
    </>
  )
}

export default App
