import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail = 'onboarding@resend.dev'; // Resend testing domain

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is not defined. Email sends will be mocked.');
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      const data = await this.resend.emails.send({
        from: `Task Manager <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}. ID: ${data.data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003f87; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Bem-vindo(a) ao Task Manager!</h1>
        </div>
        <div style="padding: 20px; color: #333; line-height: 1.6;">
          <p>Olá <strong>${name}</strong>,</p>
          <p>Sua conta foi criada com sucesso. Estamos muito felizes em ter você conosco.</p>
          <p>Agora você já pode criar seus projetos, organizar suas tarefas e interagir com nosso assistente inteligente.</p>
          <br/>
          <p>Abraços,<br/>Equipe Fluid</p>
        </div>
      </div>
    `;
    return this.sendEmail(to, 'Bem-vindo(a) ao seu gerenciador de tarefas!', html);
  }

  async sendProjectCreatedEmail(to: string, projectName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Novo Projeto Criado</h2>
        </div>
        <div style="padding: 20px; color: #333; line-height: 1.6;">
          <p>O projeto <strong>${projectName}</strong> foi criado com sucesso.</p>
          <p>Acesse o painel para começar a adicionar tarefas a este projeto.</p>
        </div>
      </div>
    `;
    return this.sendEmail(to, `Projeto '${projectName}' criado`, html);
  }

  async sendTaskCreatedEmail(to: string, taskTitle: string, projectName?: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Nova Tarefa</h2>
        </div>
        <div style="padding: 20px; color: #333; line-height: 1.6;">
          <p>A tarefa <strong>${taskTitle}</strong> foi criada com sucesso.</p>
          ${projectName ? `<p>Projeto associado: <strong>${projectName}</strong></p>` : ''}
        </div>
      </div>
    `;
    return this.sendEmail(to, `Tarefa Adicionada: ${taskTitle}`, html);
  }

  async sendTaskDeletedEmail(to: string, taskTitle: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Tarefa Concluída/Removida</h2>
        </div>
        <div style="padding: 20px; color: #333; line-height: 1.6;">
          <p>A tarefa <strong>${taskTitle}</strong> foi removida do sistema.</p>
        </div>
      </div>
    `;
    return this.sendEmail(to, `Tarefa Removida: ${taskTitle}`, html);
  }
}
