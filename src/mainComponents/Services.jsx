import { Swiper, SwiperSlide } from "swiper/react"
import Slide from "./singleComponents/Slide";

import 'swiper/css';
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import { EffectCoverflow, Navigation } from "swiper/modules";

function Services(){
    return (
        <>
        <section className="services">
            <div className="titleTop">
                <img src="src/img/servicesMountainTop.svg" alt="" />
                <div className="absolute">                
                    <h2>SERVIÇOS</h2>
                </div>
                <img src="src/img/servicesMountainBottom.svg" alt="" />
            </div>
            
            <div className="mainSlideWorks">
                <span className="lineRed"></span>
                <span className="lineBlack"></span>
                <h4><strong className="redColor">Veja</strong> alguns dos nossos serviços que prestamos anteriormente no nosso slide logo abaixo!</h4>
                
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
                >
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/dataCenterSP.jpg" 
                            titleSlide="Data-Center - Paulínia / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/dataCenterSP2.jpg" 
                            titleSlide="Data-Center 2 - Paulínia / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/DataCenterSP3.jpg" 
                            titleSlide="Data-Center 3 - Paulínia / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/MaxAtacadistaTaubateS3.jpg" 
                            titleSlide="Max Atacadista - Taubaté / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/MaxAtacadistaTaubateSP.jpg" 
                            titleSlide="Max Atacadista 2 - Taubaté / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/MaxAtacadistaTaubateSP2.jpg" 
                            titleSlide="Max Atacadista 3 - Taubaté / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/MaxAtacadistaTaubateSP3.jpg" 
                            titleSlide="Max Atacadista 4 - Taubaté / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/SuzanoLimeiraSP.jpg" 
                            titleSlide="Suzano - Limeira / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/SuzanoLimeiraSP2.jpg" 
                            titleSlide="Suzano - Limeira / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/YaraCubataoSP.jpg" 
                            titleSlide="Ambev - Piraí"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/YaraCubataoSP2.jpg" 
                            titleSlide="Yara - Cubatão / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/interno1.jpg" 
                            titleSlide="Trabalho Interno 1"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/interno2.jpg" 
                            titleSlide="Trabalho Interno 2"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                                imgSrc="src/img/services/interno3.jpg" 
                            titleSlide="Trabalho Interno 3"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/AmbevPiraiRJ1.jpg" 
                            titleSlide="Ambev - Piraí 1"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/AmbevPiraiRJ2.jpg" 
                            titleSlide="Ambev - Piraí 3"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/AmbevPiraiRJ3.jpg" 
                            titleSlide="Ambev - Piraí 3"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/CajamarSP.jpg" 
                            titleSlide="Cajamar / SP"
                        ></Slide>
                    </SwiperSlide>
                    <SwiperSlide>
                        <Slide
                            imgSrc="src/img/services/ContinentalPneusCamaçariBA1.jpg" 
                            titleSlide="Continental Pneus - Camaçari / BA"
                        ></Slide>
                    </SwiperSlide>
                </Swiper>

            </div>

            <div className="flex justifyCenter contactServices">
                <button>ENTRAR EM CONTATO</button>
            </div>
            

            <div className="pastClients">
                <Swiper className="clientsSlides">
                    <SwiperSlide>
                        <img src="" alt="" />
                    </SwiperSlide>
                </Swiper>
            </div>
        </section>
        </>
    )
}

export default Services