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
```bash
curl -X POST http://localhost:3000/api/propostas \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Proposta de desenvolvimento web",
    "data_emissao": "2024-03-20",
    "client_info": {"nome": "Cliente A", "email": "cliente@email.com"},
    "valor_final": "10.000,50",
    "versao": "1.0"
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

## 🚨 Tratamento de Erros

A API retorna os seguintes códigos de status HTTP:

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Erro de validação
- `401`: Não autorizado
- `500`: Erro interno do servidor

