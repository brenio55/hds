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
  "valor_final": "10000,50",
  "proposta_itens": [
    {
      "nome": "Cabeamento estruturado Cat6",
      "qtdUnidadeDeMedida": "M",
      "qtdUnidades": "150",
      "valor_unitario": 12.50,
      "valor_total": 1875.00
    },
    {
      "nome": "Switch 24 portas gerenciável",
      "qtdUnidadeDeMedida": "UN",
      "qtdUnidades": "2",
      "valor_unitario": 650.00,
      "valor_total": 1300.00
    }
  ]
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
- `proposta_itens`: Array - Lista de itens individuais da proposta

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
  },
  "proposta_itens": [
    {
      "nome": "Cabeamento estruturado Cat6",
      "qtdUnidadeDeMedida": "M",
      "qtdUnidades": "150",
      "valor_unitario": 12.50,
      "valor_total": 1875.00
    },
    {
      "nome": "Switch 24 portas gerenciável",
      "qtdUnidadeDeMedida": "UN",
      "qtdUnidades": "2",
      "valor_unitario": 650.00,
      "valor_total": 1300.00
    }
  ]
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
    "valor_final": "10000,50",
    "proposta_itens": [
      {
        "nome": "Cabeamento estruturado Cat6",
        "qtdUnidadeDeMedida": "M",
        "qtdUnidades": "150",
        "valor_unitario": 12.50,
        "valor_total": 1875.00
      },
      {
        "nome": "Switch 24 portas gerenciável",
        "qtdUnidadeDeMedida": "UN",
        "qtdUnidades": "2",
        "valor_unitario": 650.00,
        "valor_total": 1300.00
      }
    ]
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

### Fornecedores

#### Criar Fornecedor
```http
POST /api/fornecedores
```

**Headers:**
```http
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "razao_social": "Empresa LTDA",
  "cnpj": "12345678000199",
  "inscricao_estadual": "123456789",
  "inscricao_municipal": "987654321",
  "telefone": "1122334455",
  "celular": "11999887766",
  "endereco": "Rua Exemplo, 123",
  "cep": "12345678",
  "municipio_uf": "São Paulo/SP",
  "email": "contato@empresa.com",
  "contato": "João Silva",
  "obs": "Observações importantes"
}
```

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "razao_social": "Empresa LTDA",
  "cnpj": "12345678000199",
  "inscricao_estadual": "123456789",
  "inscricao_municipal": "987654321",
  "telefone": "1122334455",
  "celular": "11999887766",
  "endereco": "Rua Exemplo, 123",
  "cep": "12345678",
  "municipio_uf": "São Paulo/SP",
  "email": "contato@empresa.com",
  "contato": "João Silva",
  "obs": "Observações importantes",
  "created_at": "2024-03-21T10:00:00Z"
}
```

#### Listar Fornecedores
```http
GET /api/fornecedores
```

#### Buscar Fornecedor por ID
```http
GET /api/fornecedores/{id}
```

#### Atualizar Fornecedor
```http
PUT /api/fornecedores/{id}
```

### Pedidos de Compra

#### Criar Pedido de Compra
```http
POST /api/pedidos-compra
```

**Headers:**
```http
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "clientinfo_id": 1,
  "fornecedores_id": 1,
  "ddl": 30,
  "data_vencimento": "2024-04-21",
  "proposta_id": 1,
  "materiais": [
    {
      "item": 1,
      "descricao": "Material A",
      "uni": "pç",
      "quantidade": 10,
      "ipi": 5,
      "valor_unit": 100.00,
      "valor_total": 1000.00,
      "porcentagem": 10,
      "data_entrega": "2024-04-01"
    }
  ],
  "desconto": 5.00,
  "valor_frete": 150.00,
  "despesas_adicionais": 50.00,
  "dados_adicionais": "Informações adicionais",
  "frete": {
    "tipo": "CIF",
    "valor": 150.00
  }
}
```

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "clientinfo_id": 1,
  "fornecedores_id": 1,
  "ddl": 30,
  "data_vencimento": "2024-04-21",
  "proposta_id": 1,
  "materiais": [...],
  "desconto": 5.00,
  "valor_frete": 150.00,
  "despesas_adicionais": 50.00,
  "dados_adicionais": "Informações adicionais",
  "frete": {...},
  "created_at": "2024-03-21T10:00:00Z"
}
```

