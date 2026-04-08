Atue como: Arquiteto de software 

Objetivo: Ajude-me a criar a "Especificação Técnica do Produto" para um novo produto de software.

Contexto:
Consulte o arquivo .\prd.md para mais informações.

Resultado esperado:
- Definição da especificação técnica (spec_tech.md) com a seguinte estrutura:

# Especificação Técnica
Este documento descreve a arquitetura, tecnologias e diretrizes técnicas para o desenvolvimento de uma plataforma de gestão de tarefas e produtividade.

## Visão Geral Técnica

O objetivo é garantir:

Escalabilidade e manutenibilidade do sistema
Clareza na comunicação entre times técnicos
Base sólida para evolução do produto (MVP → versões futuras)

Público-alvo do documento:

Engenheiros de software (frontend e backend)
DevOps / SRE
Arquitetos de software
Equipes de produto técnico

---

## Arquitetura de Referência

Arquitetura baseada em serviços (modular monolith no MVP, evoluindo para microserviços conforme escala).

Componentes principais:

Frontend (SPA)
API Backend (RESTful)
Serviço de autenticação
Banco de dados relacional
Serviço de métricas/analytics

Serviço de observabilidade:

Logging centralizado (ex: ELK / Datadog)
Monitoramento (ex: Prometheus + Grafana)
Tracing distribuído (OpenTelemetry)

Autenticação e autorização:

OAuth 2.0 + JWT
Login social (Google, Apple)
RBAC (Role-Based Access Control)

Protocolos de comunicação:

HTTP/HTTPS (REST API)
JSON como padrão de payload

Infraestrutura de deployment:

Cloud (AWS, GCP ou Azure)
Containers com Docker
Orquestração com Kubernetes (futuro) ou serverless (MVP)

---

## Stack Tecnológica

### Frontend

- **Linguagem**: TypeScript
- **Framework web**: React (com Next.js)
- **EStilização**: Tailwind CSS

### Backend

- **Linguagem**: TypeScript
- **Runtime**: Node.js
- **Framework**: NestJS
- **Persistência**: PostgreSQL
- **ORM**: Prisma 


### Stack de Desenvolvimento

- **IDE**: Antigravity
- **Gerenciamento de pacotes**: npm / pnpm
- **Ambiente de desenvolvimento local**: Docker + Docker Compose
- **Infraestrutura como Código (IaC)**: Vercel
- **Pipeline CI/CD**: GitHub Actions

### Integrações

- **Persistência**: PostgreSQL (RDS ou equivalente)
- **Deployment**: Vercel (Hospedar o frontend), Supabase(Backend)
- **Segurança (autenticação e autorização)**: Auth0 ou Firebase Auth
- **Observabilidade**: 

---

## Segurança

### Autenticação e Gestão de Sessão

Autenticação e Gestão de Sessão
Uso de JWT com expiração curta
Refresh tokens seguros
Armazenamento de tokens via HTTP-only cookies

### Controle de Acesso e Autorização 

Controle de Acesso e Autorização
RBAC (usuário, admin)
Escopo por recurso (tarefas, projetos)
Validação de ownership (usuário só acessa seus dados)

### Segurança de Dados e Validação

Segurança de Dados e Validação
Validação de input no frontend e backend
Sanitização contra XSS e SQL Injection
Rate limiting em endpoints críticos

#### Criptografia e Proteção de Dados

HTTPS obrigatório (TLS 1.2+)
Criptografia de dados sensíveis em repouso
Hash de senhas com bcrypt

### Segurança da Infraestrutura e Configuração

Segurança da Infraestrutura e Configuração
Uso de variáveis de ambiente
Secrets gerenciados (ex: AWS Secrets Manager)
Configuração isolada por ambiente (dev, staging, prod)

### Segurança no Desenvolvimento e Operação (DevSecOps)

Segurança no Desenvolvimento e Operação (DevSecOps)
Análise estática de código (SAST)
Scan de dependências (Dependabot, Snyk)
Monitoramento de vulnerabilidades

---

## APIs

Endpoint base:
/api/v1

Versionamento:

Versionamento via URL (v1, v2)

Padrão de nomenclatura:

RESTful (ex: /tasks, /projects, /users)

Principais endpoints:

POST /auth/login
POST /auth/register
GET /tasks
POST /tasks
PATCH /tasks/:id
DELETE /tasks/:id
GET /projects

Autenticação:

JWT via header Authorization: Bearer

Endpoints públicos:

Login
Registro

Endpoints protegidos:

Tasks
Projects
Dashboard

---

## Tenancy

Estratégia:
Single-tenant no MVP, evoluindo para multi-tenant lógico.

Isolamento:

Dados isolados por user_id

Identificação:

Cada recurso vinculado a um usuário

Migrações:

Controladas via ORM (Prisma Migrate)

Segurança:

Validação obrigatória de ownership em todas queries

---

## Diretrizes para Desenvolvimento Assistido por IA

A IA deve seguir padrões definidos neste documento
Código deve respeitar arquitetura modular
Nomeação consistente de variáveis e endpoints
Evitar lógica duplicada
Priorizar legibilidade e manutenibilidade
Sempre considerar segurança (validação e autenticação)
Seguir princípios SOLID e Clean Code