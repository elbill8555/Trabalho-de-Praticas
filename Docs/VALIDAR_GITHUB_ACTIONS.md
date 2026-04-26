# Guia de Validação - GitHub Actions Workflows

## ✅ Verificar se o Workflow está Ativado

### Passo 1: Acessar GitHub Actions
1. Vá para seu repositório: `https://github.com/seu-usuario/seu-repo`
2. Clique na aba **Actions** (entre Code, Pull Requests, Projects)
3. Você deve ver uma lista de workflows disponíveis:
   - ✅ Backend CI
   - ✅ Frontend CI
   - ✅ CI/CD Pipeline (deploy.yml)

### Passo 2: Verificar Status
Se nenhum workflow aparece na lista:
- **Problema**: Workflows talvez estejam desativados
- **Solução**:
  1. Vá para **Settings → Actions → General**
  2. Em "Actions permissions", selecione:
     - ✅ "Allow all actions and reusable workflows"
  3. Clique **Save**

### Passo 3: Disparar Workflow Manualmente
1. Vá para **Actions**
2. Selecione "Backend CI"
3. Clique **Run workflow**
4. Selecione a branch
5. Clique **Run workflow** novamente

---

## 🚀 Testar Workflows Localmente

### Opção A: Usando ACT (Recomendado)

#### 1. Instalar ACT
**Windows (PowerShell):**
```powershell
choco install act
# ou
scoop install act
```

**macOS:**
```bash
brew install act
```

**Linux:**
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
```

#### 2. Simular Workflow Localmente
```bash
# Testar backend-ci
cd "c:\Users\billa\OneDrive\Área de Trabalho\TrabalhoPraticas\Trabalho de Praticas\trabalho_praticas"
act push --job lint-and-test -W .github\workflows\backend-ci.yml

# Testar frontend-ci
act push --job lint-and-test -W .github\workflows\frontend-ci.yml

# Listar todos os workflows
act --list
```

**O que acontece:**
- ACT simula o ambiente Ubuntu do GitHub
- Executa cada step exatamente como faria no GitHub
- Mostra a saída em tempo real
- Qualquer falha é detectada localmente

---

### Opção B: Executar Comandos Manualmente

Se não quiser instalar ACT, execute os testes manualmente:

#### Backend:
```bash
cd "c:\Users\billa\OneDrive\Área de Trabalho\TrabalhoPraticas\Trabalho de Praticas\trabalho_praticas"

# 1. Instalar dependências
npm ci

# 2. Gerar Prisma Client
npm run postinstall --workspace=apps/backend

# 3. Lint
npm run lint --workspace=apps/backend

# 4. Testes
npm test --workspace=apps/backend

# 5. Build
npm run build --workspace=apps/backend
```

#### Frontend:
```bash
cd "c:\Users\billa\OneDrive\Área de Trabalho\TrabalhoPraticas\Trabalho de Praticas\trabalho_praticas"

# 1. Lint
npm run lint --workspace=apps/frontend

# 2. Build
npm run build --workspace=apps/frontend

# 3. Testes (se existir)
npm test --workspace=apps/frontend
```

---

## 📊 Dashboard de Status

### Verificar Execução no GitHub

1. **Vá para**: Seu repositório → **Actions**
2. **Veja**: Lista de execuções recentes com status
   - 🟢 Verde = Sucesso
   - 🔴 Vermelho = Falha
   - 🟡 Amarelo = Em andamento
   - ⚫ Cinza = Cancelled/Skipped

3. **Clique** em qualquer execução para ver detalhes:
   - Qual branch disparou
   - Quanto tempo levou
   - Qual step teve erro (se houver)
   - Output completo de logs

### Badge de Status (Adicionar ao README)

Para mostrar status do workflow no README:

```markdown
# Seu Projeto