#### Listar Pedidos de Compra
```http
GET /api/pedidos-compra
```

#### Buscar Pedido de Compra por ID
```http
GET /api/pedidos-compra/{id}
```

#### Gerar/Baixar PDF do Pedido
```http
GET /api/pedidos-compra/{id}/pdf/download
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Resposta:**
- Content-Type: application/pdf
- O arquivo PDF será baixado automaticamente

**Exemplo de Uso:**
```bash
# Baixar PDF do pedido
curl -O -J -L http://localhost:3000/api/pedidos-compra/1/pdf/download \
  -H "Authorization: Bearer seu_token"
```

#### Visualizar PDF do Pedido
```http
GET /api/pedidos-compra/{id}/pdf
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Resposta:**
- Content-Type: application/pdf
- O PDF será exibido no navegador

**Exemplo de Uso:**
```bash
curl http://localhost:3000/api/pedidos-compra/1/pdf \
  -H "Authorization: Bearer seu_token"
```

#### Atualizar Pedido de Compra
```http
PUT /api/pedidos-compra/{id}
```

**Headers:**
```http
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "clientinfo_id": 1,
  "fornecedores_id": 1,
  "ddl": 30,
  "data_vencimento": "2024-04-21",
  "proposta_id": 1,
  "materiais": [
    {
      "item": 1,
      "descricao": "Material A",
      "uni": "pç",
      "quantidade": 10,
      "ipi": 5,
      "valor_unit": 100.00,
      "valor_total": 1000.00,
      "porcentagem": 10,
      "data_entrega": "2024-04-01"
    }
  ],
  "desconto": 5.00,
  "valor_frete": 150.00,
  "despesas_adicionais": 50.00,
  "dados_adicionais": "Informações adicionais",
  "frete": {
    "tipo": "CIF",
    "valor": 150.00
  }
}
```

**Exemplo de Uso:**
```bash
curl -X PUT http://localhost:3000/api/pedidos-compra/1 \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "clientinfo_id": 1,
    "fornecedores_id": 1,
    "ddl": 30,
    "data_vencimento": "2024-04-21",
    ...
  }'
```

**Observações:**
- O endpoint de PDF (/pdf/download) retorna o arquivo para download
- O endpoint /pdf exibe o PDF diretamente no navegador
- Ambos os endpoints de PDF geram o arquivo automaticamente se não existir
- O PDF é gerado com base no template definido em src/templates/pedido_compra1.html

### Pedidos de Locação

#### Criar Pedido de Locação
```http
POST /api/pedidos-locacao
```

**Headers:**
```http
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "fornecedor_id": 1,
  "clientInfo_id": 1,
  "proposta_id": 1,
  "itens": [
    {
      "descricao": "Item 1",
      "quantidade": 2,
      "valor_unitario": 100.00,
      "valor_total": 200.00
    }
  ],
  "total_bruto": 1000.00,
  "total_ipi": 100.00,
  "total_descontos": 50.00,
  "frete": 75.00,           // Valor do frete (anteriormente valor_frete)
  "outras_despesas": 25.00,
  "total_final": 1150.00,
  "informacoes_importantes": "Informações importantes aqui",
  "cond_pagto": "30 dias",
  "prazo_entrega": "2024-04-30"
}
```

