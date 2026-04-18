import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { TasksService } from '../tasks/tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../../database/prisma.service';
import { TaskStatus, Priority } from '@prisma/client';

// ─── Tipos internos ───────────────────────────────────────────────────────────

type AiAction = 'create' | 'read' | 'update' | 'delete' | 'clarify';
type AiEntity = 'task' | 'project';

interface AiCommand {
  action: AiAction;
  entity: AiEntity;
  data?: Record<string, any>;
  filters?: Record<string, any>;
  friendly_message?: string;
}

// ─── Prompt de sistema ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
Você é um assistente de gerenciamento de tarefas especializado em JSON.
Sua única saída possível deve ser um objeto JSON.

FORMATO:
{
  "action": "create" | "read" | "update" | "delete" | "clarify",
  "entity": "task" | "project",
  "data": { "title": "...", "description": "...", "status": "...", "priority": "...", "name": "...", "color": "..." },
  "filters": { "title": "...", "name": "...", "projectName": "...", "status": "..." },
  "friendly_message": "Resposta curta confirmando a ação."
}

MAPEAMENTO DE INTENÇÕES:
- "Apagar tudo do projeto X" ou "Limpar projeto X": action="delete", entity="task", filters={"projectName": "X"}
- "Crie tarefas no app 1": action="create", entity="task", data={"projectId": "...", "projectName": "app 1"}

REGRAS:
- Nunca use markdown.
- Nunca adicione texto fora das chaves.
`.trim();

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly genAI: GoogleGenerativeAI;
  // Modelos detectados como disponíveis para esta chave específica
  private readonly models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  constructor(
    private readonly config: ConfigService,
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    this.genAI = new GoogleGenerativeAI(apiKey || 'INVALID');
  }

  async processMessage(userId: string, message: string): Promise<{ reply: string; data?: any }> {
    this.logger.log(`[CHAT] User ${userId}: ${message}`);
    
    try {
      const command = await this.callGeminiWithFallback(message);
      this.logger.debug(`[CHAT] Command parsed: ${JSON.stringify(command)}`);

      if (command.action === 'clarify') {
        return { reply: command.friendly_message || 'Pode ser mais específico?' };
      }

      this.validateCommand(command);
      const result = await this.executeCommand(userId, command);

      return {
        reply: command.friendly_message || 'OK, feito!',
        data: result,
      };
    } catch (err) {
      this.logger.error(`[CHAT ERROR] ${err.message}`);
      throw err;
    }
  }

  private async callGeminiWithFallback(userMessage: string): Promise<AiCommand> {
    const prompt = `${SYSTEM_PROMPT}\n\nUsuário: "${userMessage}"`;
    let lastError: Error | null = null;

    for (const modelName of this.models) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        this.logger.debug(`[GEMINI] Success with ${modelName}`);
        return this.parseJson(text);
      } catch (err) {
        this.logger.warn(`[GEMINI] Failed with ${modelName}: ${err.message}`);
        lastError = err;
      }
    }

    throw new InternalServerErrorException(`Falha em todos os modelos de IA: ${lastError?.message}`);
  }

  private parseJson(raw: string): AiCommand {
    // Regex robusta para pegar qualquer coisa entre chaves
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : raw;

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      this.logger.error(`Invalid JSON from AI: ${cleaned}`);
      throw new BadRequestException('Não consegui entender o comando gerado pela IA. Tente ser mais específico.');
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
    // Caso especial: deletar todas as tarefas de um projeto
    if (filters.projectName) {
      const projectId = await this.resolveProjectId(userId, filters.projectName);
      if (projectId) {
        const deleted = await this.prisma.task.deleteMany({
          where: { userId, projectId },
        });
        return { message: `${deleted.count} tarefas removidas do projeto ${filters.projectName}.` };
      }
    }

    const taskId = filters.id ?? (await this.resolveTaskId(userId, filters.title));
    if (!taskId) {
      const filterDesc = filters.title || filters.projectName || JSON.stringify(filters);
      throw new BadRequestException(
        `Não encontrei tarefas para remover usando o filtro: ${filterDesc}.`,
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
