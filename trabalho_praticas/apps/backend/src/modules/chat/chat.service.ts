import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { TasksService } from '../tasks/tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../../database/prisma.service';
import { TaskStatus, Priority } from '@prisma/client';

// ─── Tipos internos ───────────────────────────────────────────────────────────

type AiAction = 'create' | 'read' | 'update' | 'delete';
type AiEntity = 'task' | 'project';

interface AiCommand {
  action: AiAction;
  entity: AiEntity;
  data?: Record<string, any>;
  filters?: Record<string, any>;
}

// ─── Prompt de sistema ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
Você é um assistente de gerenciamento de tarefas. O usuário pode pedir para criar, listar, atualizar ou apagar tarefas e projetos.

Você deve SEMPRE responder com um JSON estruturado no seguinte formato, sem nenhum texto antes ou depois:

{
  "action": "create | read | update | delete",
  "entity": "task | project",
  "data": { ... },
  "filters": { ... },
  "friendly_message": "Mensagem amigável para o usuário"
}

Regras obrigatórias:
1. O campo "action" deve ser um dos valores: create, read, update, delete.
2. O campo "entity" deve ser: task ou project.
3. O campo "data" contém os dados para criação ou atualização.
4. O campo "filters" contém os filtros para busca, atualização ou deleção.
5. O campo "friendly_message" é a resposta amigável ao usuário APÓS a execução da ação.
6. Para tasks, os valores de "status" devem ser: PENDING, IN_PROGRESS, DONE.
7. Para tasks, os valores de "priority" devem ser: LOW, MEDIUM, HIGH, URGENT.
8. Se faltar informação obrigatória (ex: título da tarefa), retorne:
   { "action": "clarify", "entity": "task", "data": {}, "filters": {}, "friendly_message": "Qual é o título da tarefa?" }
9. NUNCA retorne texto fora do JSON. Somente JSON válido.
10. Nunca invente dados. Se não souber um campo, omita-o.

Campos das entidades:
- Task: title (string, obrigatório), description (string), status (enum), priority (enum), dueDate (ISO date), projectId (string UUID)
- Project: name (string, obrigatório), description (string), color (string hex)

Exemplos de entrada e saída:

Entrada: "Crie uma tarefa chamada estudar IA com prioridade alta"
Saída: { "action": "create", "entity": "task", "data": { "title": "Estudar IA", "priority": "HIGH" }, "filters": {}, "friendly_message": "Tarefa 'Estudar IA' criada com prioridade alta!" }

Entrada: "Liste minhas tarefas pendentes"
Saída: { "action": "read", "entity": "task", "data": {}, "filters": { "status": "PENDING" }, "friendly_message": "Aqui estão suas tarefas pendentes:" }

Entrada: "Marque a tarefa Estudar IA como concluída"
Saída: { "action": "update", "entity": "task", "data": { "status": "DONE" }, "filters": { "title": "Estudar IA" }, "friendly_message": "Tarefa 'Estudar IA' marcada como concluída!" }

