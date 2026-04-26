# Arquitetura do Fluxo de Gerenciamento de Membros de Projetos

Diagrama visual e explicação detalhada do sistema de membros de projetos implementado.

---

## 🏗️ Arquitetura Alta

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js)                      │
│  Login → Dashboard → Projects → Select Project → Manage Members │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP API
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API REST (NestJS Backend)                     │
├─────────────────────────────────────────────────────────────────┤
│  POST   /api/v1/projects/:projectId/members                      │
│  GET    /api/v1/projects/:projectId/members                      │
│  PATCH  /api/v1/projects/:projectId/members/:userId              │
│  DELETE /api/v1/projects/:projectId/members/:userId              │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ↓             ↓             ↓
    ┌─────────────────┐ ┌──────────┐ ┌──────────────┐
    │ PrismaService   │ │MailService│ │ LoggerService│
    │ (Database ORM)  │ │(Resend)  │ │(Winston)     │
    └─────────────────┘ └──────────┘ └──────────────┘
                │             │             │
                ↓             ↓             ↓
    ┌─────────────────┐ ┌──────────┐ ┌──────────────┐
    │   PostgreSQL    │ │  Resend  │ │ Log Files    │
    │   Database      │ │  Email   │ │ (JSON)       │
    └─────────────────┘ └──────────┘ └──────────────┘
```

---

## 📑 Estrutura de Dados

### Modelo: ProjectMember

```
ProjectMember {
  id:        UUID          ← Identificador único
  role:      ProjectRole   ← OWNER | ADMIN | MEMBER | VIEWER
  userId:    UUID (FK)     ← Referência ao User
  projectId: UUID (FK)     ← Referência ao Project
  createdAt: DateTime      ← Timestamp de criação
  
  Relations:
  - user:    User (N:1)
  - project: Project (N:1)
  
  Constraints:
  - UNIQUE(userId, projectId)
  - CASCADE delete em user e project
}
```

### Modelo: ProjectRole (Enum)

```
ProjectRole {
  OWNER   → Criador do projeto, controle total
  ADMIN   → Pode gerenciar membros e tarefas
  MEMBER  → Pode ver e criar tarefas
  VIEWER  → Acesso de leitura apenas
}
```

---

## 🔄 Fluxo de Dados: Adicionar Novo Membro

```
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 1: Frontend envia requisição                               │
├──────────────────────────────────────────────────────────────────┤
POST /api/v1/projects/{projectId}/members
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "email": "novo_usuario@exemplo.com",
  "role": "MEMBER"
}
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 2: Backend autentica e valida                             │
├──────────────────────────────────────────────────────────────────┤
1. JwtAuthGuard valida token
2. Extrai req.user.id do token
3. Passa para ProjectMembersController
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 3: Controller delega para Service                          │
├──────────────────────────────────────────────────────────────────┤
controller.addMember(requesterId, { email, role, projectId })
  └─→ service.addMember(requesterId, dto)
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 4: Service valida permissões                              │
├──────────────────────────────────────────────────────────────────┤
Busca: Projeto existe? {projectId}
       Verificação DB: SELECT * FROM projects WHERE id = ?

Valida: requesterId é OWNER ou ADMIN?
  - Se project.userId === requesterId → OWNER (aprovado)
  - Se EXISTS (projectMembers.role IN ['OWNER','ADMIN']) → aprovado
  - Senão → ❌ 403 ForbiddenException
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 5: Service busca usuário pelo email                       │
├──────────────────────────────────────────────────────────────────┤
DB Query: SELECT id, name, email FROM users WHERE email = ?
Response: { id: 'user-uuid', name: 'João', email: '...' }

Valida: Usuário existe?
  - Se não encontrado → ❌ 404 NotFoundException
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 6: Service verifica duplicação                             │
├──────────────────────────────────────────────────────────────────┤
DB Query: SELECT * FROM project_members 
          WHERE userId = ? AND projectId = ?

