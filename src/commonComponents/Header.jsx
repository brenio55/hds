import $ from 'jquery';

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
                        <a href="#mainBanner"><li>A HDS</li></a>
                        <a href="#aboutUs"><li>SOBRE NÓS</li></a>
                        <a href="#services"><li>SERVIÇOS</li></a>
                        <a href="#contactUs"><li>CONTATO</li></a>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header