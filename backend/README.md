# ERP Backend

API backend para sistema ERP construída com Node.js e PostgreSQL.

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)

### Configuração do Ambiente

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd erp-backend
```

2. Crie um arquivo `.env` na raiz do projeto:
```env
SUPABASE_DB_URL=sua_url_postgres
JWT_SECRET=seu_secret_muito_seguro
JWT_EXPIRES_IN=24h
PORT=3000
```

3. Inicie o container Docker:
```bash
docker-compose up --build
```

A API estará disponível em `http://localhost:3000`

### Documentação Swagger

A documentação da API está disponível em:
```
http://localhost:3000/api-docs
```

## 📌 Endpoints

### Autenticação

#### Registro de Usuário
```http
POST /auth/register
```

**Corpo da Requisição:**
```json
{
  "username": "usuario",
  "password": "senha123",
  "role": "user" // opcional, padrão: "user"
}
```

**Resposta de Sucesso:**
```json
{
  "user": {
    "id": 1,
    "username": "usuario",
    "role": "user"
  },
  "token": "jwt_token"
}
```

#### Login
```http
POST /auth/login
```

**Corpo da Requisição:**
```json
{
  "username": "usuario",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "user": {
    "id": 1,
    "username": "usuario",
    "role": "user"
  },
  "token": "jwt_token"
}
```

### Autenticação em Requisições Protegidas

Para endpoints protegidos, inclua o token JWT no header:
```http
Authorization: Bearer seu_token_jwt
```

### Obter Perfil do Usuário
```http
GET /auth/profile
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Resposta de Sucesso:**
```json
{
  "id": "1",
  "username": "usuario",
  "role": "admin",
  "created_at": "2024-03-21T10:00:00Z"
}
```

**Exemplo de Uso:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer seu_token"
```

## 🔒 Roles e Permissões

O sistema possui dois níveis de acesso:
- **user**: Acesso básico ao sistema
- **admin**: Acesso completo ao sistema

## 🛠 Desenvolvimento Local

1. Instale as dependências:
```bash
npm install
```

2. Execute as migrations:
```bash
npm run migrate
```

3. Inicie o servidor em modo desenvolvimento:
```bash
npm run dev
```

## 📝 Scripts Disponíveis

- `npm start`: Inicia o servidor em produção
- `npm run dev`: Inicia o servidor em modo desenvolvimento com hot-reload
- `npm run migrate`: Executa as migrations
- `npm run migrate:undo`: Reverte as migrations
- `npm test`: Executa os testes

## 🧪 Testes

Execute os testes com:
```bash
npm test
```

## 🔍 Exemplos de Uso

### Registro de Usuário
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario",
    "password": "senha123",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario",
    "password": "senha123"
  }'