**Exemplo de uso com curl:**
```bash
curl -X POST \
  'http://localhost:3000/api/pedidos-locacao' \
  -H 'Authorization: Bearer seu_token_jwt' \
  -H 'Content-Type: application/json' \
  -d '{
    "fornecedor_id": 1,
    "clientInfo_id": 1,
    "proposta_id": 1,
    "itens": [...],
    "total_bruto": 1000.00,
    "total_ipi": 100.00,
    "total_descontos": 50.00,
    "frete": 75.00,
    "outras_despesas": 25.00,
    "total_final": 1150.00,
    "informacoes_importantes": "Informações importantes aqui",
    "cond_pagto": "30 dias",
    "prazo_entrega": "2024-04-30"
  }'
```

**Observações:**
- O campo `valor_frete` foi substituído por `frete` para manter consistência com outros endpoints
- O valor do frete deve ser enviado como número decimal
- Internamente, o valor é armazenado na coluna `valor_frete` do banco de dados

### Aluguéis

#### Criar Aluguel
```http
POST /api/alugueis
```

**Headers:**
```http
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "valor": 1500.50,
  "proposta_id": 1,
  "detalhes": {
    "data_vencimento": "2024-04-15",
    "pagamento": "pix",
    "observacoes": "Aluguel referente ao mês de abril"
  }
}
```

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "valor": "1500.50",
  "proposta_id": 1,
  "proposta_descricao": "Proposta de construção residencial",
  "detalhes": {
    "data_vencimento": "2024-04-15",
    "pagamento": "pix",
    "observacoes": "Aluguel referente ao mês de abril"
  },
  "created_at": "2024-03-21T10:00:00Z"
}
```

#### Atualizar Aluguel
```http
PUT /api/alugueis/{id}
```

**Headers:**
```http
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "valor": 1600.00,
  "proposta_id": 1,
  "detalhes": {
    "data_vencimento": "2024-05-15",
    "pagamento": "ted",
    "observacoes": "Aluguel referente ao mês de maio - atualizado"
  }
}
```

#### Deletar Aluguel
```http
DELETE /api/alugueis/{id}
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Exemplos de Uso:**
```bash
# Atualizar aluguel
curl -X PUT http://localhost:3000/api/alugueis/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VybmFtZSI6Imp1bGlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQzNjg0NjU5LCJleHAiOjE3NDM3NzEwNTl9.hun0weCbplhr9lT55DaTk2V5OTvXNYqYdxH57Th7jes" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 1600.00,
    "proposta_id": 1,
    "detalhes": {
      "data_vencimento": "2024-05-15",
      "pagamento": "ted",
      "observacoes": "Aluguel referente ao mês de maio - atualizado"
    }
  }'

# Deletar aluguel
curl -X DELETE http://localhost:3000/api/alugueis/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VybmFtZSI6Imp1bGlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQzNjg0NjU5LCJleHAiOjE3NDM3NzEwNTl9.hun0weCbplhr9lT55DaTk2V5OTvXNYqYdxH57Th7jes"
```

**Observações:**
- Para atualizar um aluguel, é necessário enviar todos os campos obrigatórios
- O ID do aluguel deve ser especificado na URL
- A operação de delete é irreversível
- Ambas operações requerem autenticação via token JWT

#### Listar/Buscar Aluguéis
```http
GET /api/alugueis
GET /api/alugueis?campo={campo}&valor={valor}
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Parâmetros de Consulta:**
- `campo`: Campo para filtrar (opcional)
  - Valores permitidos: `id`, `valor`, `proposta_id`, `detalhes`, `created_at`
- `valor`: Valor para filtrar (opcional)

**Resposta de Sucesso:**
```json
[
  {
    "id": 1,
    "valor": "1600.00",
    "proposta_id": 1,
    "proposta_descricao": "Proposta de construção residencial",
    "detalhes": {
      "data_vencimento": "2024-05-15",
      "pagamento": "ted",
      "observacoes": "Aluguel referente ao mês de maio"
    },
    "created_at": "2024-03-21T10:00:00Z"
  }
]
```

**Exemplos de Uso:**
```bash
# Criar aluguel
curl -X POST http://localhost:3000/api/alugueis \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 1500.50,
    "proposta_id": 1,
    "detalhes": {
      "data_vencimento": "2024-04-15",
      "pagamento": "pix",
      "observacoes": "Aluguel referente ao mês de abril"
    }
  }'

