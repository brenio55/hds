import { useAdmin } from '../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { IoPerson } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import '../../App.css';


function HeaderAdminOptmized(){
    const navigate = useNavigate();
    const { adminUser, logout } = useAdmin();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return(
        <>
            <div className="navbar bg-base-100 shadow-sm">
                <div className="flex-1 ml-10 mt-2">
                    <img src="/img/admin/LOGO.png" alt="Logo" className="w-25 py-2 px-3 h-auto bg-white rounded" />
                    {/* <a href="" className="btn btn-ghost text-xl font-normal" onClick={() => navigate('/admin/dashboard')}>HDS - Sistema de Gestão</a> */}
                </div>

            <div className="flex-none">
                <ul className="menu menu-horizontal gap-3 px-1 mr-10 mt-2">
                    <li className="bg-gray-700 rounded">
                        {adminUser ? (
                            <>
                                <details>
                                    <summary><IoPerson /> Olá, &nbsp;&nbsp;{adminUser.username}</summary>
                                    <ul className="bg-base-100 rounded-t-none p-2">
                                        <li><a href="" className="bg-red-500 px-5" onClick={handleLogout}> <IoIosLogOut /> Sair</a></li>
                                    </ul>
                                </details>
                                
                            </>
                        ) : (
                            <>
                                <li><p>Você está ou foi desconectado, faça login novamente para continuar com o acesso ao sistema.</p></li>
                                <li><a href="" onClick={() => navigate('/admin/login')}> <IoPerson /> Login</a></li>
                            </>
                        )}
                    </li>
                </ul>
            </div>
            </div>
        </>
    )
}

export default HeaderAdminOptmized;