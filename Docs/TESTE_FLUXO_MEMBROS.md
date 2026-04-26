# Teste do Fluxo de Gerenciamento de Membros de Projetos (RF2)

Este documento guia o teste da funcionalidade de gerenciamento de membros de projetos, implementada para fechar a lacuna do "Segundo Fluxo Completo de Negócios".

## 📋 Recursos Implementados

1. **Modelo de Dados**: `ProjectMember` com suporte a múltiplas funções (OWNER, ADMIN, MEMBER, VIEWER)
2. **Rotas de API**:
   - `POST /api/v1/projects/:projectId/members` - Adicionar novo membro
   - `GET /api/v1/projects/:projectId/members` - Listar membros do projeto
   - `PATCH /api/v1/projects/:projectId/members/:userId` - Atualizar papel do membro
   - `DELETE /api/v1/projects/:projectId/members/:userId` - Remover membro
3. **Notificações**: Email automático ao adicionar novo membro usando Resend
4. **Segurança**: Validação de permissões (apenas OWNER/ADMIN podem gerenciar membros)

---

## 🧪 Pré-requisitos

- Backend rodando em `http://localhost:3001`
- Frontend rodando em `http://localhost:3000`
- Banco de dados PostgreSQL configurado e atualizado
- Token JWT válido (obtido após login)

---

## 📝 Casos de Teste

### 1. Adicionar Novo Membro ao Projeto

**Endpoint**: `POST /api/v1/projects/:projectId/members`

**Headers**:
```
Authorization: Bearer <SEU_JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "colaborador@exemplo.com",
  "role": "MEMBER"
}
```

**Response Esperado (201)**:
```json
{
  "id": "uuid-do-membro",
  "role": "MEMBER",
  "userId": "uuid-do-usuario",
  "projectId": "uuid-do-projeto",
  "createdAt": "2026-04-26T...",
  "user": {
    "id": "uuid-do-usuario",
    "name": "Nome do Colaborador",
    "email": "colaborador@exemplo.com"
  },
  "project": {
    "name": "Nome do Projeto"
  }
}
```

**Email Enviado**: 
O novo membro recebe um email com a mensagem: "Você foi adicionado ao projeto [Nome do Projeto]"

---

### 2. Listar Membros do Projeto

**Endpoint**: `GET /api/v1/projects/:projectId/members`

**Headers**:
```
Authorization: Bearer <SEU_JWT_TOKEN>
```

**Response Esperado (200)**:
```json
[
  {
    "id": "uuid-1",
    "role": "OWNER",
    "createdAt": "2026-04-01T...",
    "user": {
      "id": "uuid-owner",
      "name": "Proprietário",
      "email": "owner@exemplo.com"
    }
  },
  {
    "id": "uuid-2",
    "role": "MEMBER",
    "createdAt": "2026-04-26T...",
    "user": {
      "id": "uuid-membro",
      "name": "Novo Membro",
      "email": "colaborador@exemplo.com"
    }
  }
]
```

---

### 3. Atualizar Papel do Membro

**Endpoint**: `PATCH /api/v1/projects/:projectId/members/:userId`

**Headers**:
```
Authorization: Bearer <SEU_JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "role": "ADMIN"
}
```

**Response Esperado (200)**:
```json
{
  "id": "uuid-do-membro",
  "role": "ADMIN",
  "userId": "uuid-do-usuario",
  "projectId": "uuid-do-projeto",
  "createdAt": "2026-04-26T..."
}
```

**Valores válidos para `role`**: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`

---

### 4. Remover Membro do Projeto

**Endpoint**: `DELETE /api/v1/projects/:projectId/members/:userId`

**Headers**:
```
Authorization: Bearer <SEU_JWT_TOKEN>
```

**Response Esperado (200)**:
```json
{
  "message": "Member removed successfully"
}
```

---

## 🔒 Cenários de Permissão

### ✅ Operações Permitidas

1. **OWNER do projeto** pode:
   - Adicionar novos membros
   - Atualizar papéis de qualquer membro (exceto o OWNER principal)
   - Remover qualquer membro (exceto o OWNER principal)

2. **ADMIN** pode:
   - Adicionar novos membros
   - Atualizar papéis de membros
   - Remover membros

3. **MEMBER** pode:
   - Visualizar lista de membros
   - Não pode gerenciar membros

4. **VIEWER** pode:
   - Visualizar lista de membros
   - Não pode gerenciar membros

### ❌ Operações Bloqueadas

```
GET /api/v1/projects/{projectId}/members - sem estar no projeto
→ 403 Forbidden: "You do not have access to this project members list"