# Buscar por valor específico
curl "http://localhost:3000/api/alugueis?campo=valor&valor=1500.50" \
  -H "Authorization: Bearer seu_token"

# Buscar por proposta_id
curl "http://localhost:3000/api/alugueis?campo=proposta_id&valor=1" \
  -H "Authorization: Bearer seu_token"

# Buscar por texto nas observações
curl "http://localhost:3000/api/alugueis?campo=detalhes&valor=abril" \
  -H "Authorization: Bearer seu_token"
```

**Observações:**
- O campo `detalhes` deve seguir a estrutura exata definida acima
- O campo `pagamento` aceita apenas os valores "pix" ou "ted"
- `proposta_id` deve ser um ID válido existente na tabela de propostas
- `data_vencimento` deve estar no formato YYYY-MM-DD
- Valores monetários são armazenados com 2 casas decimais
- Buscas em `detalhes` são case-insensitive e parciais
- Buscas por `valor` e `proposta_id` são exatas
- Datas são retornadas no formato ISO 8601

### Serviços

#### Criar Serviço

POST /api/servicos

**Headers:**
```
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "fornecedor_id": 1,
  "data_vencimento": "2024-04-21",
  "proposta_id": 1,
  "itens": {
    "descricao": "Serviço de Manutenção",
    "unidade": "hora",
    "quantidade": 40,
    "valor_total": 4000.00,
    "desconto": 200.00,
    "valor_unitario": 100.00,
    "ipi": 5,
    "unidades": 40,
    "data_entrega": "2024-05-01",
    "valor_frete": 150.00,
    "outras_despesas": 100.00,
    "informacao_importante": "Serviço com garantia de 90 dias",
    "condicao_pagamento": "30/60/90 dias",
    "prazo_maximo": "2024-05-15",
    "escopo": "Manutenção preventiva e corretiva",
    "afazer_contratante": [
      "Disponibilizar acesso ao local",
      "Fornecer documentação necessária"
    ],
    "afazer_contratada": [
      "Realizar diagnóstico",
      "Executar manutenção",
      "Emitir relatório técnico"
    ]
  }
}
```

**Exemplos de Uso:**
```bash
# Criar serviço
curl -X POST http://localhost:3000/api/servicos \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "fornecedor_id": 1,
    "data_vencimento": "2024-04-21",
    "proposta_id": 1,
    "itens": {
      "descricao": "Serviço de Manutenção",
      "unidade": "hora",
      "quantidade": 40,
      "valor_total": 4000.00,
      "desconto": 200.00,
      "valor_unitario": 100.00,
      "ipi": 5,
      "unidades": 40,
      "data_entrega": "2024-05-01",
      "valor_frete": 150.00,
      "outras_despesas": 100.00,
      "informacao_importante": "Serviço com garantia de 90 dias",
      "condicao_pagamento": "30/60/90 dias",
      "prazo_maximo": "2024-05-15",
      "escopo": "Manutenção preventiva e corretiva",
      "afazer_contratante": ["Disponibilizar acesso ao local"],
      "afazer_contratada": ["Realizar diagnóstico"]
    }
  }'

# Buscar por fornecedor específico
curl "http://localhost:3000/api/servicos?campo=fornecedor_id&valor=1" \
  -H "Authorization: Bearer seu_token"

# Buscar por data de vencimento
curl "http://localhost:3000/api/servicos?campo=data_vencimento&valor=2024-04-21" \
  -H "Authorization: Bearer seu_token"

