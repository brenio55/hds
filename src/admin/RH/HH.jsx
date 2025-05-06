import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderAdminOptmized from '../CommonComponents/HeaderAdminOptmized';

// Importando ícones
import { FaUserClock, FaClipboardList } from "react-icons/fa";
import { TbUserPlus, TbUserSearch } from "react-icons/tb";
import { MdWorkOutline, MdOutlineWorkHistory } from "react-icons/md";

function HH() {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        if (path) {
            navigate(path);
        }
    };

    return (
        <>
            <HeaderAdminOptmized />
            <div className="container mx-auto px-4 py-8 mt-6">
                {/* Navegação em breadcrumbs */}
                <div className="breadcrumbs text-sm mb-6">
                    <ul>
                        <li>
                            <a onClick={() => navigate('/admin/dashboardoptimzed')}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 stroke-current">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                                </svg>
                                Home
                            </a>
                        </li>
                        <li>
                            <span className="inline-flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 stroke-current">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Recursos Humanos & HH
                            </span>
                        </li>
                    </ul>
                </div>

                <h1 className="text-2xl font-bold mb-6 text-center">Gestão de Recursos Humanos</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* RC - Registro de Ponto */}
                     <div 
                        className="btn btn-soft btn-primary py-6 px-4"
                        onClick={() => handleNavigation(null)} // Rota ainda não existe
                    >
                        <div className="flex items-center gap-3 justify-start flex-row w-full">
                            <FaUserClock size={24}/> 
                            <p className="text-lg">RC - Registro de Ponto</p>
                        </div>
                    </div>

                    {/* Consultar Horas trabalhadas */}
                    <div 
                        className="btn btn-soft btn-primary py-6 px-4"
                        onClick={() => handleNavigation(null)} // Rota ainda não existe
                    >
                        <div className="flex items-center gap-3 justify-start flex-row w-full">
                            <FaClipboardList size={24}/> 
                            <p className="text-lg">Consultar Horas Trabalhadas</p>
                        </div>
                    </div>

                    {/* Cadastrar Funcionário */}
                    <div 
                        className="btn btn-soft btn-primary py-6 px-4"
                        onClick={() => handleNavigation('/admin/cadastrarFuncionario')}
                    >
                        <div className="flex items-center gap-3 justify-start flex-row w-full">
                            <TbUserPlus size={24}/> 
                            <p className="text-lg">Cadastrar Funcionário</p>
                        </div>
                    </div>

                    {/* Consultar Funcionário */}
                    <div 
                        className="btn btn-soft btn-primary py-6 px-4"
                        onClick={() => handleNavigation('/admin/consultarFuncionarios')}
                    >
                        <div className="flex items-center gap-3 justify-start flex-row w-full">
                            <TbUserSearch size={24}/>
                            <p className="text-lg">Consultar Funcionários</p>
                        </div>
                    </div>

                   

                    {/* Cadastrar Função */}
                    <div 
                        className="btn btn-soft btn-primary py-6 px-4"
                        onClick={() => handleNavigation('/admin/cadastrarCargo')}
                    >
                        <div className="flex items-center gap-3 justify-start flex-row w-full">
                            <MdWorkOutline size={24}/> 
                            <p className="text-lg">Cadastrar Função</p>
                        </div>
                    </div>

                    {/* Consultar Funções */}
                    <div 
                        className="btn btn-soft btn-primary py-6 px-4"
                        onClick={() => handleNavigation('/admin/consultarCargos')}
                    >
                        <div className="flex items-center gap-3 justify-start flex-row w-full">
                            <MdOutlineWorkHistory size={24}/> 
                            <p className="text-lg">Consultar Funções</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HH; 