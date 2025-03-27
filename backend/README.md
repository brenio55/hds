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
  "detalhes": {
    "data_vencimento": "2024-04-15",
    "pagamento": "pix",
    "obra_id": 1,
    "observacoes": "Aluguel referente ao mês de abril"
  }
}
```

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "valor": "1500.50",
  "detalhes": {
    "data_vencimento": "2024-04-15",
    "pagamento": "pix",
    "obra_id": 1,
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
  "detalhes": {
    "data_vencimento": "2024-05-15",
    "pagamento": "ted",
    "obra_id": 1,
    "observacoes": "Aluguel referente ao mês de maio"
  }
}
```

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
  - Valores permitidos: `id`, `valor`, `detalhes`, `created_at`
- `valor`: Valor para filtrar (opcional)

**Resposta de Sucesso:**
```json
[
  {
    "id": 1,
    "valor": "1600.00",
    "detalhes": {
      "data_vencimento": "2024-05-15",
      "pagamento": "ted",
      "obra_id": 1,
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
    "detalhes": {
      "data_vencimento": "2024-04-15",
      "pagamento": "pix",
      "obra_id": 1,
      "observacoes": "Aluguel referente ao mês de abril"
    }
  }'

# Atualizar aluguel
curl -X PUT http://localhost:3000/api/alugueis/1 \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 1600.00,
    "detalhes": {
      "data_vencimento": "2024-05-15",
      "pagamento": "ted",
      "obra_id": 1,
      "observacoes": "Aluguel referente ao mês de maio"
    }
  }'

# Listar todos os aluguéis
curl http://localhost:3000/api/alugueis \
  -H "Authorization: Bearer seu_token"

# Buscar por valor específico
curl "http://localhost:3000/api/alugueis?campo=valor&valor=1500.50" \
  -H "Authorization: Bearer seu_token"

# Buscar por texto nas observações
curl "http://localhost:3000/api/alugueis?campo=detalhes&valor=abril" \
  -H "Authorization: Bearer seu_token"
```

**Observações:**
- O campo `detalhes` deve seguir a estrutura exata definida acima
- O campo `pagamento` aceita apenas os valores "pix" ou "ted"
- `obra_id` deve ser um ID válido existente na tabela de obras
- `data_vencimento` deve estar no formato YYYY-MM-DD
- Valores monetários são armazenados com 2 casas decimais
- Buscas em `detalhes` são case-insensitive e parciais
- Buscas por `valor` são exatas
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

Endpoint que centraliza e retorna dados de pedidos de compra, locação e serviços com seus relacionamentos.

```http
GET /api/pedidos-consolidados
```

**Headers:**
```http
Authorization: Bearer seu_token
```

**Resposta de Sucesso:**
```json
{
  "total": 123,
  "pedidos": [
    {
      "tipo": "compra", // Tipo pode ser: "compra", "locacao" ou "servico"
      "id": 9,
      "created_at": "2025-03-23T16:10:52.645Z",
      "ativo": true,
      "data_vencimento": "2025-03-23T00:00:00.000Z",
      "ddl": 30,
      "desconto": "0.00",
      "valor_frete": "0.00",
      "despesas_adicionais": "0.00",
      "dados_adicionais": "",
      "materiais": [],
      "frete": {
        "tipo": "CIF",
        "valor": 0
      },
      // Dados do fornecedor relacionado
      "fornecedor": {
        "id": 1,
        "razao_social": "NOME TESTE DE FORNECEDOR",
        "cnpj": "12.123.123/0001-00",
        "endereco": "ENDEREÇO TESTE",
        "telefone": "81231231231",
        // ... outros dados do fornecedor
      },
      // Dados do cliente relacionado (se houver)
      "cliente": {
        "id": "2",
        "RazaoSocial": "Empresa Teste LTDA",
        "CNPJ": "12.345.678/0001-90",
        "Endereço": "Rua Teste, 123",
        // ... outros dados do cliente
      },
      // Dados da proposta relacionada (se houver)
      "proposta": {
        "id": 1,
        "descricao": "Proposta Teste",
        // ... outros dados da proposta
      }
    }
    // ... mais pedidos
  ]
}
```

**Observações:**
- Os pedidos são retornados ordenados por data de criação (mais recentes primeiro)
- O campo `tipo` indica a origem do pedido: "compra", "locacao" ou "servico"
- Relacionamentos não encontrados retornam `null`
- Datas são retornadas no formato ISO 8601
- O endpoint consolida dados das tabelas:
  - pedido_compra
  - pedido_locacao
  - servico
  - fornecedores
  - clientInfo
  - propostas

**Exemplo de Uso:**
```bash
# Listar todos os pedidos consolidados
curl -X GET http://localhost:3000/api/pedidos-consolidados \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json"
```

**Exemplo com token específico:**
```bash
curl -X GET http://localhost:3000/api/pedidos-consolidados \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ1c2VybmFtZSI6Imp1bGlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQzMDQwNzQ4LCJleHAiOjE3NDMxMjcxNDh9._ZgL7I7Fem0jw7Nqq4Bd4beSIRGwgFbYEnS9neqS2q0" \
  -H "Content-Type: application/json"
```

