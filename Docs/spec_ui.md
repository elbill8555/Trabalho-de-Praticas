Atue como: Designer de UX

Objetivo: Ajude-me a criar a "Especificação de UI" para um novo produto de software.

Contexto:

[inclua aqui a prd.md]

no diretório stitch existe um arquivo code.html que contém a especificação de UI, use ele como base para criar a especificação de UI.

Resultado esperado:
- Definição da especificação de UI (spec_ui.md) com a seguinte estrutura:


# Especificação de UI

## Interfaces gráficas

[listagem das interfaces gráficas]

INT-01 - Tela de Login
INT-02 - Tela de Cadastro
INT-03 - Dashboard (Visão Geral)
INT-04 - Lista de Tarefas
INT-05 - Criação/Edição de Tarefa
INT-06 - Gestão de Projetos
INT-07 - Perfil do Usuário

### INT-[identificador] - [título da interface gráfica]

- [tipo de contêiner (ex.: página, tabela, formulário etc.)]
- **Campos:** [lista de campos]
- **Botões:** [lista de botões]
- **Links:** [lista de links]
- **Considerações:** informações complementares relevantes

INT-01 - Tela de Login
Página
Campos:
Email
Senha
Botões:
Entrar
Entrar com Google
Links:
Criar conta
Esqueci minha senha
Considerações:
Feedback visual para erro de autenticação
Loader durante requisição
Validação em tempo real

INT-02 - Tela de Cadastro
Página
Campos:
Nome
Email
Senha
Confirmar senha
Botões:
Criar conta
Links:
Já tenho conta
Considerações:
Validação forte de senha
Feedback claro de erros
Indicação de sucesso no cadastro

INT-03 - Dashboard (Visão Geral)
Página
Campos:
Lista de tarefas (resumo)
Projetos ativos
Indicadores (tarefas concluídas, pendentes)
Botões:
Nova tarefa
Novo projeto
Links:
Ver todas as tarefas
Ver projetos
Considerações:
Interface limpa e foco em produtividade
Prioridade visual para tarefas urgentes
Uso de cores para status (pendente, em andamento, concluído)

INT-04 - Lista de Tarefas
Página / Tabela
Campos:
Título da tarefa
Status
Prioridade
Data de vencimento
Botões:
Criar tarefa
Filtrar
Links:
Editar tarefa
Considerações:
Filtros por status, prioridade e data
Ordenação por prazo
Possibilidade de visualização em lista ou kanban (futuro)

INT-05 - Criação/Edição de Tarefa
Formulário (modal ou página)
Campos:
Título
Descrição
Data de vencimento
Prioridade
Projeto vinculado
Botões:
Salvar
Cancelar
Links:
Voltar
Considerações:
Interface simples e rápida
Suporte a edição inline
Autofocus no campo título

INT-06 - Gestão de Projetos
Página
Campos:
Nome do projeto
Lista de tarefas vinculadas
Botões:
Criar projeto
Links:
Acessar projeto
Considerações:
Organização clara por contexto
Agrupamento visual de tarefas

INT-07 - Perfil do Usuário
Página
Campos:
Nome
Email
Preferências
Botões:
Salvar alterações
Logout
Links:
Alterar senha
Considerações:
Simplicidade
Foco em configurações essenciais

---

## Fluxo de Navegação

[listagem dos componentes visuais e fluxo de navegação]

Fluxo principal do usuário:

Usuário acessa a aplicação
Tela de Login
Se não possui conta → Cadastro
Após login → Dashboard
Do Dashboard pode:
Criar nova tarefa
Visualizar tarefas
Criar/gerenciar projetos

Fluxo de tarefas:

Dashboard → Lista de Tarefas → Criar tarefa → Salvar → Retorna para lista atualizada

Fluxo de projetos:

Dashboard → Projetos → Criar projeto → Adicionar tarefas

Navegação global:

Menu lateral (sidebar):
Dashboard
Tarefas
Projetos
Perfil

---

## Diretrizes para IA

[detalhes de como a IA deve interpretar o documento].

Priorizar interfaces simples e minimalistas
Evitar sobrecarga cognitiva (menos é mais)
Manter consistência visual entre telas
Usar padrões conhecidos (UX familiar)
Priorizar ações principais (ex: criar tarefa)
Feedback imediato ao usuário (ações, erros, sucesso)
Garantir responsividade (mobile-first quando possível)
Acessibilidade:
Contraste adequado
Navegação por teclado
Labels claros