# Buscar por texto na descrição dos itens
curl "http://localhost:3000/api/servicos?campo=itens&valor=Manutenção" \
  -H "Authorization: Bearer seu_token"
```

**Observações:**
- O campo `itens` deve seguir a estrutura exata definida acima
- Datas devem estar no formato YYYY-MM-DD
- Valores monetários são armazenados com 2 casas decimais
- Buscas em `itens` são case-insensitive e parciais
- Buscas por IDs são exatas
- Datas são retornadas no formato ISO 8601

### Reembolsos

#### Criar Reembolso
```http
POST /api/reembolso
```

**Headers:**
```http
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "id_funcionarios": 1,
  "valor": 150.00,
  "prazo": "2024-04-01",
  "descricao": "Reembolso de despesas com transporte"
}
```

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "id_funcionarios": 1,
  "valor": 150.00,
  "prazo": "2024-04-01",
  "descricao": "Reembolso de despesas com transporte",
  "created_at": "2024-03-21T10:00:00Z"
}
```

#### Listar/Buscar Reembolsos
```http
GET /api/reembolso
GET /api/reembolso?campo={campo}&valor={valor}
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Parâmetros de Consulta:**
- `campo`: Campo para filtrar (opcional)
  - Valores permitidos: `id`, `id_funcionarios`, `valor`, `prazo`, `descricao`, `created_at`
- `valor`: Valor para filtrar (opcional)

**Exemplos de Consultas por Coluna:**
```bash
# Buscar por ID específico
curl "http://localhost:3000/api/reembolso?campo=id&valor=1" \
  -H "Authorization: Bearer seu_token"

# Buscar por ID do funcionário
curl "http://localhost:3000/api/reembolso?campo=id_funcionarios&valor=1" \
  -H "Authorization: Bearer seu_token"

# Buscar por valor específico
curl "http://localhost:3000/api/reembolso?campo=valor&valor=150.00" \
  -H "Authorization: Bearer seu_token"

# Buscar por prazo
curl "http://localhost:3000/api/reembolso?campo=prazo&valor=2024-04-01" \
  -H "Authorization: Bearer seu_token"

# Buscar por parte da descrição
curl "http://localhost:3000/api/reembolso?campo=descricao&valor=transporte" \
  -H "Authorization: Bearer seu_token"

# Buscar por data de criação
curl "http://localhost:3000/api/reembolso?campo=created_at&valor=2024-03-21" \
  -H "Authorization: Bearer seu_token"
```

**Exemplos de Uso Básicos:**
```bash
# Criar reembolso
curl -X POST http://localhost:3000/api/reembolso \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "id_funcionarios": 1,
    "valor": 150.00,
    "prazo": "2024-04-01",
    "descricao": "Reembolso de despesas com transporte"
  }'

# Listar todos os reembolsos
curl http://localhost:3000/api/reembolso \
  -H "Authorization: Bearer seu_token"

# Atualizar reembolso
curl -X PUT http://localhost:3000/api/reembolso/1 \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 200.00,
    "prazo": "2024-04-15",
    "descricao": "Reembolso de despesas com transporte - atualizado"
  }'

# Deletar reembolso
curl -X DELETE http://localhost:3000/api/reembolso/1 \
  -H "Authorization: Bearer seu_token"
```

### Funcionários

#### Criar Funcionário

POST /api/funcionarios

**Headers:**
```
Authorization: Bearer seu_token
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "nome": "João Silva",
  "cargo": "Engenheiro",
  "departamento": "Obras",
  "dados": {
    "email": "joao.silva@empresa.com",
    "telefone": "11999999999",
    "endereco": {
      "rua": "Rua Principal",
      "numero": "123",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01001-000"
    },
    "documentos": {
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9"
    }
  }
}
```

**Exemplos de Uso:**
```bash
# Criar funcionário
curl -X POST http://localhost:3000/api/funcionarios \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cargo": "Engenheiro",
    "departamento": "Obras",
    "dados": {
      "email": "joao.silva@empresa.com",
      "telefone": "11999999999",
      "endereco": {
        "rua": "Rua Principal",
        "numero": "123",
        "cidade": "São Paulo",
        "estado": "SP",
        "cep": "01001-000"
      },
      "documentos": {
        "cpf": "123.456.789-00",
        "rg": "12.345.678-9"
      }
    }
  }'

