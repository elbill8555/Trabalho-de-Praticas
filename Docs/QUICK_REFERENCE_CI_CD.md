# 🚀 QUICK REFERENCE - GitHub Actions

## ⚡ TL;DR (Muito Longo; Não Li)

**Está tudo configurado!** Seus testes rodam automaticamente a cada novo commit.

```
✅ Commit → GitHub Actions ativa → Testes rodam → Resultado aparece em Actions tab
```

---

## 📁 Arquivos Principais

```
.github/
└── workflows/
    ├── backend-ci.yml        ← Testa backend (TODOS branches)
    ├── frontend-ci.yml       ← Testa frontend (TODOS branches)
    └── deploy.yml            ← Deploy automático (main only)
```

---

## 🔄 Fluxo Automático

### Você faz um commit em qualquer branch:
```
git push → GitHub detects push
         → Executa backend-ci.yml   (se backend mudou)
         → Executa frontend-ci.yml  (se frontend mudou)
         → Mostra resultado em Actions
```

### Se for main:
```
git push main → Todos testes rodam
              → Se tudo ✅ OK, deploy automático executa
              → Backend + Frontend fazem deploy em Vercel
```

---

## 📊 Testes Atuais

```
✅ 10 test suites
✅ 49 testes
✅ Todos passando
⏱️  ~15-20 segundos
```

---

## 🖥️ Testar Localmente

```bash
# Backend
npm ci
npm run postinstall --workspace=apps/backend
npm test --workspace=apps/backend
# Resultado: ✅ All tests passed

# Frontend
npm run build --workspace=apps/frontend
# Resultado: ✅ Built successfully
```

---

## 📍 Ver Status no GitHub

1. Vai para seu repo
2. Click **Actions** tab
3. Vê lista de execuções com status (🟢 ou 🔴)

---

## ⚠️ Deploy em Vercel (Opcional)

Se quiser deploy automático em `main`:

Vá para **Settings → Secrets and variables → Actions**

Adicione:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_BACKEND_PROJECT_ID`
- `VERCEL_FRONTEND_PROJECT_ID`

Sem isso: testes rodam normal, deploy não funciona.

---

## 🐛 Problema? Veja aqui

| Problema | Solução |
|----------|---------|
| Workflows não aparecem | Settings → Actions → "Allow all actions" |
| Testes falhando | `npm ci && npm test --workspace=apps/backend` |
| GitHub Actions não roda | Verifique `.github/workflows/` exist |
| Deploy não funciona | Configure secrets do Vercel |

---

## 📚 Documentação Completa

Vá para `/Docs/`:
- `SUMARIO_CI_CD.md` - Este resumo
- `GITHUB_ACTIONS_CI_CD.md` - Documentação detalhada
- `VALIDAR_GITHUB_ACTIONS.md` - Troubleshooting
- `VALIDACAO_FINAL_CI_CD.md` - Resultado final

---

**Pronto?** Faça seu próximo commit e veja GitHub Actions em ação! 🎉
