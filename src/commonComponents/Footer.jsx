import { Link } from "react-router-dom"

function Footer(){
    return (
        <>
        <footer className="flex">
            <div className="logo">
                <a href="/#mainBanner"><img src="/img/LOGO.png" alt="" className="logo" /></a>
            </div>
            <div className="menusFooter flex">
                <div className="menuNavegacao">
                    <h4><strong>NAVEGAÇÃO</strong></h4>
                    <ul>
                        <a href="/#mainBanner"><li>A HDS</li></a>
                        <a href="/#aboutUs"><li>Sobre Nós</li></a>
                        <a href="/#services"><li>Serviços</li></a>
                        <a href="/#contactUs"><li>Contato</li></a>
                        <Link to={'/admin/login'}><li className="loginLi">Login - Administrativo</li></Link>

                    </ul>
                </div>
                <div className="menuContato">
                    <h4><strong>CONTATO</strong></h4>
                    <ul>
                    <a href="mailto:contato@hdsservico.com.br"><li>contato@hdsservico.com.br</li></a>
                        <a href="https://wa.me/5512992211775"><li>(12) 99221-1775</li></a>
                    </ul>
                </div>
                
            </div>
        </footer>
        </>
    )
}

export default Footer