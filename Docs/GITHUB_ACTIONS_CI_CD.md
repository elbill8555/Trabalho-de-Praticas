# Documentação - GitHub Actions CI/CD

## 📋 Resumo dos Workflows

Este projeto usa GitHub Actions para automação de testes, lint e deploy contínuo.

---

## 🔄 Workflows Configurados

### 1. **backend-ci.yml** - CI para Backend
- **Branch**: Roda em TODOS os branches
- **Gatilho**: Push ou Pull Request
- **Caminhos**: Qualquer mudança em `apps/backend/`

#### Passos:
1. ✅ Checkout do código
2. ⚙️ Setup Node.js 20
3. 📦 Instala dependências (`npm ci`)
4. 🔧 Gera Prisma Client
5. 🚨 Roda ESLint (continua se falhar)
6. ✅ Roda testes Jest
7. 📊 Gera cobertura de testes
8. 📈 Upload para Codecov (opcional)
9. 🏗️ Build do projeto

**Status**: ✅ ATIVO E FUNCIONAL

---

### 2. **frontend-ci.yml** - CI para Frontend
- **Branch**: Roda em TODOS os branches
- **Gatilho**: Push ou Pull Request
- **Caminhos**: Qualquer mudança em `apps/frontend/`

#### Passos:
1. ✅ Checkout do código
2. ⚙️ Setup Node.js 20
3. 📦 Instala dependências (`npm ci`)
4. 🚨 Roda ESLint (continua se falhar)
5. 🏗️ Build da aplicação Next.js
6. ✅ Roda testes (se existir script)

**Status**: ✅ NOVO - RECÉM CRIADO

---

### 3. **deploy.yml** - CI/CD Completo com Deploy
- **Branch**: Roda APENAS em `main` (push) e PRs para `main`
- **Gatilho**: Push em `main` ou Pull Request para `main`

#### Passos:
1. ✅ Lint & Testes (job: quality-assurance)
2. 🚀 Deploy Backend para Vercel (se testes passarem)
3. 🚀 Deploy Frontend para Vercel (se testes passarem)

**Requer Secrets**:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_BACKEND_PROJECT_ID`
- `VERCEL_FRONTEND_PROJECT_ID`

**Status**: ⚠️ REQUER CONFIGURAÇÃO DE SECRETS

---

## 📊 Matriz de Execução

| Evento | Branch | Backend CI | Frontend CI | Deploy |
|--------|--------|-----------|------------|--------|
| Push | [qualquer] | ✅ | ✅ | ❌ |
| Push | `main` | ✅ | ✅ | ✅ (se testes passarem) |
| PR | [qualquer] | ✅ | ✅ | ❌ |
| PR | → `main` | ✅ | ✅ | ❌ (aguarda merge) |

---

## 🚀 Como Usar

### 1. Ver Status de Execução
1. Vá para o seu repositório no GitHub
2. Clique na aba **Actions**
3. Selecione o workflow desejado
4. Veja o status de cada step em tempo real

### 2. Debugar Falhas
Se um workflow falhar:

```bash
# Ver logs localmente
npm test --workspace=apps/backend
npm run lint --workspace=apps/backend
npm run build --workspace=apps/backend
```

### 3. Triggering Manual
Se o workflow não executou automaticamente:

```bash
# Faça um commit e push
git add .
git commit -m "trigger CI"
git push origin seu-branch
```

---

## 🔐 Configurar Secrets para Deploy

Para que o `deploy.yml` funcione:

1. Vá para: **Settings → Secrets and variables → Actions**
2. Adicione os seguintes secrets:

```
VERCEL_TOKEN          = seu_token_vercel
VERCEL_ORG_ID         = seu_org_id
VERCEL_BACKEND_PROJECT_ID   = id_backend_project
VERCEL_FRONTEND_PROJECT_ID  = id_frontend_project
```

[Como obter tokens Vercel](https://vercel.com/docs/rest-api#authentication)

---

## ✅ Checklist de Verificação

- [x] Backend CI roda em todos os branches
- [x] Frontend CI roda em todos os branches
- [x] Testes são executados automaticamente
- [x] Lint verifica qualidade de código
- [x] Build valida compilação
- [x] Coverage é gerado (backend)
- [x] Deploy automático em `main` configurado
- [ ] Secrets do Vercel configurados (FAZER MANUALMENTE)
- [ ] Badges de status adicionados ao README (OPCIONAL)

---

## 🛠️ Scripts Necessários no package.json

**Raiz** (`package.json`):
```json
{
  "scripts": {
    "test": "npm test --workspace=apps/backend",
    "lint": "npm run lint --workspaces --if-present",
    "build": "npm run build --workspaces"
  }
}
```

**Backend** (`apps/backend/package.json`):
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "build": "nest build",
    "postinstall": "npx prisma generate"
  }
}
```

