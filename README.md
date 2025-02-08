# HDS System

Este sistema fornece uma configuração para gerenciar propostas, pedidos e serviços da HDS.

## Funcionalidades Principais

### Geração de Propostas

O sistema permite a geração de propostas comerciais com os seguintes campos:

- Descrição da proposta
- Data de emissão
- Informações do cliente (nome, CNPJ, endereço, contato)
- Versão do documento
- Texto do documento
- Especificações em HTML
- Lista de atividades a serem realizadas pela HDS
- Lista de atividades a serem realizadas pelo contratante
- Lista de atividades que não serão realizadas pela HDS
- Valor final da proposta

Para gerar uma nova proposta, acesse a rota `/admin/gerar-proposta` e preencha o formulário com as informações necessárias.

## Configuração do Ambiente

### Frontend (React + Vite)

1. Instale as dependências:
```bash
npm install
```

2. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

### Backend

1. Configure as variáveis de ambiente no arquivo `.env`
2. Instale as dependências:
```bash
cd backend
npm install
```

3. Execute o servidor:
```bash
npm start
```

## Plugins Oficiais

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) usa [Babel](https://babeljs.io/) para Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) usa [SWC](https://swc.rs/) para Fast Refresh
