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

type AiAction = 'create' | 'read' | 'update' | 'delete' | 'clarify' | 'navigate';
type AiEntity = 'task' | 'project';

interface AiCommand {
  action: AiAction;
  entity: AiEntity;
  data?: Record<string, any>;
  filters?: Record<string, any>;
}

interface AiResponse {
  commands: AiCommand[];
  friendly_message: string;
  redirectTo?: string; // Ex: '/tasks', '/projects'
}

// ─── Prompt de sistema ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
Você é um assistente de gerenciamento de tarefas especializado em comandos JSON.
Sua única saída possível deve ser um objeto JSON seguindo estritamente o formato abaixo.

REGRAS CRÍTICAS:
1. Se o usuário pedir múltiplas coisas (ex: "Crie 3 tarefas"), retorne múltiplos objetos no array "commands".
2. Se a ação envolver tarefas, sugira "redirectTo": "/tasks".
3. Se a ação envolver projetos, sugira "redirectTo": "/projects".
4. Se o usuário quiser apenas navegar para uma página, use action="navigate".
5. Mantenha a "friendly_message" amigável e informativa.

FORMATO DE RESPOSTA:
{
  "commands": [
    {
      "action": "create" | "read" | "update" | "delete" | "clarify" | "navigate",
      "entity": "task" | "project",
      "data": { ... },
      "filters": { ... }
    }
  ],
  "friendly_message": "Resposta confirmando todas as ações.",
  "redirectTo": "/tasks" | "/projects" | "/dashboard"
}

MAPEAMENTO DE ENTIDADES:
- Task fields: title, description, status (TODO, IN_PROGRESS, DONE), priority (LOW, MEDIUM, HIGH), dueDate, projectId.
- Project fields: name, description, color.

EXEMPLO DE MÚLTIPLOS:
Usuário: "Crie uma tarefa Comprar Pão e outra Lavar Carro no projeto Casa"
Resposta: {
  "commands": [
    { "action": "create", "entity": "task", "data": { "title": "Comprar Pão", "projectName": "Casa" } },
    { "action": "create", "entity": "task", "data": { "title": "Lavar Carro", "projectName": "Casa" } }
  ],
  "friendly_message": "Com certeza! Criei as duas tarefas no projeto Casa.",
  "redirectTo": "/tasks"
}
`.trim();

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly genAI: GoogleGenerativeAI;
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

  async processMessage(userId: string, message: string): Promise<{ reply: string; data?: any; redirectTo?: string }> {
    this.logger.log(`[CHAT] User ${userId}: ${message}`);
    
    try {
      const aiResponse = await this.callGeminiWithFallback(message);
      this.logger.debug(`[CHAT] Commands parsed: ${JSON.stringify(aiResponse)}`);

      const results = [];
      
      // Processa cada comando individualmente
      for (const command of aiResponse.commands) {
        if (command.action === 'clarify' || command.action === 'navigate') {
          continue;
        }

        try {
          this.validateCommand(command);
          const result = await this.executeCommand(userId, command);
          results.push(result);
        } catch (cmdErr) {
          this.logger.warn(`[CHAT] Failed to execute sub-command: ${cmdErr.message}`);
          // Continua processando os outros comandos se um falhar
        }
      }

      return {
        reply: aiResponse.friendly_message || 'OK, processado!',
        data: results,
        redirectTo: aiResponse.redirectTo
      };
    } catch (err) {
      this.logger.error(`[CHAT ERROR] ${err.message}`);
      throw err;
    }
  }

  private async callGeminiWithFallback(userMessage: string): Promise<AiResponse> {
    const prompt = `${SYSTEM_PROMPT}\n\nUsuário: "${userMessage}"`;
    let lastError: Error | null = null;

    for (const modelName of this.models) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return this.parseJson(text);
      } catch (err) {
        this.logger.warn(`[GEMINI] Failed with ${modelName}: ${err.message}`);
        lastError = err;
      }
    }

    throw new InternalServerErrorException(`Falha em todos os modelos de IA: ${lastError?.message}`);
  }

  private parseJson(raw: string): AiResponse {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : raw;

    try {
      const parsed = JSON.parse(cleaned);
      // Garante que commands seja sempre um array
      if (!parsed.commands) parsed.commands = [];
      if (!Array.isArray(parsed.commands)) parsed.commands = [parsed.commands];
      return parsed;
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
    let projectId = data.projectId;
    
    // Se não tem ID mas tem nome do projeto, tenta resolver
    if (!projectId && data.projectName) {
      projectId = await this.resolveProjectId(userId, data.projectName);
    }

    return this.tasksService.create(userId, {
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as Priority,
      dueDate: data.dueDate,
      projectId: projectId || undefined,
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

    let projectId = data.projectId;
    if (!projectId && data.projectName) {
      projectId = await this.resolveProjectId(userId, data.projectName);
    }

    return this.tasksService.update(userId, taskId, {
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as Priority,
      dueDate: data.dueDate,
      projectId: projectId || undefined,
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
