import WeWorkIcon from "./WeWorkIcon"

function AboutUs(){
    return (
        <>
        <section className="aboutUs">
            <h2>SOBRE NÓS</h2>

            <div className="flex leftAndRightAboutUs">
                <div className="leftSide">
                    <img src="src/img/aboutUsImg.jpeg" alt="" />
                </div>
                <div className="rightSide">
                <div data-aos="fade-right">
                    <div className="atuacao">
                        <h3 className="boldRed">Atuação</h3>
                        <p>Somos a <i className="boldRed">HDS Serviços Industriais</i>, uma empresa especializada na prestação de serviço para <b>fabricação, montagem e manutenção</b> em artigos e estruturas metálicas.</p>
                    </div>
                </div>
                    <div className="trabalhamosCom">
                        <h3 className="boldRed">Trabalhamos com</h3>
                        <div data-aos="fade-right">
                            <WeWorkIcon
                                WeWorkTitle="FABRICAÇÃO"
                                WeWorkDescription="Tubulações, estruturas metálicam, equipamentos de pequeno porte, sistema de exaustão, incinerador;"
                                WeWorkImgSrc="src/img/industryIcon.svg"
                            ></WeWorkIcon>
                        </div>
                        <div data-aos="fade-right">
                            <WeWorkIcon
                                WeWorkTitle="MONTAGEM"
                                WeWorkDescription="Vasos de pressão, permuta de calor, fornos, caldeiras;"
                                WeWorkImgSrc="src/img/mountingIcon.svg"
                            ></WeWorkIcon>
                        </div>
                        <div data-aos="fade-right">
                            <WeWorkIcon
                                WeWorkTitle="MANUTENÇÃO"
                                WeWorkDescription="Fornos, Caldeiras, Filtros de manga, permutadores, misturadores, torres, sistema transportador (rosca/correia), vasos, reatores, dentre outros."
                                WeWorkImgSrc="src/img/maintananceIcon.svg"
                            ></WeWorkIcon>
                        </div>
                    </div>
                    <div data-aos="fade-right">
                        <div className="qualidadeSeguranca">
                            <h3 className="boldRed">Qualidade e Segurança</h3>
                            <p>Um dos nossos objetivos como empresa, é executar serviços de qualidade, e segurança para todos os nossos clientes. Prezamos pela segurança dos nossos clientes e colaboradores, garantindo sempre que o trabalho seja executado da melhor maneira, pela melhor equipe, com o melhor controle de qualidade possível.</p>
                        </div>
                    </div>
                    <div data-aos="fade-right">
                        <button>VER SERVIÇOS</button>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}

export default AboutUs