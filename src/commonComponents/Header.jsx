import $ from 'jquery';
import { Link } from 'react-router-dom';
import Login from '../admin/Login';

function Header(){

    function clickMenu(){
        $('nav').toggleClass('show');
    }

    return (
        <>
            <header className="flex">
                <div className="flex logoMenu">
                    <div className="logo">
                        <a href="#mainBanner"><img src="/img/LOGO.png" alt="" className="logo" /></a>
                    </div>
                    <span className="menuSpan" onClick={clickMenu}><img src="\img\menu.webp" alt="menu" /></span>
                </div>
                
                <nav>
                    <ul>
                        <a href="/#mainBanner" onClick={clickMenu}><li>A HDS</li></a>
                        <a href="/#aboutUs" onClick={clickMenu}><li>SOBRE NÓS</li></a>
                        <a href="/#services" onClick={clickMenu}><li>SERVIÇOS</li></a>
                        <a href="/#contactUs" onClick={clickMenu}><li>CONTATO</li></a>
                        <a href="/#contactUs" onClick={clickMenu}><li>CONTATO</li></a>
                        <Link to={'/Login'}><li className="loginLi"><img src="/img/login/login.png" alt="" /> Login</li></Link>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header