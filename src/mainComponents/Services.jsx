import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Slide from "./singleComponents/Slide";
import SlidePartners from "./singleComponents/SlidePartners";

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { EffectCoverflow, Navigation } from "swiper/modules";

function Services() {
    const [slidesPerView, setSlidesPerView] = useState(2); // Estado inicial para 2 slides

    const handleResize = () => {
        const screenWidth = window.innerWidth;
        switch (true) {
            case (screenWidth <= 320):
                setSlidesPerView(1); // Se a tela for menor ou igual a 320px
                break;
            case (screenWidth > 320 && screenWidth < 720):
                setSlidesPerView(2); // Se a tela estiver entre 320px e 720px
                break;
            case (screenWidth >= 720):
                setSlidesPerView(5.8); // Se a tela for maior ou igual a 720px
                break;
            default:
                setSlidesPerView(2);
        }
    };

    useEffect(() => {
        handleResize(); // Chama ao montar o componente
        window.addEventListener("resize", handleResize); // Escuta o redimensionamento

        return () => {
            window.removeEventListener("resize", handleResize); // Remove o listener no cleanup
        };
    }, []);

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
                            slidesPerView={slidesPerView} // Usando o estado
                            className="SwiperMainComponent"
                            autoplay
                        >
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/dataCenterSP.jpg" 
                                    titleSlide="Data-Center - Paulínia / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/dataCenterSP2.jpg" 
                                    titleSlide="Data-Center 2 - Paulínia / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/DataCenterSP3.jpg" 
                                    titleSlide="Data-Center 3 - Paulínia / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/MaxAtacadistaTaubateS3.jpg" 
                                    titleSlide="Max Atacadista - Taubaté / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/MaxAtacadistaTaubateSP.jpg" 
                                    titleSlide="Max Atacadista 2 - Taubaté / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/MaxAtacadistaTaubateSP2.jpg" 
                                    titleSlide="Max Atacadista 3 - Taubaté / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/MaxAtacadistaTaubateSP3.jpg" 
                                    titleSlide="Max Atacadista 4 - Taubaté / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/SuzanoLimeiraSP.jpg" 
                                    titleSlide="Suzano - Limeira / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/SuzanoLimeiraSP2.jpg" 
                                    titleSlide="Suzano - Limeira / SP 2"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/YaraCubataoSP.jpg" 
                                    titleSlide="Yara - Cubatão / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/YaraCubataoSP2.jpg" 
                                    titleSlide="Yara - Cubatão / SP 2"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/interno1.jpg" 
                                    titleSlide="Trabalho Interno 1"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/interno2.jpg" 
                                    titleSlide="Trabalho Interno 2"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/interno3.jpg" 
                                    titleSlide="Trabalho Interno 3"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/AmbevPiraiRJ1.jpg" 
                                    titleSlide="Ambev - Piraí 1"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/AmbevPiraiRJ2.jpg" 
                                    titleSlide="Ambev - Piraí 3"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/AmbevPiraiRJ3.jpg" 
                                    titleSlide="Ambev - Piraí 3"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/CajamarSP.jpg" 
                                    titleSlide="Cajamar / SP"
                                />
                            </SwiperSlide>
                            <SwiperSlide>
                                <Slide
                                    imgSrc="/img/services/ContinentalPneusCamaçariBA1.jpg" 
                                    titleSlide="Continental Pneus - Camaçari / BA"
                                />
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
                                slidesPerView={slidesPerView} // Usando o estado
                                watchSlidesProgress
                                loop
                                className="SwiperMainComponent"
                                autoplay
                            >
                                <SwiperSlide>
                                    <SlidePartners
                                        imgSrc="/img/services/parceiros/1569343851713.jpg" 
                                        titleSlide="Data-Center - Paulínia / SP"
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <SlidePartners
                                        imgSrc="/img/services/parceiros/1519899542252.jpg" 
                                        titleSlide="Data-Center 2 - Paulínia / SP"
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <SlidePartners
                                        imgSrc="/img/services/parceiros/1654080004941.jpg" 
                                        titleSlide="Data-Center 2 - Paulínia / SP"
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <SlidePartners
                                        imgSrc="/img/services/parceiros/c1a13309fe66dcb601b404e70bab9436_logo-construcap-400x400.jpg" 
                                        titleSlide="Data-Center 2 - Paulínia / SP"
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <SlidePartners
                                        imgSrc="/img/services/parceiros/g4s-vagas.jpg" 
                                        titleSlide="Data-Center 2 - Paulínia / SP"
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <SlidePartners
                                        imgSrc="/img/services/parceiros/Logo RS.jpg" 
                                        titleSlide="Data-Center 2 - Paulínia / SP"
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <SlidePartners
                                        imgSrc="/img/services/parceiros/SHED.jpg" 
                                        titleSlide="Data-Center 2 - Paulínia / SP"
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <SlidePartners
                                        imgSrc="/img/services/parceiros/vlcsnap-2021-07-14-19h44m17s309.png" 
                                        titleSlide="Data-Center 2 - Paulínia / SP"
                                    />
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
    );
}

export default Services;