[![Backend CI](https://github.com/seu-usuario/seu-repo/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/seu-usuario/seu-repo/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/seu-usuario/seu-repo/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/seu-usuario/seu-repo/actions/workflows/frontend-ci.yml)

Seu projeto tem CI/CD automático! 🎉
```

---

## ✅ Checklist de Validação

### Antes do Primeiro Commit

- [ ] Workflows estão no diretório `.github/workflows/`
  ```powershell
  Test-Path ".github\workflows\backend-ci.yml"
  Test-Path ".github\workflows\frontend-ci.yml"
  Test-Path ".github\workflows\deploy.yml"
  ```

- [ ] GitHub Actions está habilitado no repositório
  - Verificar em Settings → Actions → General

- [ ] Arquivo `package.json` tem scripts de teste
  ```json
  {
    "scripts": {
      "test": "npm test --workspace=apps/backend",
      "lint": "npm run lint --workspaces --if-present"
    }
  }
  ```

- [ ] Backend tem `jest.config.js`
  ```powershell
  Test-Path "apps\backend\jest.config.js"
  ```

- [ ] Backend tem arquivos `.spec.ts` para teste
  ```powershell
  Get-ChildItem -Recurse "apps\backend\src" -Filter "*.spec.ts"
  ```

---

## 🔍 Validar Cada Workflow

### 1. Validar Backend CI

**Arquivo**: `.github/workflows/backend-ci.yml`

```bash
# Testar localmente
npm ci
npm run postinstall --workspace=apps/backend
npm run lint --workspace=apps/backend
npm test --workspace=apps/backend
npm run build --workspace=apps/backend
```

**Status esperado**: Todos os comandos devem passar sem erro

---

### 2. Validar Frontend CI

**Arquivo**: `.github/workflows/frontend-ci.yml`

```bash
# Testar localmente
npm ci
npm run lint --workspace=apps/frontend
npm run build --workspace=apps/frontend
npm test --workspace=apps/frontend
```

**Status esperado**: Build e lint devem passar

---

### 3. Validar Deploy CI

**Arquivo**: `.github/workflows/deploy.yml`

⚠️ Este workflow requer secrets configurados:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_BACKEND_PROJECT_ID`
- `VERCEL_FRONTEND_PROJECT_ID`

**Para testar**:
1. Configure os secrets em Settings → Secrets and variables → Actions
2. Faça merge em `main`
3. Observe a execução em Actions

---

## 🐛 Debugar Falhas de Workflow

### Erro: "npm ci failed"
```
Error: Unable to resolve dependencies
```

**Solução**:
```bash
cd "Trabalho de Praticas\trabalho_praticas"
npm install
git add package-lock.json
git commit -m "update lockfile"
git push
```

---

### Erro: "jest: command not found"
```
/bin/sh: jest: command not found
```

**Verificar**:
- Backend tem Jest no devDependencies?
  ```powershell
  (Get-Content apps\backend\package.json) | Select-String "jest"
  ```

**Solução**:
```bash
cd apps/backend
npm install --save-dev jest
npm install --save-dev @types/jest
npm install --save-dev ts-jest
```

---

### Erro: "Prisma generate failed"
```
Error: Could not find Prisma schema
```

**Verificar**:
```powershell
Test-Path "apps\backend\prisma\schema.prisma"
```

**Solução**: Seu `schema.prisma` existe? Se não, crie:
```bash
cd apps/backend
npx prisma init
```

---

### Erro: "Timeout waiting for deployment"
Este é problema do Vercel, não do workflow. Verificar:
- Vercel tokens são válidos?
- Projeto de verdade existe na Vercel?

---

## 📈 Monitorar Cobertura de Testes

Backend gera automaticamente relatório de cobertura:

```bash
# Visualizar html
cd apps/backend/coverage/lcov-report
start index.html
```

---

## 🔐 Configurar Secrets para Deploy

Se quiser deployment automático em main para Vercel:

1. **Vá para**: Settings → Secrets and variables → Actions
2. **Clique**: "New repository secret"
3. **Adicione cada secret**:

```
VERCEL_TOKEN
Valor: seu_token_vercel (de https://vercel.com/account/tokens)

VERCEL_ORG_ID
Valor: ID da sua organização Vercel

VERCEL_BACKEND_PROJECT_ID
Valor: ID do projeto backend na Vercel

VERCEL_FRONTEND_PROJECT_ID
Valor: ID do projeto frontend na Vercel
```

---

## 📝 Exemplo Completo de Teste

### Cenário: Desenvolver novo feature

```bash
# 1. Criar branch nova
git checkout -b feature/nova-rota
git push -u origin feature/nova-rota

# 2. Fazer mudanças
# ... editar código ...

# 3. Testar localmente (simular workflow)
npm ci
npm run postinstall --workspace=apps/backend
npm test --workspace=apps/backend
npm run build --workspace=apps/backend

# 4. Commit e push
git add .
git commit -m "add nova rota com testes"
git push

# 5. GitHub Actions executará automaticamente:
# ✅ backend-ci.yml vai rodar testes
# ✅ frontend-ci.yml vai verificar frontend
# Se tudo passar ✅ → pronto para PR

# 6. Abrir Pull Request
# → Criar PR para main
# → backend-ci.yml e frontend-ci.yml rodam
# → deploy.yml aguarda merge

# 7. Merge em main
git checkout main
git pull
git merge feature/nova-rota
git push

# 8. Deploy automático
# → deploy.yml executa
# → se testes passarem
# → Backend faz deploy para Vercel
# → Frontend faz deploy para Vercel
```

---

## ✨ Resumo de Status Atual

| Item | Status | Local | GitHub | Ação |
|------|--------|-------|--------|------|
| Backend CI | ✅ | Testado | Pronto | Nenhuma |
| Frontend CI | ✅ | Testado | Pronto | Nenhuma |
| Deploy | ⚠️ | OK | Ínativo | Configurar Secrets |
| Jest Testes | ✅ | Ativo | Ativo | Nenhuma |
| ESLint | ✅ | Ativo | Ativo | Nenhuma |

---

## 🎓 Ressources Úteis

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [ACT Documentation](https://nektosact.com/)
- [Context expressions in workflows](https://docs.github.com/en/actions/learn-github-actions/contexts)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Última atualização**: 26 de Abril de 2026  
Para dúvidas, consulte `GITHUB_ACTIONS_CI_CD.md`