POST /api/v1/projects/{projectId}/members - sendo MEMBER
→ 403 Forbidden: "Only owners and admins can add members"

DELETE /api/v1/projects/{projectId}/members/{userOwnerId} - remover OWNER
→ 403 Forbidden: "The primary project owner cannot be removed as a member"

PATCH /api/v1/projects/{projectId}/members/{ownerId} - mudar papel do OWNER
→ 403 Forbidden: "You cannot change your own role"
```

---

## 🔧 Procedimento de Teste Manual (via cURL/Postman)

### Passo 1: Login e Obter Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@exemplo.com",
    "password": "sua_senha"
  }'
```

Copie o `token` da resposta.

### Passo 2: Obter ID do Projeto

```bash
curl http://localhost:3001/api/v1/projects \
  -H "Authorization: Bearer SEU_TOKEN"
```

Copie o `id` do projeto que deseja usar.

### Passo 3: Adicionar Novo Membro

```bash
curl -X POST http://localhost:3001/api/v1/projects/{projectId}/members \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo_usuario@exemplo.com",
    "role": "MEMBER"
  }'
```

### Passo 4: Verificar Email Enviado

No log do backend, procure por:
```
[LOG] Email sent to novo_usuario@exemplo.com for project membership
```

Ou, em modo MOCK (se RESEND_API_KEY não estiver configurado):
```
[LOG] [MOCK EMAIL] To: novo_usuario@exemplo.com | Subject: Você foi adicionado ao projeto...
```

### Passo 5: Listar Membros

```bash
curl http://localhost:3001/api/v1/projects/{projectId}/members \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📊 Verificação de Observabilidade

Com a integração de Winston + Correlation ID, toda operação gera logs estruturados:

```json
{
  "timestamp": "2026-04-26T12:00:00.000Z",
  "level": "info",
  "message": "POST /api/v1/projects/uuid/members",
  "correlationId": "trace-uuid",
  "context": "ProjectMembersController",
  "method": "POST",
  "statusCode": 201,
  "duration": "245ms"
}
```

Procure por estes logs no backend para verificar:
- ✅ Sucesso na operação
- ✅ Emails enviados com sucesso
- ❌ Erros de permissão/validação

---

## ✨ Fluxo E2E Completo

1. **Usuário A** cria um projeto "Projeto X"
2. **Usuário A** acessa `POST /projects/{id}/members`
3. **Usuário A** adiciona **Usuário B** como MEMBER
4. **Usuário B** recebe email: "Você foi adicionado ao projeto Projeto X"
5. **Usuário B** faz login e vê o projeto na sua lista
6. **Usuário B** acessa `GET /projects/{id}/members` e vê a lista completa
7. **Usuário A** promove **Usuário B** para ADMIN
8. **Usuário B** agora pode adicionar mais membros
9. **Usuário A** remove **Usuário B** do projeto

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Email não é enviado | Verifique se `RESEND_API_KEY` está configurado no `.env` |
| 403 Forbidden ao adicionar membro | Confirme que você é OWNER ou ADMIN do projeto |
| Usuário não encontrado | O email deve existir no banco (registado via `/auth/register`) |
| Membro já existe | Não pode adicionar o mesmo usuário duas vezes ao projeto |

---

## 📌 Resumo da Implementação

- **Schema Prisma**: Model `ProjectMember` com relacionamento N-N entre User e Project
- **Controller**: 4 rotas REST devidamente estruturadas
- **Serviço**: Lógica de negócio com validações de permissão
- **Email**: Integração com Resend para notificações automáticas
- **Observabilidade**: Logs estruturados com Winston + Correlation ID

Todos os requisitos do item 3 do Plano de Implementação foram alcançados! 🎉
