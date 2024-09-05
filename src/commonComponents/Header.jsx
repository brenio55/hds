function Header(){
    return (
        <>
            <header className="flex">
                <div className="logo">
                    <img src="src/img/LOGO.png" alt="" className="logo" />
                </div>
                <nav>
                    <ul>
                        <a href="#"><li>A HDS</li></a>
                        <a href="#"><li>SOBRE NÓS</li></a>
                        <a href="#"><li>SERVIÇOS</li></a>
                        <a href="#"><li>CONTATO</li></a>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header