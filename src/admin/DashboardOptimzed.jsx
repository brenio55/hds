import HeaderAdminOptmized from "./CommonComponents/HeaderAdminOptmized";
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { HiDocumentAdd } from "react-icons/hi";
import { TbPencilDown, TbZoomMoney, TbPencilSearch, TbUserSearch, TbUserPlus, TbReport, TbReportMoney } from "react-icons/tb";
import { BiMoneyWithdraw } from "react-icons/bi";
import { LuFileSearch2 } from "react-icons/lu";
import { FaHouseFlag } from "react-icons/fa6";  

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
            md:flex-row md:items-start md:gap-20
           "> 
                <div className="service-section">
                    <h2>Centros de Custo e Fornecedores</h2>
                    <div className="service-buttons ml-8 mt-4">
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/gerarPropostas')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <HiDocumentAdd /> 
                                <p>Gerar Proposta (Centro de Custo)</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/consultarPropostas')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <LuFileSearch2 />
                                <p>Consultar Propostas (Centro de Custo)</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/cadastrarFornecedor')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbUserPlus /> 
                                <p>Cadastrar Fornecedor</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/consultarFornecedores')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbUserSearch />
                                <p>Consultar Fornecedores</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/cadastrarFuncionario')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbUserPlus />
                                <p>Cadastrar Funcionário</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/consultarFuncionarios')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbUserSearch />
                                <p>Consultar Funcionários</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="service-section">
                    <h2>Gerenciamento de Pedidos</h2>
                    <div className="service-buttons ml-8 mt-4"> 
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/pedidosDeMaterial')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbPencilDown /> 
                                <p>Gerar Pedido de Compra de Material</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/pedidosDeLocacao')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbPencilDown /> 
                                <p>Gerar Pedido de Locação</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/pedidosDeServico')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbPencilDown /> 
                                <p>Gerar Pedido de Serviço</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/faturarPedido')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <BiMoneyWithdraw /> 
                                <p>Faturar Pedido de Compra</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/consultarFaturamentos')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbZoomMoney /> 
                                <p>Consultar Faturamentos</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/consultarPedidos')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbPencilSearch /> 
                                <p>Consultar Pedidos C-L-S</p>
                            </div>
                        </div>
                        {/* <div className="bg-base-100">HH</div> */}
                    </div>
                </div>
                <div className="service-section">
                    <h2>Financeiro - Registro e Consulta</h2>
                    <div className="service-buttons ml-8 mt-4"> 
                        <div className="btn btn-soft btn-primary">
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbReport />
                                <p>Relatório Geral de Centros de Custo</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/consultarCentroCusto')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <TbReportMoney /> 
                                <p>Consultar Custo de Obra de Centro de Custo</p>
                            </div>
                        </div>
                        <div className="btn btn-soft btn-primary" onClick={() => handleNavigation('/admin/rcAluguel')}>
                            <div className="flex items-center gap-2 justify-start flex-row w-full">
                                <FaHouseFlag /> 
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