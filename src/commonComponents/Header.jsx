function Header(){
    return (
        <>
            <header className="flex">
                <div className="logo">
                    <a href="#mainBanner"><img src="src/img/LOGO.png" alt="" className="logo" /></a>
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