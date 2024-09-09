import WeWorkIcon from "./WeWorkIcon"

function AboutUs(){
    return (
        <>
        <section className="aboutUs">
            <div className="flex">
                <div className="leftSide">
                    <img src="" alt="" />
                </div>
                <div className="rightSide">
                    <div className="atuacao">
                        <h2>Atuação</h2>
                        <p>Somos a HDS Serviços Industriais, uma empresa especializada na prestação de serviço para fabricação, montagem e manutenção em artigos e estruturas metálicas.</p>
                    </div>
                    <div className="trabalhamosCom">
                        <h2>Trabalhamos com</h2>
                        <WeWorkIcon
                            WeWorkTitle="FABRICAÇÃO"
                            WeWorkDescription="Tubulações, estruturas metálicam, equipamentos de pequeno porte, sistema de exaustão, incinerador;"
                            WeWorkImgSrc=""
                        ></WeWorkIcon>
                        
                        <WeWorkIcon
                            WeWorkTitle="MONTAGEM"
                            WeWorkDescription="Vasos de pressão, permuta de calor, fornos, caldeiras;"
                            WeWorkImgSrc=""
                        ></WeWorkIcon>

                        <WeWorkIcon
                            WeWorkTitle="MANUTENÇÃO"
                            WeWorkDescription="Fornos, Caldeiras, Filtros de manga, permutadores, misturadores, torres, sistema transportador (rosca/correia), vasos, reatores, dentre outros."
                            WeWorkImgSrc=""
                        ></WeWorkIcon>
                    </div>
                    <div className="qualidadeSeguranca">
                        <h2>Qualidade e Segurança</h2>
                        <p>Um dos nossos objetivos como empresa, é executar serviços de qualidade, e segurança para todos os nossos clientes. Prezamos pela segurança dos nossos clientes e colaboradores, garantindo sempre que o trabalho seja executado da melhor maneira, pela melhor equipe, com o melhor controle de qualidade possível.</p>
                    </div>
                    <button>VER SERVIÇOS</button>
                </div>
            </div>
        </section>
        </>
    )
}

export default AboutUs