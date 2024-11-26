import $ from 'jquery';
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

function HeaderAdmin(){
    const { adminUser, logout } = useAdmin();

    function clickMenu(){
        $('nav').toggleClass('show');
    }

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <header className="flex headerAdmin">
                <div className="flex logoMenu">
                    <div className="logo">
                        <Link to="/dashboard"><img src="/img/LOGO.png" alt="" className="logo" /></Link>
                    </div>
                    <span className="menuSpan" onClick={clickMenu}><img src="/img/menu.webp" alt="menu" /></span>
                </div>
                
                <nav>
                    <ul>
                        <Link to="/dashboard"><li>Dashboard</li></Link>
                        <Link to="/pedidosDeCompra"><li>Pedidos</li></Link>
                        {adminUser ? (
                            <li className="loginLi">
                                <span>{adminUser.userName}</span>
                                <button onClick={handleLogout}>Sair</button>
                            </li>
                        ) : (
                            <Link to="/login"><li className="loginLi">
                                <img src="/img/login/login.png" alt="" /> Login
                            </li></Link>
                        )}
                    </ul>
                </nav>
            </header>
        </>
    );
}

export default HeaderAdmin;