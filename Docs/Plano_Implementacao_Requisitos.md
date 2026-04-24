# Plano de Implementação de Requisitos da Banca (RNF-04, RNF-05, RF2)

Este documento detalha o que será implementado para fechar as **lacunas** no relatório de avaliação, respeitando estritamente a exigência de **não alterar a estrutura de diretórios atual do repositório**.

## 1. Testabilidade e Manutenção (RNF-05)

Como atualmente não há cobertura formal de testes automatizados, implementaremos o ecossistema Jest no Backend.

### Objetivos:
- Adicionar testes de unidade e um mínimo de testes de integração, cobrindo ao menos 60% dos principais controllers e serviços.

### Passos:
1. Instalar as dependências dev: `@nestjs/testing`, `jest`, `@types/jest`, `ts-jest`.
2. Configurar o arquivo `jest.config.js` no `apps/backend/`.
3. Atualizar o script de `package.json` de `"test": "echo 'No tests yet'"` para `"test": "jest"`.
4. Criar as seguintes suítes de testes isoladas:
- `auth.service.spec.ts`
- `tasks.service.spec.ts`
- `projects.service.spec.ts`

Nestes arquivos utilizaremos `jest.mock` sobre instâncias do `PrismaService` e `ClerkStrategy` para evitar chamadas reais à API do Clerk/DB e garantir tempos de execução rápidos.

---

## 2. Observabilidade e Rastreabilidade (RNF-04)

Buscando padronizar "registros, correlação e consulta de eventos", usaremos o pacote de mercado `Winston` integrado ao NestJS e um Middleware global de correlação.

### Objetivos:
- Substituir o `.log` padrão (Console) por logs persistentes em JSON, correlacionando toda request e response através de um ID trace.

### Passos:
1. Instalar dependências: `winston`, `nest-winston`.
2. Criar módulo para formatação (onde todos os logs sairão com padrão `{ "timestamp", "level", "message", "correlationId", "context" }`).
- `src/modules/logger/logger.config.ts`
- `src/middlewares/request-id.middleware.ts`
3. Este middleware vai interceptar globalmente a requisição, gerar um `req.id = uuidv4()`, para que qualquer erro disparado em `Tasks`, `Projects` ou afins possa ser perfeitamente auditado conforme os RNF da especificação.

---

## 3. Segundo Fluxo Completo de Negócios (RF1 e RF2)

O relatório indicou que Gestão de Projetos e Tarefas correspondem a **apenas um** fluxo, pontuando mal o sistema para "Fluxos múltiplos".

### Objetivos:
Adicionar um fluxo de "Equipe/Colaboradores de Projetos". O dono de um projeto pode gerenciar quem mais pode ter acesso ou ver tarefas do projeto. Isso engloba regras de API e persistência, demonstrando clara maturidade na implementação de multi-tenant / sharing.

### Passos:
#### Modificações de Banco de Dados (`schema.prisma`)
Vamos adicionar um model `ProjectMember`:
```prisma
model ProjectMember {
  id        String   @id @default(uuid())
  role      String   @default("MEMBER")
  projectId String
  userId    String
  createdAt DateTime @default(now())

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@map("project_members")
}
```

#### Criação de APIs
- `src/modules/projects/members.controller.ts`
- `src/modules/projects/members.service.ts`

1. Rotas serão criadas para `POST /projects/:id/members` e `GET /projects/:id/members`.
2. A criação de um membro disparará um e-mail do resend informando "Você foi adicionado ao projeto X" (Completando o fluxo E2E, envolvendo banco + background service local + notificação).

---

## Processo de Verificação (Verification Plan)

### Testes Automatizados (Automated Tests)
- Será executado `npm run test` e `npm run test:e2e` (se implementado) certificando que todos passem com 0 falhas.

### Verificação Manual
- Enviar as requisições via curl ou postman para criar um membro novo num projeto.
- Analisar a saída do terminal para verificar as formatação JSON da nova Observabilidade utilizando um fake Error param.
- Rodar migrações do Prisma com segurança visualizando os resultados aplicados ao banco via Supabase na Web.
