import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import './HeaderAdmin.css';

function HeaderAdmin() {
    const navigate = useNavigate();
    const { adminUser, logout } = useAdmin();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="headerAdmin">
            
            <div className="flex logo-container">
                <div className="logo">
                    <img src="/img/LOGO.png" alt="Logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }} />    
                </div>
                <p>ERP - Sistema de Gestão</p>
            </div>
            <div className="user-info">
                {adminUser && (
                    <>
                        <span>Olá, {adminUser.username}</span>
                        <button onClick={handleLogout}>Sair</button>
                    </>
                )}
            </div>
        </header>
    );
}

export default HeaderAdmin;