Valida: Já é membro?
  - Se encontrado → ❌ 409 ConflictException
  - Se não → ✅ Prossegue
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 7: Service insere novo membro no BD                       │
├──────────────────────────────────────────────────────────────────┤
DB Insert:
  INSERT INTO project_members (id, role, userId, projectId, createdAt)
  VALUES ('uuid', 'MEMBER', 'user-uuid', 'project-uuid', NOW())

Response: {
  id: 'member-uuid',
  role: 'MEMBER',
  userId: 'user-uuid',
  projectId: 'project-uuid',
  createdAt: '2026-04-26T12:00:00Z',
  user: { id, name, email },
  project: { name }
}
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 8: Service envia email de notificação                     │
├──────────────────────────────────────────────────────────────────┤
mailService.sendCustomEmail(
  email: 'novo_usuario@exemplo.com',
  subject: 'Você foi adicionado ao projeto [Nome]',
  html: '<div>Bem-vindo...</div>'
)
  ├─→ Resend API Call (se RESEND_API_KEY configurado)
  │   └─→ Email enviado ✉️
  └─→ Mock mode (se não tiver key)
      └─→ Log: [MOCK EMAIL] sent
      
⚠️ Nota: Se email falhar, não interrompe a operação
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 9: Logger registra operação (RNF-04)                      │
├──────────────────────────────────────────────────────────────────┤
{
  "timestamp": "2026-04-26T12:00:00.000Z",
  "level": "info",
  "message": "Email sent to user@example.com for project membership",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "context": "ProjectMembersService",
  "method": "addMember",
  "duration": "245ms"
}
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 10: Backend responde para Frontend                        │
├──────────────────────────────────────────────────────────────────┤
HTTP 201 Created
Content-Type: application/json

{
  "id": "member-uuid",
  "role": "MEMBER",
  "userId": "user-uuid",
  "projectId": "project-uuid",
  "createdAt": "2026-04-26T12:00:00Z",
  "user": {
    "id": "user-uuid",
    "name": "João Silva",
    "email": "joao@exemplo.com"
  },
  "project": {
    "name": "Projeto X"
  }
}
└──────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  ETAPA 11: Frontend processa resposta                            │
├──────────────────────────────────────────────────────────────────┤
- Mostra mensagem de sucesso
- Atualiza lista de membros
- Redireciona ou fecha modal
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Matriz de Controle de Acesso (RBAC)

```
┌────────────────┬──────────┬───────┬────────┬────────┐
│    Ação        │  OWNER   │ ADMIN │ MEMBER │ VIEWER │
├────────────────┼──────────┼───────┼────────┼────────┤
│ Listar membros │    ✅    │  ✅   │   ✅   │   ✅   │
│ Adicionar      │    ✅    │  ✅   │   ❌   │   ❌   │
│ Atualizar role │    ✅    │  ✅   │   ❌   │   ❌   │
│ Remover        │    ✅    │  ✅   │   ❌   │   ❌   │
│ Ver tarefas    │    ✅    │  ✅   │   ✅   │   ✅   │
│ Criar tarefa   │    ✅    │  ✅   │   ✅   │   ❌   │
│ Editar tarefa  │    ✅    │  ✅   │   ✅   │   ❌   │
└────────────────┴──────────┴───────┴────────┴────────┘
```

---

## 📧 Fluxo de Email

```
┌─────────────────────────────────────────┐
│  Novo membro adicionado                 │
└─────────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│  mailService.sendCustomEmail()           │
│  - email: novo_usuario@ex.com           │
│  - subject: "Você foi adicionado..."    │
│  - html: <div>HTML Formatado</div>      │
└─────────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│  sendEmail() privado                    │
│  - Formata headers                      │
│  - Detecta test mode (MAIL_TEST_MODE)   │
│  - Prepara payload                      │
└─────────────────────────────────────────┘
              │
        ┌─────┴─────┐
        ↓           ↓
   ┌────────┐  ┌──────────┐
   │ Modo   │  │ Modo     │
   │ Real   │  │ Mock     │
   └────────┘  └──────────┘
        │           │
        ↓           ↓
   Resend API   Console Log
        │           │
   [enviado]    [logged]
```