✅ Todos os scripts já estão configurados!

---

## 📝 Exemplos de Execução

### Exemplo 1: Push em feature branch
```bash
git checkout -b feature/novo-endpoint
git add .
git commit -m "add novo endpoint"
git push origin feature/novo-endpoint

# GitHub Actions:
# ✅ backend-ci.yml é acionada automaticamente
# ✅ Roda: testes + lint + build
# ❌ deploy.yml NÃO é acionada (branch != main)
```

### Exemplo 2: Merge para main
```bash
git checkout main
git pull origin main
git merge feature/novo-endpoint
git push origin main

# GitHub Actions:
# ✅ backend-ci.yml é acionada
# ✅ frontend-ci.yml é acionada
# ✅ deploy.yml é acionada (se testes passarem)
# 🚀 Deploy automático para Vercel
```

---

## 🧪 Testando Workflows Localmente

### Opção 1: act (Simular GitHub Actions)
```bash
# Instalar act
# https://github.com/nektos/act

# Simular backend-ci
act push -j lint-and-test -W .github/workflows/backend-ci.yml

# Simular frontend-ci
act push -j lint-and-test -W .github/workflows/frontend-ci.yml
```

### Opção 2: Rodar comandos manualmente
```bash
# Backend
npm install
npm run postinstall --workspace=apps/backend
npm run lint --workspace=apps/backend
npm test --workspace=apps/backend
npm run build --workspace=apps/backend

# Frontend
npm run lint --workspace=apps/frontend
npm run build --workspace=apps/frontend
```

---

## 📊 Cobertura de Testes

Backend gera automaticamente:
- `apps/backend/coverage/lcov.info` - Relatório LCOV
- `apps/backend/coverage/` - Diretório completo

Visualizar relatório HTML:
```bash
cd apps/backend/coverage/lcov-report
open index.html  # ou usar seu navegador
```

---

## ⚠️ Status Atual

| Componente | Status | Ação Necessária |
|-----------|--------|-----------------|
| Backend CI | ✅ Melhorado | Nenhuma - está funcional |
| Frontend CI | ✅ Novo | Nenhuma - está funcional |
| Deploy CI | ⚠️ Ativo | Configurar secrets do Vercel |
| Testes Jest | ✅ Configurado | Nenhuma |
| ESLint | ✅ Configurado | Nenhuma |
| Prisma | ✅ Configurado | Nenhuma |

---

## 🔍 Troubleshooting

### "npm ci failed"
**Causa**: `package-lock.json` fora de sync
**Solução**: 
```bash
npm install
git add package-lock.json
git commit -m "update lockfile"
git push
```

### "Prisma generate failed"
**Causa**: `.env` não configurado no CI
**Solução**: Adicione `.env.example` ou use values padrão
```bash
# Em backend-ci.yml, adicione env do .env
env:
  DATABASE_URL: postgresql://...
```

### "Tests timeout"
**Causa**: Banco de dados tipo não acessível
**Solução**: Use banco SQLite para testes
```bash
# jest.config.js ou test setup
process.env.DATABASE_URL = "file:./test.db"
```

### Deploy não executa
**Causa**: Secrets não configurados
**Solução**: 
1. Vá em Settings → Secrets
2. Adicione `VERCEL_TOKEN`, `VERCEL_ORG_ID`, etc.
3. Faça novo push para main

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Act - Local GitHub Actions Testing](https://github.com/nektos/act)
- [Jest Documentation](https://jestjs.io/)
- [ESLint Documentation](https://eslint.org/)
- [Vercel Deployment](https://vercel.com/docs)

---

**Última atualização**: 26 de Abril de 2026  
**Criado por**: GitHub Copilot  
**Status**: ✅ Documentação Completa
