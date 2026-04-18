Você é um engenheiro de software sênior com experiência em arquitetura de sistemas, integração com LLMs e desenvolvimento full-stack.

Contexto:
Estou desenvolvendo um sistema de gerenciamento de tarefas com as seguintes entidades:

Entidades do sistema:

Project (Projeto):

* name: string
* description: string (opcional)
* color: string (default: #003f87)
  Relacionamentos:
* Pertence a um User
* Possui várias Tasks

Task (Tarefa):

* title: string
* description: string
* status: enum (PENDING, IN_PROGRESS, DONE)
* priority: enum (LOW, MEDIUM, HIGH, URGENT)
* dueDate: date (opcional)
  Relacionamentos:
* Pertence obrigatoriamente a um User
* Pode pertencer a um Project (opcional)

Objetivo:
Criar uma funcionalidade de chat com LLM (usando a API do Gemini) que permita ao usuário manipular as entidades do sistema (Project e Task) através de linguagem natural, executando operações de CRUD.

Exemplo de uso esperado:

* "Crie uma tarefa chamada estudar IA com prioridade alta"
* "Liste minhas tarefas pendentes"
* "Atualize o status da tarefa X para concluída"
* "Apague o projeto Marketing"

Requisitos funcionais:

1. O sistema deve interpretar comandos em linguagem natural
2. O LLM deve transformar a intenção do usuário em uma ação estruturada (JSON)
3. O backend deve executar operações CRUD com base nessa estrutura
4. O chat deve retornar respostas amigáveis ao usuário
5. As ações devem respeitar o contexto do usuário autenticado

Formato esperado de saída do LLM:
O modelo deve SEMPRE responder com um JSON estruturado antes de qualquer texto.

Formato padrão:
{
"action": "create | read | update | delete",
"entity": "task | project",
"data": { ... },
"filters": { ... }
}

Exemplos:

Criar tarefa:
{
"action": "create",
"entity": "task",
"data": {
"title": "Estudar IA",
"priority": "HIGH"
}
}

Listar tarefas:
{
"action": "read",
"entity": "task",
"filters": {
"status": "PENDING"
}
}

Atualizar tarefa:
{
"action": "update",
"entity": "task",
"filters": {
"title": "Estudar IA"
},
"data": {
"status": "DONE"
}
}

Deletar projeto:
{
"action": "delete",
"entity": "project",
"filters": {
"name": "Marketing"
}
}

Regras obrigatórias:

1. O LLM NÃO deve executar ações diretamente (somente sugerir via JSON)
2. O backend é o único responsável por executar operações no banco
3. O JSON deve ser sempre válido e consistente
4. Nunca retornar texto fora do padrão antes do JSON
5. Campos devem respeitar exatamente os nomes definidos nas entidades
6. Valores de enums devem seguir exatamente:

   * status: PENDING, IN_PROGRESS, DONE
   * priority: LOW, MEDIUM, HIGH, URGENT

Arquitetura esperada:

Frontend:

* Interface de chat
* Envio de mensagens do usuário
* Exibição de respostas

Backend:

* Endpoint /chat
* Integração com API do Gemini
* Parser do JSON retornado pelo LLM
* Executor de ações CRUD
* Camada de validação

Fluxo da aplicação:

1. Usuário envia mensagem no chat
2. Backend envia mensagem para o Gemini com instruções de formatação
3. Gemini retorna JSON estruturado
4. Backend valida JSON
5. Backend executa ação no banco de dados
6. Backend retorna resposta amigável ao frontend
7. Frontend exibe resposta

Restrições importantes:

* NÃO permitir execução de comandos ambíguos
* Se faltar informação, solicitar mais dados ao usuário
* NÃO inferir dados críticos sem confirmação
* Garantir segurança (usuário só acessa seus próprios dados)

Critério de sucesso:

* Usuário consegue controlar Tasks e Projects apenas via chat
* Nenhuma ação quebra o sistema
* O JSON gerado pelo LLM é sempre previsível e validável
* Integração com Gemini é estável e consistente

Antes de implementar:
Explique a arquitetura proposta e possíveis riscos.

Se houver ambiguidade na intenção do usuário:
Solicite clarificação ao invés de assumir.

Importante:
A previsibilidade e segurança do sistema são mais importantes que flexibilidade do LLM.

Exite o arquivo Exemple.ts que contem um exemplo de como usar a API do Gemini.
No arquivo .env existe a chave da API do Gemini.
