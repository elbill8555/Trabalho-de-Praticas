# 🎬 GUIA PASSO A PASSO - Seu Primeiro Commit com CI/CD

Siga estes passos para ver seu novo GitHub Actions em ação!

---

## 🎯 Objetivo

Fazer um commit que dispare os workflows de CI/CD e ver os testes rodando automaticamente.

---

## 📝 Passo 1: Criar uma Nova Branch

```powershell
# Abra PowerShell na pasta do projeto
cd "c:\Users\billa\OneDrive\Área de Trabalho\TrabalhoPraticas\Trabalho de Praticas\trabalho_praticas"

# Crie uma nova branch para teste
git checkout -b test/ci-validation

# Confirme que você está na nova branch
git branch
```

**Esperado**: Você vê `* test/ci-validation`

---

## 📝 Passo 2: Fazer uma Pequena Mudança

Edite qualquer arquivo pequeno:

```powershell
# Opção A: Criar arquivo novo
echo "# Test CI" > test-ci.md
git add test-ci.md

# Opção B: Editar arquivo existente
# (use seu editor favorito)
```

---

## 📝 Passo 3: Fazer Commit e Push

```powershell
git commit -m "test: validate CI/CD workflow"
git push origin test/ci-validation
```

**Esperado**: 
```
remote: Create a pull request for 'test/ci-validation' on GitHub by visiting:
remote:      https://github.com/seu-usuario/seu-repo/pull/new/test/ci-validation
```

---

## 🌐 Passo 4: Ir para GitHub e Ver os Workflows

1. **Vá para seu repositório** no GitHub:
   ```
   https://github.com/seu-usuario/seu-repo
   ```

2. **Clique na aba "Actions"**
   - Deve estar entre "Code", "Pull requests", etc.

3. **Você verá uma lista de execuções**:
   ```
   ✅ Backend CI #123
   ✅ Frontend CI #123
   ```

---

## 📊 Passo 5: Acompanhar em Tempo Real

1. **Clique em "Backend CI"** (a primeira execução)

2. **Veja cada step executando**:
   ```
   ✅ Checkout Code
   ✅ Setup Node.js 20
   ⏳ Install Dependencies (em progresso)
   ⏳ Run Lint
   ⏳ Run Backend Unit Tests
   ...
   ```

3. **Cor da barra**:
   - 🟡 Amarela = Em progresso
   - 🟢 Verde = Sucesso ✅
   - 🔴 Vermelha = Falha ❌

---

## ✅ Passo 6: Ver o Resultado Final

Após ~20 segundos:

```
✅ Backend CI - All checks passed
   ├─ Checkout Code (1s)
   ├─ Setup Node.js (2s)
   ├─ Install Dependencies (10s)
   ├─ Generate Prisma Client (2s)
   ├─ Run Lint (2s)
   ├─ Run Backend Unit Tests (7s) ← TESTES AQUI
   ├─ Generate Coverage (1s)
   ├─ Upload Coverage (1s)
   └─ Build Backend (2s)
```

---

## 🔍 Passo 7: Inspecionar Logs dos Testes

1. **Clique em "Run Backend Unit Tests"**

2. **Veja a saída**:
   ```
   > npm test --workspace=apps/backend
   
   PASS  src/modules/auth/auth.controller.spec.ts
   PASS  src/modules/users/users.controller.spec.ts
   ...
   
   Test Suites: 10 passed, 10 total
   Tests:       49 passed, 49 total
   ```

3. **Procure por qualquer ❌ erro**

---

## 📱 Passo 8: Frontend CI

A mesma coisa acontece com **Frontend CI**:

```
✅ Frontend CI - All checks passed
   ├─ Checkout Code
   ├─ Setup Node.js
   ├─ Install Dependencies
   ├─ Run Lint
   ├─ Build Frontend
   └─ Run Tests (se houver)
```

---

## 🎉 Passo 9: Criar um Pull Request

Se tudo passou ✅:

1. **GitHub oferecerá um botão**:
   ```
   "Create a pull request"
   ```

2. **Clique nele**

3. **Preencha o PR**:
   - Título: "Test CI/CD workflow"
   - Descrição: "Validando workflows"

4. **Clique "Create pull request"**

5. **GitHub rodará os testes novamente**

---

## 🚀 Passo 10: Merge e Deploy

Se você tiver permissão em `main`:

1. **Vá para o PR**

2. **Clique "Merge pull request"**

3. **GitHub automaticamente**:
   - ✅ Roda backend-ci.yml
   - ✅ Roda frontend-ci.yml
   - ✅ Se tudo OK, roda deploy.yml (se secrets configurados)

---

## 🎯 Checklist

- [ ] Git push feito
- [ ] Actions tab aberto
- [ ] backend-ci.yml visto
- [ ] frontend-ci.yml visto
- [ ] "Run Backend Unit Tests" clicado
- [ ] "Test Suites: 10 passed" visto
- [ ] "Tests: 49 passed" visto
- [ ] Nenhum erro ❌
- [ ] Frontend CI também visto
- [ ] PR criado

---

## 🐛 Se Algo Não Funcionar

### Workflows não aparecem?
```
Vá para: Settings → Actions → General
Selecione: "Allow all actions and reusable workflows"
Clique: Save
```

### Testes falhando?
```powershell
# Rode localmente para debugar
cd "..\trabalho_praticas"
npm ci
npm test --workspace=apps/backend
```

### Não vê nenhuma execução?
```
1. Certifique-se que fez `git push` (não apenas local)
2. Aguarde 30-60 segundos
3. Recarregue a página Actions (F5)
4. Verifique branch name está correto
```

---

## 📸 Exemplo de Tela

Quando tudo funciona, você vê:

```
┌─────────────────────────────────────────────────────┐
│ Actions                                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ✅ Backend CI #42                                   │
│    test/ci-validation                              │
│    Completed successfully in 18s                    │
│                                                     │
│ ✅ Frontend CI #42                                  │
│    test/ci-validation                              │
│    Completed successfully in 12s                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎓 O Que Você Aprendeu

✅ Como disparar GitHub Actions  
✅ Como ver execução em tempo real  
✅ Como inspecionar logs de testes  
✅ Como ver resultados (passou/falhou)  
✅ Como criar um PR com CI  
✅ Como fazer merge (deploy automático)  

---

## 🎉 Pronto para Seu Real Workflow!

Agora que você viu funcionando:

1. **Desenvolva normalmente** em sua feature branch
2. **Faça commits** sem medo (testes rodam automaticamente)
3. **Veja os resultados** em Actions
4. **Crie PR** quando quiser feedback
5. **Merge em main** (deploy automático entra em ação)

---

## 📚 Mais Informações

Se quiser entender melhor:

- `QUICK_REFERENCE_CI_CD.md` - Referência rápida
- `GITHUB_ACTIONS_CI_CD.md` - Documentação técnica
- `VALIDAR_GITHUB_ACTIONS.md` - Para quando algo falhar

Todos em `/Docs/`

---

**Tempo estimado para completar**: 5-10 minutos  
Dificuldade: ⭐ (super fácil)  
Resultado: 🎉 (muito satisfatório!)

Boa sorte! 🚀
