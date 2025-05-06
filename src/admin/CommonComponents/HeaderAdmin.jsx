import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import './HeaderAdmin.css';
import '../../App.css';

function HeaderAdmin() {
    const navigate = useNavigate();
    const { adminUser, logout } = useAdmin();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <header className="navbar bg-black-300 shadow-sm">
            
            <div className="flex logo-container">
                <div className="logo">
                    <img src="/img/LOGO.png" alt="Logo" onClick={() => navigate('/admin/dashboardoptimzed')} style={{ cursor: 'pointer' }} />    
                </div>
                <p>ERP - Sistema de Gestão</p>
            </div>
            <div className="user-info">
                {adminUser ? (
                    <>
                        <span>Olá, {adminUser.username}</span>
                        <button onClick={handleLogout}>Sair</button>
                    </>
                ) : (
                    <>
                        <p>Você está ou foi desconectado, faça login novamente para continuar com o acesso ao sistema.</p>
                        <button onClick={() => navigate('/admin/login')}>Login</button>
                    </>
                )}
            </div>

            {/* <div className="flex-1">
                <a href="" className="btn btn-ghost text-xl font-normal" onClick={() => navigate('/admin/dashboard')}>HDS - Sistema de Gestão</a>
            </div>

            <div className="flex-none">
                <ul className="menu menu-horizontal gap-3 px-1 ">
                    <li>
                        {adminUser ? (
                            <>
                                <details>
                                    <summary>Olá, &nbsp;&nbsp;{adminUser.username}</summary>
                                    <ul className="bg-base-100 rounded-t-none p-2">
                                        <li><a href="" className="bg-secondary p-5" onClick={handleLogout}>Sair</a></li>
                                    </ul>
                                </details>
                                
                            </>
                        ) : (
                            <>
                                <li><p>Você está ou foi desconectado, faça login novamente para continuar com o acesso ao sistema.</p></li>
                                <li><a href="" onClick={() => navigate('/admin/login')}>Login</a></li>
                            </>
                        )}
                    </li>
                </ul>
            </div> */}

                    
            

        </header>

        
    );
}

export default HeaderAdmin;