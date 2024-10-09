import { Swiper, SwiperSlide } from "swiper/react"
import Slide from "./singleComponents/Slide";
import SlidePartners from "./singleComponents/SlidePartners";

import 'swiper/css';
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import { EffectCoverflow, Navigation } from "swiper/modules";

function Services(){
    return (
        <>
        <section className="services" id="services">
            <div className="titleTop">
                <img src="/img/servicesMountainTop.svg" alt="" />
                <div className="absolute">                
                    <h2>SERVIÇOS</h2>
                </div>
                <img src="/img/servicesMountainBottom.svg" alt="" />
            </div>
            
            <div className="mainSlideWorks">
                <span className="lineRed"></span>
                <span className="lineBlack"></span>
                <h4><strong className="redColor">Veja</strong> alguns dos nossos serviços que prestamos anteriormente no nosso slide logo abaixo!</h4>
                <div data-aos="fade-right">
                    <Swiper
                        effect={'coverflow'}
                        modules={[EffectCoverflow, Navigation]}
                        
                        coverflowEffect={{
                            rotate: 20,
                            stretch: 0,
                            depth: 150,
                            modifier: 1,
                            slideShadows: false,
                        }}

                        navigation

                        centeredSlides

                        grabCursor={true}
                        pagination={false}
                        slidesPerView={2}
                        className="SwiperMainComponent"
                        autoplay
                    >
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/dataCenterSP.jpg" 
                                titleSlide="Data-Center - Paulínia / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/dataCenterSP2.jpg" 
                                titleSlide="Data-Center 2 - Paulínia / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/DataCenterSP3.jpg" 
                                titleSlide="Data-Center 3 - Paulínia / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/MaxAtacadistaTaubateS3.jpg" 
                                titleSlide="Max Atacadista - Taubaté / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/MaxAtacadistaTaubateSP.jpg" 
                                titleSlide="Max Atacadista 2 - Taubaté / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/MaxAtacadistaTaubateSP2.jpg" 
                                titleSlide="Max Atacadista 3 - Taubaté / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/MaxAtacadistaTaubateSP3.jpg" 
                                titleSlide="Max Atacadista 4 - Taubaté / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/SuzanoLimeiraSP.jpg" 
                                titleSlide="Suzano - Limeira / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/SuzanoLimeiraSP2.jpg" 
                                titleSlide="Suzano - Limeira / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/YaraCubataoSP.jpg" 
                                titleSlide="Yara - Cubatão / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/YaraCubataoSP2.jpg" 
                                titleSlide="Yara - Cubatão / SP 2"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/interno1.jpg" 
                                titleSlide="Trabalho Interno 1"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/interno2.jpg" 
                                titleSlide="Trabalho Interno 2"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                    imgSrc="/img/services/interno3.jpg" 
                                titleSlide="Trabalho Interno 3"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/AmbevPiraiRJ1.jpg" 
                                titleSlide="Ambev - Piraí 1"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/AmbevPiraiRJ2.jpg" 
                                titleSlide="Ambev - Piraí 3"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/AmbevPiraiRJ3.jpg" 
                                titleSlide="Ambev - Piraí 3"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/CajamarSP.jpg" 
                                titleSlide="Cajamar / SP"
                            ></Slide>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Slide
                                imgSrc="/img/services/ContinentalPneusCamaçariBA1.jpg" 
                                titleSlide="Continental Pneus - Camaçari / BA"
                            ></Slide>
                        </SwiperSlide>
                    </Swiper>
                </div>

                <h3 className="pastClients"><strong className="redColor">NOSSOS CLIENTES ANTERIORES</strong></h3>
                    
                <div className="slideNossosParceiros">
                <div data-aos="fade-up">
                    <Swiper
                        effect={'coverflow'}
                        modules={[EffectCoverflow, Navigation]}
                        
                        coverflowEffect={{
                            rotate: 20,
                            stretch: 0,
                            depth: 50,
                            modifier: 0.03,
                            slideShadows: true,
                        }}

                        navigation

                        centeredSlides

                        initialSlide={5}

                        grabCursor={true}
                        pagination={false}
                        slidesPerView={5.8}
                        watchSlidesProgress
                        loop
                        className="SwiperMainComponent"
                        autoplay
                        
                    >
                        <SwiperSlide>
                            <SlidePartners
                                imgSrc="\img\services\parceiros\1569343851713.jpg" 
                                titleSlide="Data-Center - Paulínia / SP"
                            ></SlidePartners>
                        </SwiperSlide>
                        <SwiperSlide>
                            <SlidePartners
                                imgSrc="\img\services\parceiros\1519899542252.jpg" 
                                titleSlide="Data-Center 2 - Paulínia / SP"
                            ></SlidePartners>   
                        </SwiperSlide>
                        <SwiperSlide>
                            <SlidePartners
                                imgSrc="\img\services\parceiros\1654080004941.jpg" 
                                titleSlide="Data-Center 2 - Paulínia / SP"
                            ></SlidePartners>   
                        </SwiperSlide>
                        <SwiperSlide>
                            <SlidePartners
                                imgSrc="\img\services\parceiros\c1a13309fe66dcb601b404e70bab9436_logo-construcap-400x400.jpg" 
                                titleSlide="Data-Center 2 - Paulínia / SP"
                            ></SlidePartners>   
                        </SwiperSlide>
                        <SwiperSlide>
                            <SlidePartners
                                imgSrc="\img\services\parceiros\g4s-vagas.jpg" 
                                titleSlide="Data-Center 2 - Paulínia / SP"
                            ></SlidePartners>   
                        </SwiperSlide>
                        <SwiperSlide>
                            <SlidePartners
                                imgSrc="\img\services\parceiros\Logo RS.jpg" 
                                titleSlide="Data-Center 2 - Paulínia / SP"
                            ></SlidePartners>   
                        </SwiperSlide>
                        <SwiperSlide>
                            <SlidePartners
                                imgSrc="\img\services\parceiros\SHED.jpg" 
                                titleSlide="Data-Center 2 - Paulínia / SP"
                            ></SlidePartners>   
                        </SwiperSlide>
                        <SwiperSlide>
                            <SlidePartners
                                imgSrc="\img\services\parceiros\Temon.png" 
                                titleSlide="Data-Center 2 - Paulínia / SP"
                            ></SlidePartners>   
                        </SwiperSlide>
                        
                    </Swiper>
                </div>
                </div>

            </div>

            <div className="flex justifyCenter contactServices">
                <a href="#contactUs"><button>ENTRAR EM CONTATO</button></a>
            </div>
        </section>
        </>
    )
}

export default Services