Entrada: "Apague o projeto Marketing"
Saída: { "action": "delete", "entity": "project", "data": {}, "filters": { "name": "Marketing" }, "friendly_message": "Projeto 'Marketing' apagado com sucesso!" }
`.trim();

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly genai: GoogleGenAI;
  private readonly model = 'gemini-2.0-flash';

  constructor(
    private readonly config: ConfigService,
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY não configurada.');
    }
    this.genai = new GoogleGenAI({ apiKey });
  }

  // ─── Método principal ────────────────────────────────────────────────────

  async processMessage(userId: string, message: string): Promise<{ reply: string; data?: any }> {
    const command = await this.callGemini(message);

    if (command.action === ('clarify' as any)) {
      return { reply: command['friendly_message'] ?? 'Pode fornecer mais detalhes?' };
    }

    this.validateCommand(command);

    const result = await this.executeCommand(userId, command);

    return {
      reply: command['friendly_message'] ?? 'Ação executada com sucesso.',
      data: result,
    };
  }

  // ─── Gemini ──────────────────────────────────────────────────────────────

  private async callGemini(userMessage: string): Promise<AiCommand & { friendly_message?: string }> {
    const contents = [
      {
        role: 'user' as const,
        parts: [{ text: `${SYSTEM_PROMPT}\n\nMensagem do usuário: "${userMessage}"` }],
      },
    ];

    let rawText = '';
    try {
      const response = await this.genai.models.generateContentStream({
        model: this.model,
        contents,
      });

      for await (const chunk of response) {
        if (chunk.text) rawText += chunk.text;
      }
    } catch (err) {
      this.logger.error('Erro ao chamar a API do Gemini', err);
      throw new InternalServerErrorException('Falha na comunicação com a IA. Tente novamente.');
    }

    return this.parseJson(rawText.trim());
  }

  private parseJson(raw: string): AiCommand & { friendly_message?: string } {
    // Remove blocos ```json ... ``` se existirem
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch {
      this.logger.error('JSON inválido retornado pelo Gemini:', raw);
      throw new BadRequestException(
        'Não consegui entender seu comando. Tente reformular com mais clareza.',
      );
    }
  }

  // ─── Validação ───────────────────────────────────────────────────────────

  private validateCommand(cmd: AiCommand): void {
    const validActions: AiAction[] = ['create', 'read', 'update', 'delete'];
    const validEntities: AiEntity[] = ['task', 'project'];

    if (!validActions.includes(cmd.action)) {
      throw new BadRequestException(`Ação inválida: ${cmd.action}`);
    }
    if (!validEntities.includes(cmd.entity)) {
      throw new BadRequestException(`Entidade inválida: ${cmd.entity}`);
    }

    // Validações específicas
    if (cmd.action === 'create' && cmd.entity === 'task') {
      if (!cmd.data?.title) {
        throw new BadRequestException('Para criar uma tarefa, o título é obrigatório.');
      }
    }
    if (cmd.action === 'create' && cmd.entity === 'project') {
      if (!cmd.data?.name) {
        throw new BadRequestException('Para criar um projeto, o nome é obrigatório.');
      }
    }
  }

  // ─── Executor de ações ───────────────────────────────────────────────────

  private async executeCommand(userId: string, cmd: AiCommand): Promise<any> {
    switch (`${cmd.action}:${cmd.entity}`) {
      case 'create:task':
        return this.createTask(userId, cmd.data ?? {});

      case 'read:task':
        return this.readTasks(userId, cmd.filters ?? {});

      case 'update:task':
        return this.updateTask(userId, cmd.filters ?? {}, cmd.data ?? {});

      case 'delete:task':
        return this.deleteTask(userId, cmd.filters ?? {});

      case 'create:project':
        return this.createProject(userId, cmd.data ?? {});

      case 'read:project':
        return this.readProjects(userId);

      case 'update:project':
        return this.updateProject(userId, cmd.filters ?? {}, cmd.data ?? {});

      case 'delete:project':
        return this.deleteProject(userId, cmd.filters ?? {});

      default:
        throw new BadRequestException('Combinação de ação/entidade não suportada.');
    }
  }

  // ─── Task actions ────────────────────────────────────────────────────────

  private async createTask(userId: string, data: Record<string, any>) {
    return this.tasksService.create(userId, {
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as Priority,
      dueDate: data.dueDate,
      projectId: data.projectId,
    });
  }

  private async readTasks(userId: string, filters: Record<string, any>) {
    return this.tasksService.findAll(userId, {
      status: filters.status as TaskStatus,
      priority: filters.priority as Priority,
    });
  }

  private async updateTask(userId: string, filters: Record<string, any>, data: Record<string, any>) {
    // Resolve o ID da tarefa pelo título se necessário
    const taskId = filters.id ?? (await this.resolveTaskId(userId, filters.title));
    if (!taskId) {
      throw new BadRequestException(
        `Não encontrei uma tarefa com o título "${filters.title}". Verifique o nome e tente novamente.`,
      );
    }
    return this.tasksService.update(userId, taskId, {
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as Priority,
      dueDate: data.dueDate,
      projectId: data.projectId,
    });
  }

  private async deleteTask(userId: string, filters: Record<string, any>) {
    const taskId = filters.id ?? (await this.resolveTaskId(userId, filters.title));
    if (!taskId) {
      throw new BadRequestException(
        `Não encontrei uma tarefa com o título "${filters.title}".`,
      );
    }
    return this.tasksService.remove(userId, taskId);
  }

  private async resolveTaskId(userId: string, title?: string): Promise<string | null> {
    if (!title) return null;
    const task = await this.prisma.task.findFirst({
      where: {
        userId,
        title: { contains: title, mode: 'insensitive' },
      },
      select: { id: true },
    });
    return task?.id ?? null;
  }

  // ─── Project actions ─────────────────────────────────────────────────────

  private async createProject(userId: string, data: Record<string, any>) {
    return this.projectsService.create(userId, {
      name: data.name,
      description: data.description,
      color: data.color,
    });
  }

  private async readProjects(userId: string) {
    return this.projectsService.findAll(userId);
  }

  private async updateProject(userId: string, filters: Record<string, any>, data: Record<string, any>) {
    const projectId = filters.id ?? (await this.resolveProjectId(userId, filters.name));
    if (!projectId) {
      throw new BadRequestException(
        `Não encontrei um projeto com o nome "${filters.name}".`,
      );
    }
    return this.projectsService.update(userId, projectId, {
      name: data.name,
      description: data.description,
      color: data.color,
    });
  }

  private async deleteProject(userId: string, filters: Record<string, any>) {
    const projectId = filters.id ?? (await this.resolveProjectId(userId, filters.name));
    if (!projectId) {
      throw new BadRequestException(
        `Não encontrei um projeto com o nome "${filters.name}".`,
      );
    }
    return this.projectsService.remove(userId, projectId);
  }

  private async resolveProjectId(userId: string, name?: string): Promise<string | null> {
    if (!name) return null;
    const project = await this.prisma.project.findFirst({
      where: {
        userId,
        name: { contains: name, mode: 'insensitive' },
      },
      select: { id: true },
    });
    return project?.id ?? null;
  }
}