```

### Criar uma Proposta
```http
POST /api/propostas
```

**Headers:**
```http
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "descricao": "Proposta de desenvolvimento web",
  "data_emissao": "2024-03-20",
  "client_info": {
    "nome": "Cliente A",
    "email": "cliente@email.com",
    "telefone": "11999999999",
    "empresa": "Empresa A",
    "cnpj": "12345678000199",
    "endereco": "Rua A, 123"
  },
  "versao": "1.0",
  "documento_text": "Texto do documento em formato JSON",
  "especificacoes_html": "<p>Especificações em HTML</p>",
  "afazer_hds": [
    "Desenvolvimento do frontend",
    "Desenvolvimento do backend",
    "Configuração do servidor"
  ],
  "afazer_contratante": [
    "Fornecer conteúdo",
    "Validar layouts",
    "Homologar entregas"
  ],
  "naofazer_hds": [
    "Criação de conteúdo",
    "Hospedagem",
    "Manutenção após entrega"
  ],
  "valor_final": "10000,50"
}
```

**Descrição dos Campos:**
- `descricao`: String (obrigatório) - Descrição detalhada da proposta
- `data_emissao`: String (YYYY-MM-DD) - Data de emissão da proposta
- `client_info`: Objeto (obrigatório) - Informações do cliente
  - `nome`: String - Nome do cliente
  - `email`: String - Email do cliente
  - `telefone`: String - Telefone do cliente
  - `empresa`: String - Nome da empresa
  - `cnpj`: String - CNPJ da empresa
  - `endereco`: String - Endereço completo
- `versao`: String - Versão da proposta (ex: "1.0")
- `documento_text`: String/JSON - Texto do documento em formato JSON
- `especificacoes_html`: String - Especificações em formato HTML
- `afazer_hds`: Array - Lista de tarefas a serem realizadas pela HDS
- `afazer_contratante`: Array - Lista de tarefas a serem realizadas pelo contratante
- `naofazer_hds`: Array - Lista de itens fora do escopo
- `valor_final`: String - Valor final da proposta (formato: "10000,50" ou "10.000,50")

**Resposta de Sucesso:**
```json
{
  "id": "123",
  "descricao": "Proposta de desenvolvimento web",
  "data_emissao": "2024-03-20",
  "client_info": {
    "nome": "Cliente A",
    "email": "cliente@email.com",
    "telefone": "11999999999",
    "empresa": "Empresa A",
    "cnpj": "12345678000199",
    "endereco": "Rua A, 123"
  },
  "versao": "1.0",
  "documento_text": "Texto do documento em formato JSON",
  "especificacoes_html": "<p>Especificações em HTML</p>",
  "afazer_hds": [
    "Desenvolvimento do frontend",
    "Desenvolvimento do backend",
    "Configuração do servidor"
  ],
  "afazer_contratante": [
    "Fornecer conteúdo",
    "Validar layouts",
    "Homologar entregas"
  ],
  "naofazer_hds": [
    "Criação de conteúdo",
    "Hospedagem",
    "Manutenção após entrega"
  ],
  "valor_final": "10000,50",
  "created_at": "2024-03-21T10:00:00Z",
  "pdf_versions": {
    "1.0": "uuid-do-pdf"
  }
}
```

**Exemplo de Uso:**
```bash
curl -X POST http://localhost:3000/api/propostas \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Proposta de desenvolvimento web",
    "data_emissao": "2024-03-20",
    "client_info": {
      "nome": "Cliente Abilio joao",
      "email": "cliente@email.com",
      "telefone": "11999999999",
      "empresa": "Empresa Jorge materiais",
      "cnpj": "12345678000199",
      "endereco": "Rua Aderbal lino, 123"
    },
    "versao": "1.0",
    "documento_text": {"a":"Poste telecônico Reto Flangeado, construido em aço 1010/1020. Diâmetro do tubo da base 101,60mm e diâmetro do topo 60,30mm, h = 7.85 metros. Fornecido em 2 lances. Galvanizado à fogo","b":"Instalação do poste fornecido no item A"},
    "afazer_hds": [
      "Desenvolvimento do frontend",
      "Desenvolvimento do backend",
      "Configuração do servidor"
    ],
    "afazer_contratante": [
      "Fornecer conteúdo",
      "Validar layouts",
      "Homologar entregas"
    ],
    "naofazer_hds": [
      "Criação de conteúdo",
      "Hospedagem",
      "Manutenção após entrega"
    ],
    "valor_final": "10000,50"
  }'
  ```

### Consultar uma Proposta
```http
GET /api/propostas/{id}
```

**Parâmetros da URL:**
```json
{
  "id": "string" // ID da proposta
}
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Resposta de Sucesso:**
```json
{
  "id": "123",
  "descricao": "Proposta de desenvolvimento web",
  "data_emissao": "2024-03-20",
  "client_info": {
    "nome": "Cliente A",
    "email": "cliente@email.com"
  },
  "valor_final": "10.000,50",
  "versao": "1.0",
  "status": "em_analise"
}
```

**Exemplo de Uso:**
```bash
curl -X GET http://localhost:3000/api/propostas/123 \
  -H "Authorization: Bearer seu_token"
```

### Pesquisar Propostas
```http
GET /api/propostas/search
```

**Query Parameters (ao menos um é obrigatório):**
```json
{
  "descricao": "string",
  "data_emissao": "string",
  "valor_final": "string",
  "status": "string",
  "versao": "string",
  "client_info.nome": "string",
  "client_info.email": "string"
}
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Resposta de Sucesso:**
```json
{
  "total": 2,
  "propostas": [
    {
      "id": "123",
      "descricao": "Proposta de desenvolvimento web",
      "data_emissao": "2024-03-20",
      "client_info": {
        "nome": "Cliente A",
        "email": "cliente@email.com"
      },
      "valor_final": "10.000,50",
      "versao": "1.0",
      "status": "em_analise"
    },
    {
      "id": "124",
      "descricao": "Proposta de desenvolvimento mobile",
      "data_emissao": "2024-03-20",
      "client_info": {
        "nome": "Cliente A",
        "email": "cliente@email.com"
      },
      "valor_final": "15.000,00",
      "versao": "1.0",
      "status": "em_analise"
    }
  ]
}
```

**Exemplos de Uso:**
```bash
# Buscar por descrição
curl -X GET "http://localhost:3000/api/propostas/search?descricao=web" \
  -H "Authorization: Bearer seu_token"

# Buscar por múltiplos parâmetros
curl -X GET "http://localhost:3000/api/propostas/search?status=em_analise&client_info.nome=Cliente%20A" \
  -H "Authorization: Bearer seu_token"

# Buscar todas as propostas (sem parâmetros)
curl -X GET "http://localhost:3000/api/propostas/search" \
  -H "Authorization: Bearer seu_token"
```

## 🚨 Tratamento de Erros

A API retorna os seguintes códigos de status HTTP:

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Erro de validação
- `401`: Não autorizado
- `500`: Erro interno do servidor

