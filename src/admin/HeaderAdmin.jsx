import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import './HeaderAdmin.css';

function HeaderAdmin() {
    const navigate = useNavigate();
    const { adminUser, logout } = useAdmin();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <header className="headerAdmin">
            
            <div className="flex logo-container">
                <div className="logo">
                    <img src="/img/LOGO.png" alt="Logo" onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }} />    
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
        </header>
    );
}

export default HeaderAdmin;