---

## 📊 Sequência de Validações

```
Requisição Chegando
        │
        ↓
[1] JWT válido? ────── Não ───→ 401 Unauthorized
        │ Sim
        ↓
[2] Projeto existe? ──── Não ───→ 404 Not Found
        │ Sim
        ↓
[3] Usuário é OWNER/ADMIN? ── Não ───→ 403 Forbidden
        │ Sim
        ↓
[4] Email existe? ──── Não ───→ 404 Not Found
        │ Sim
        ↓
[5] Já é membro? ──── Sim ───→ 409 Conflict
        │ Não
        ↓
[6] Inserir no BD ──→ Sucesso? ── Não ───→ 500 Error
        │ Sim
        ↓
[7] Enviar email ──→ (Não interrompe se falhar)
        │
        ↓
[8] Responder 201 Created ✅
```

---

## 🗄️ Operações de BD Geradas

### Para adicionar membro:
```sql
-- 1. Validar projeto e permissões
SELECT * FROM projects WHERE id = $1;
SELECT * FROM project_members WHERE projectId = $1 AND userId = $2;

-- 2. Find user
SELECT * FROM users WHERE email = $1;

-- 3. Check duplicate
SELECT * FROM project_members 
WHERE userId = $1 AND projectId = $2;

-- 4. Insert member
INSERT INTO project_members (id, role, userId, projectId, createdAt)
VALUES (gen_random_uuid(), $1, $2, $3, NOW());
```

### Para listar membros:
```sql
SELECT pm.*, u.id, u.name, u.email 
FROM project_members pm
JOIN users u ON pm.userId = u.id
WHERE pm.projectId = $1
ORDER BY pm.createdAt ASC;
```

### Para atualizar role:
```sql
UPDATE project_members 
SET role = $1 
WHERE id = $2 
RETURNING *;
```

### Para remover membro:
```sql
DELETE FROM project_members 
WHERE userId = $1 AND projectId = $2;
```

---

## 🎯 Regras de Negócio Aplicadas

1. **Propriedade**: Apenas OWNER e ADMIN podem gerenciar membros
2. **Unicidade**: Um usuário não pode ser adicionado duas vezes ao mesmo projeto
3. **Autodeleção**: Não é permitido remover o OWNER primário via membro
4. **Auto-alteração**: Não é permitido alterar seu próprio papel
5. **Cascata**: Deletando um projeto, todos os project_members são deletados
6. **Email**: Não falha operação se email não for enviado

---

## 🔍 Rastreabilidade (Correlation ID)

Toda operação é rastreada:

```
Cliente              Backend              Database          Email
  │                    │                     │              │
  ├─POST /projects/... │                     │              │
  │                    │                     │              │
  │                    ├─ Gera: unique ID    │              │
  │                    │ (Correlation ID)    │              │
  │                    │            correlationId=abc123
  │                    │
  │                    ├─ Query SELECT       │              │
  │                    │ [trace: abc123]     │              │
  │                    │                     ├─ Executa     │
  │                    │                     │ [trace: abc123
  │                    │                     ├─ log
  │                    │
  │                    ├─ INSERT             │              │
  │                    │ [trace: abc123]     │              │
  │                    │                     ├─ Executa     │
  │                    │                     │ [trace: abc123]
  │                    │
  │                    ├─ sendEmail()        │              │
  │                    │                     │              ├─ Send
  │                    │                     │              │ [trace: abc123]
  │                    │                     │              ├─ Log
  │                    │
  │                    ├─ Log final          │              │
  │                    │ [trace: abc123]     │              │
  │                    │ [duration: 245ms]   │              │
  │
  │<────── 201 Created ─────────────────────────────────────
  │        [trace: abc123]
```

Todos os logs relacionados àquela operação compartilham o mesmo ID!

---

**Arquitetura implementada com sucesso! 🎉**