# Listar todos os funcionários
curl http://localhost:3000/api/funcionarios \
  -H "Authorization: Bearer seu_token"

# Buscar por ID específico
curl "http://localhost:3000/api/funcionarios?campo=id&valor=1" \
  -H "Authorization: Bearer seu_token"

# Buscar por nome
curl "http://localhost:3000/api/funcionarios?campo=nome&valor=João" \
  -H "Authorization: Bearer seu_token"

# Buscar por cargo
curl "http://localhost:3000/api/funcionarios?campo=cargo&valor=Engenheiro" \
  -H "Authorization: Bearer seu_token"

# Buscar por departamento
curl "http://localhost:3000/api/funcionarios?campo=departamento&valor=Obras" \
  -H "Authorization: Bearer seu_token"

# Buscar por dados (busca em campos JSON)
curl "http://localhost:3000/api/funcionarios?campo=dados&valor=joao.silva@empresa.com" \
  -H "Authorization: Bearer seu_token"

# Atualizar funcionário
curl -X PUT http://localhost:3000/api/funcionarios/1 \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "cargo": "Engenheiro Sênior",
    "departamento": "Projetos"
  }'

# Deletar funcionário
curl -X DELETE http://localhost:3000/api/funcionarios/1 \
  -H "Authorization: Bearer seu_token"
```

**Observações:**
- Datas devem estar no formato YYYY-MM-DD
- Valores monetários são armazenados com 2 casas decimais
- O campo `id_funcionarios` deve referenciar um funcionário existente
- Buscas por IDs são exatas
- Buscas por descrição são case-insensitive e parciais
- Datas são retornadas no formato ISO 8601
- Para todas as requisições é necessário incluir o token JWT no header `Authorization`

### Pedidos Consolidados

#### Endpoints

- `GET /api/pedidos-consolidados`: Lista todos os pedidos consolidados
- `GET /api/pedidos-consolidados/{proposta_id}`: Busca pedidos consolidados por ID da proposta

##### Exemplo de resposta para `/api/pedidos-consolidados/{proposta_id}`:

```json
{
  "proposta_id": "123",
  "valor_proposta": 10000.00,
  "pedidos": {
    "locacao": [
      {
        "id": 1,
        "total_bruto": 1000.00,
        "total_final": 950.00
      }
    ],
    "compra": [
      {
        "id": 2,
        "materiais": [
          {
            "valor_total": 500.00
          }
        ]
      }
    ],
    "servico": [
      {
        "id": 3,
        "itens": [
          {
            "valor_total": 750.00
          }
        ]
      }
    ]
  },
  "valor_pedidos": {
    "locacao": 1000.00,
    "compra": 500.00,
    "servico": 750.00
  },
  "valor_somado": 2250.00
}
```

##### Exemplo de uso com curl:

```bash
curl -X GET \
  'http://localhost:3000/api/pedidos-consolidados/123' \
  -H 'Authorization: Bearer seu_token_jwt'
