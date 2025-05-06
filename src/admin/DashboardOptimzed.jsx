import HeaderAdminOptmized from "./CommonComponents/HeaderAdminOptmized";
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { HiDocumentAdd } from "react-icons/hi";
import { TbPencilDown, TbZoomMoney, TbPencilSearch, TbUserSearch, TbUserPlus, TbReport, TbReportMoney } from "react-icons/tb";
import { BiMoneyWithdraw } from "react-icons/bi";
import { LuFileSearch2 } from "react-icons/lu";
import { FaHouseFlag } from "react-icons/fa6";  
import { RiUserSettingsFill } from "react-icons/ri";

function DashboardOptimzed(){

    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return(
        <>
          <HeaderAdminOptmized />
          <div className="
            container mx-auto px-4 py-8 flex flex-row items-start justify-center gap-20 mt-10
            sm:flex-col sm:items-center sm:gap-10
            md:flex-row md:items-start md:gap-10
           "> 
                <div className="service-section">
                    <h2 className="text-xl font-medium text-center">Centros de Custo e Fornecedores</h2>
                    <div className="service-buttons mt-4">
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/gerarPropostas')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <HiDocumentAdd size={23}/> 
                                <p>Gerar Proposta (Centro de Custo)</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/consultarPropostas')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <LuFileSearch2 size={23}/>
                                <p>Consultar Propostas (Centro de Custo)</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/cadastrarFornecedor')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbUserPlus size={23}/> 
                                <p>Cadastrar Fornecedor</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/consultarFornecedores')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbUserSearch size={23}/>
                                <p>Consultar Fornecedores</p>
                            </div>
                        </div>
                        {/* <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/cadastrarFuncionario')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbUserPlus size={23}/>
                                <p>Cadastrar Funcionário</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/consultarFuncionarios')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbUserSearch size={23}/>
                                <p>Consultar Funcionários</p>
                            </div>
                        </div> */}
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/hh')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <RiUserSettingsFill size={23}/>
                                <p>Recursos Humanos (HH)</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="service-section">
                    <h2 className="text-xl font-medium text-center">Gerenciamento de Pedidos</h2>
                    <div className="service-buttons mt-4"> 
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/pedidosDeMaterial')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbPencilDown size={23}/> 
                                <p>Gerar Pedido de Compra de Material</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/pedidosDeLocacao')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbPencilDown size={23}/> 
                                <p>Gerar Pedido de Locação</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/pedidosDeServico')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbPencilDown size={23}/> 
                                <p>Gerar Pedido de Serviço</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/faturarPedido')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <BiMoneyWithdraw size={23}/> 
                                <p>Faturar Pedido de Compra</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/consultarFaturamentos')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbZoomMoney size={23}/> 
                                <p>Consultar Faturamentos</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/consultarPedidos')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbPencilSearch size={23}/> 
                                <p>Consultar Pedidos C-L-S</p>
                            </div>
                        </div>
                        {/* <div className="bg-base-100">HH</div> */}
                    </div>
                </div>
                <div className="service-section">
                    <h2 className="text-xl font-medium text-center">Financeiro - Registro e Consulta</h2>
                    <div className="service-buttons mt-4"> 
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => {
                            alert('Em desenvolvimento');
                        }}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbReport size={23}/>
                                <p>Relatório Geral de Centros de Custo</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/consultarCentroCusto')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbReportMoney size={23}/> 
                                <p>Consultar Custo de Obra do C.C.</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary py-6 px-4 w-85" onClick={() => handleNavigation('/admin/rcAluguel')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <FaHouseFlag size={23}/> 
                                <p>RC - Aluguel de Casas</p>
                            </div>
                        </div>
                    </div>
                </div>
          </div>
        </>
    )
}

export default DashboardOptimzed;