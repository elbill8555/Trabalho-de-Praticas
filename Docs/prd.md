Atue como: Product Manager Sênior.

Objetivo: Ajude-me a criar o "Product Requirements Document" (PRD) para um novo produto de software.

Contexto:

[inclua aqui a descrição do problema]

Resultado esperado:
- Definição do PRD (prd.md) com a seguinte estrutura:

# Definição de Requisitos do Produto (PRD)

## Descrição do produto

**Problema** Profissionais que lidam com múltiplas tarefas e projetos enfrentam dificuldades para organizar, priorizar e acompanhar suas atividades em ferramentas fragmentadas ou complexas, resultando em baixa produtividade, sobrecarga mental e perda de prazos.

**Solução** Uma plataforma centralizada de gestão de tarefas e produtividade que oferece visualização clara das atividades, priorização inteligente e acompanhamento de desempenho, permitindo maior controle e eficiência na execução do trabalho.


Para o **[público-alvo]** [ganhos para público-alvo].

Para o profissional do conhecimento (arquitetos, designers, engenheiros, freelancers e gestores), o produto proporciona organização estruturada da rotina, clareza de prioridades e melhoria consistente na produtividade.

Nossos Diferenciais:

- Interface simples e intuitiva com foco em usabilidade
- Visualização clara de prioridades (alta, média, baixa)
- Dashboard com métricas de produtividade (ex: velocity)
- Integração entre tarefas, calendário e projetos
- Redução de sobrecarga cognitiva com organização centralizada

---

## Perfis de Usuário

[lista de usuários]

### [usuário 1] Profissional Técnico (ex: Arquiteto/Designer)

- Problemas: dificuldade em organizar tarefas de múltiplos projetos e prazos simultâneos
- Objetivos: manter controle das atividades e cumprir deadlines com qualidade
- Dados demográficos: 25–45 anos, ensino superior, atua em projetos técnicos
- Motivações: eficiência, organização e previsibilidade no trabalho
- Frustrações: ferramentas confusas ou excesso de apps desconectados

Freelancer / Autônomo

- Problemas: dificuldade em gerenciar tarefas de diferentes clientes
- Objetivos: organizar demandas e manter consistência nas entregas
- Dados demográficos: 20–40 anos, trabalho remoto ou híbrido
- Motivações: produtividade e gestão do próprio tempo
- Frustrações: perda de controle sobre prazos e tarefas

Gestor de Projetos
- Problemas: falta de visibilidade clara sobre progresso e tarefas da equipe
- Objetivos: acompanhar entregas e garantir cumprimento de prazos
- Dados demográficos: 28–50 anos, liderança de equipes
- Motivações: controle, previsibilidade e performance da equipe
- Frustrações: falta de métricas claras e acompanhamento eficiente

---

## Principais Funcionalidades

[lista de funcionalidades]

### RFN-[número] [título da funcionalidade]

RFN-01 Criação e Gestão de Tarefas
Permitir criar, editar, excluir e visualizar tarefas
Atribuir título, descrição, data e contexto
Critérios de Aceitação:

Usuário consegue criar tarefa em até 2 cliques
Tarefa aparece imediatamente na lista
Edição em tempo real sem reload

RFN-02 Priorização de Tarefas
Classificação por níveis (Alta, Média, Baixa)
Critérios de Aceitação:

Usuário consegue alterar prioridade facilmente
Prioridades são exibidas visualmente (cores/labels)

RFN-03 Dashboard de Produtividade
Exibição de métricas como tarefas concluídas e performance
Critérios de Aceitação:

Dashboard mostra dados atualizados automaticamente
Usuário visualiza progresso semanal/mensal

RFN-04 Organização por Status
Separação de tarefas em: pendentes, concluídas e arquivadas
Critérios de Aceitação:

Usuário pode marcar tarefa como concluída
Tarefa muda automaticamente de estado

RFN-05 Integração com Calendário
Visualização de tarefas por data
Critérios de Aceitação:

Tarefas com data aparecem no calendário
Alterações refletem em tempo real

RFN-06 Sistema de Autenticação
Login com e-mail/senha e social (Google/Apple)
Critérios de Aceitação:

Usuário consegue criar conta
Login persistente (manter conectado)

RFN-07 Gestão de Projetos
Agrupar tarefas por projeto
Critérios de Aceitação:

Usuário pode criar projetos
Tarefas podem ser associadas a projetos


---

## Requisitos Não Funcionais

[lista de requisitos não funcionais]


### RNF-[número] - [título do requisito]

RNF-01 - Usabilidade

Interface intuitiva e fácil de usar, com curva de aprendizado mínima.

RNF-02 - Performance

Tempo de resposta inferior a 2 segundos para ações principais.

RNF-03 - Escalabilidade

Sistema deve suportar crescimento de usuários e dados sem perda de desempenho.

RNF-04 - Segurança

Proteção de dados do usuário com autenticação segura e criptografia.

RNF-05 - Disponibilidade

Disponibilidade mínima de 99,5% do sistema.

RNF-06 - Responsividade

Compatível com desktop, tablet e dispositivos móveis.
---

## Métricas de Sucesso

Taxa de retenção de usuários (DAU/MAU)
Número médio de tarefas criadas por usuário
Taxa de conclusão de tarefas
Tempo médio de uso diário
Redução de tarefas atrasadas
Engajamento com dashboard de produtividade

---

## Premissas e restrições

Premissas:

Usuários já possuem familiaridade com ferramentas digitais
Existe demanda por simplificação de ferramentas de produtividade
Interface simples será diferencial competitivo

Restrições:

Recursos limitados para desenvolvimento inicial (MVP)
Dependência de integrações externas (ex: login social)
Necessidade de priorização de features

## Escopo

V1 (MVP)
Criação e gestão de tarefas
Priorização
Autenticação básica
Dashboard simples
Interface responsiva

V2
Integração com calendário
Projetos
Métricas avançadas
Melhorias de UX/UI

V3
Colaboração em equipe
Integrações com outras ferramentas
Automações (ex: tarefas recorrentes)
Inteligência (sugestão de prioridades)