```

O endpoint retorna:
- `valor_proposta`: Valor final da proposta
- `pedidos`: Lista de pedidos de cada tipo (locação, compra e serviço) associados à proposta
- `valor_pedidos`: Soma dos valores de cada tipo de pedido
- `valor_somado`: Soma total de todos os pedidos

## Faturamento

### Criar Faturamento

**Endpoint**: `POST /api/faturamentos`

**Headers**:
- `Authorization`: Bearer {token}
- `Content-Type`: application/json

**Corpo da Requisição**:

Para pagamento via Boleto:
```json
{
  "id_number": "81",
  "id_type": "compra",
  "valor_total_pedido": 1000.00,
  "valor_faturado": 30,
  "data_vencimento": "2025-04-17",
  "nf": "66468496846846",
  "pagamento": "boleto",
  "numero_boleto": "61651.65165.65165.165565.65165",
  "recebimento_anexo": "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9..."
}
```

Para pagamento via PIX ou TED:
```json
{
  "id_number": "81",
  "id_type": "compra",
  "valor_total_pedido": 1000.00,
  "valor_faturado": 30,
  "data_vencimento": "2025-04-17",
  "nf": "66468496846846",
  "pagamento": "pix",
  "dados_conta": "{\"banco\":\"Itaú\",\"agencia\":\"1234\",\"conta\":\"12345-6\",\"nome\":\"Empresa LTDA\",\"cnpj\":\"12.345.678/0001-00\"}",
  "recebimento_anexo": "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9..."
}
```

**Resposta de Sucesso**:
```json
{
  "id": 1,
  "id_number": "81",
  "id_type": "compra",
  "valor_total_pedido": 1000.00,
  "valor_faturado": 30,
  "valor_a_faturar": 700.00,
  "data_vencimento": "2025-04-17",
  "nf": "66468496846846",
  "pagamento": "boleto",
  "detalhes_pagamento": {
    "numero_boleto": "61651.65165.65165.165565.65165",
    "anexo_id": "anexo_123e4567-e89b-12d3-a456-426614174000.pdf"
  }
}
```

**Observações**:
- Campo `valor_faturado`: indica o percentual do valor total a ser faturado (0-100)
- Campo `valor_a_faturar`: é calculado automaticamente pelo sistema
- Campo `detalhes_pagamento`: é gerado automaticamente com base no tipo de pagamento
  - Para `boleto`: armazena o número do boleto
  - Para `pix`/`ted`: armazena os dados da conta
- Campo `recebimento_anexo`: deve ser enviado em formato base64 com o prefixo `data:application/pdf;base64,`
- O arquivo anexo será salvo com um prefixo UUID (`anexo_{uuid}.pdf`)

### Obter Anexo de Faturamento

**Endpoint**: `GET /api/faturamentos/:id/anexo`

**Headers**:
- `Authorization`: Bearer {token}

**Resposta de Sucesso**: Arquivo do anexo (normalmente um PDF)

## Detalhes sobre o campo proposta_itens

### Estrutura
O campo `proposta_itens` foi adicionado para permitir a especificação detalhada dos itens que compõem uma proposta. Cada item possui os seguintes campos:

- `nome`: Nome ou descrição do item (obrigatório)
- `qtdUnidadeDeMedida`: Unidade de medida (ex: "M" para metros, "UN" para unidades, "VB" para verba)
- `qtdUnidades`: Quantidade de unidades
- `valor_unitario`: Preço por unidade
- `valor_total`: Valor total do item (calculado automaticamente se não for fornecido)

### Funcionalidades

1. **Cálculo Automático**: 
   - Se `valor_total` não for especificado, ele será calculado como `valor_unitario * qtdUnidades`
   - Se `valor_final` da proposta não for especificado, ele será calculado como a soma de todos os `valor_total` dos itens

2. **PDF Gerado**:
   - No PDF da proposta, os itens serão exibidos em uma tabela detalhada na seção "5. VALORES E CONDIÇÕES DE PAGAMENTO"
   - A tabela mostrará o nome, unidade de medida, quantidade, valor unitário e valor total de cada item
   - Se não houver itens na proposta, será exibida uma tabela simplificada apenas com o valor final

3. **Busca Avançada**:
   - É possível buscar propostas pelo conteúdo dos itens usando `item.campo=valor`
   - Exemplo: `GET /api/propostas/search?item.nome=Switch` para buscar propostas que incluam um item contendo "Switch" no nome