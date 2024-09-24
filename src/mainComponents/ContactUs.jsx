function ContactUs(){
    return (
        <>
        <section className="contactUs">
            <div className="titleTop">
                <img src="src/img/contactUsMountainTop.svg" alt="" />
                <div className="absolute">                
                    <h2>FALE CONOSCO</h2>
                </div>
                <img src="src/img/contactUsMountainBottom.svg" alt="" />
            </div>
                
            <div className="mainContactUs">
                <h4><strong className="redColor">Entre em contato</strong> com nossa equipe de atendimento e tenha seu serviço industrial prestado com qualidade conosco, o mais rápido possível, com um dos melhores preços do mercado!</h4>

                <div className="contactInfo flex">
                    <div className="mountainsContact">
                        <div className="topContactMountains">
                            <img src="src/img/contactUsMountainTop1.svg" alt="" />
                        </div>
                        <div className="bottomContactMountains">
                        <img src="src/img/contactUsMountainBottom1.svg" alt="" />
                        </div>
                    </div>
                    

                    <div className="leftSide">
                        <img src="src/img/faleConoscoImg.png" alt="" />
                    </div>
                    <div className="rightSide">
                        <h3>Informações de contato</h3>

                        <div className="flex">
                            <div className="contactItem">
                                <img src="" alt="" />
                                <p>contato@hdsservico.com.br</p>
                            </div>
                            <div className="contactItem">
                                <img src="" alt="" />
                                <p>(12) 99221-1775</p>
                            </div>
                        </div>

                        <button>
                            <div className="flex">
                                <img src="" alt="" />
                                <p>Fale em nosso Whatsapp</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}

export default ContactUs