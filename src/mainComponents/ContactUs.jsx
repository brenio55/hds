import React, { useState, useEffect } from 'react';

function ContactUs() {
    const [iconVersion, setIconVersion] = useState({
        mailIcon: "/img/mailIcon.svg",
        telephoneIcon: "/img/telephoneIcon.svg"
    });

    const handleResize = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 320 && screenWidth < 720) {
            setIconVersion({
                mailIcon: "/img/mailIconBlack.webp",
                telephoneIcon: "/img/telephoneIconBlack.webp"
            });
        } else {
            setIconVersion({
                mailIcon: "/img/mailIcon.svg",
                telephoneIcon: "/img/telephoneIcon.svg"
            });
        }
    };

    useEffect(() => {
        handleResize(); // Verifica a largura inicial ao montar o componente
        window.addEventListener("resize", handleResize); // Escuta o redimensionamento da tela

        return () => {
            window.removeEventListener("resize", handleResize); // Remove o listener no cleanup
        };
    }, []);

    return (
        <>
        <section className="contactUs" id="contactUs">
            <div className="titleTop">
                <img src="/img/contactUsMountainTop.svg" alt="" />
                <div className="absolute">                
                    <h2>FALE CONOSCO</h2>
                </div>
                <img src="/img/contactUsMountainBottom.svg" alt="" />
            </div>
                
            <div className="mainContactUs">
                <h4><strong className="redColor">Entre em contato</strong> com nossa equipe de atendimento e tenha seu serviço industrial prestado com qualidade conosco, o mais rápido possível, com um dos melhores preços do mercado!</h4>

                <div className="contactInfo flex">
                    <div className="mountainsContact">
                        <div className="topContactMountains">
                            <img src="/img/contactUsMountainTop1.svg" alt="" />
                        </div>
                        <div className="bottomContactMountains">
                            <img src="/img/contactUsMountainBottom1.svg" alt="" />
                        </div>
                    </div>

                    <div className="leftSide">
                        <img src="/img/faleConoscoImg.png" alt="" />
                    </div>
                    <div className="rightSide">
                        <div data-aos="fade-right">
                            <h3>Informações de contato</h3>
                        </div>
                        <div className="flex detailedContactInfo">
                            <div data-aos="fade-right">
                                <div className="contactItem">                                
                                    <img src={iconVersion.mailIcon} alt="Email Icon" />
                                    <p><a href="mailto:contato@hdsservico.com.br">contato@hdsservico.com.br</a></p>
                                </div>
                            </div>
                            <div data-aos="fade-right">
                                <div className="contactItem">                            
                                    <img src={iconVersion.telephoneIcon} alt="Telephone Icon" />
                                    <p><a href="tel:+5512992211775">(12) 99221-1775</a></p>
                                </div>
                            </div>
                        </div>

                        <div data-aos="fade-right"> 
                            <a href="https://wa.me/5512992211775"><button>
                                <div className="flex">
                                    <img src="/img/whatsappIcon.svg" alt="WhatsApp Icon" />
                                    <p>Fale em nosso Whatsapp</p>
                                </div>
                            </button></a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}

export default ContactUs;
