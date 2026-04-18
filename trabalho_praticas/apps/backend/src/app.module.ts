import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UsersModule } from './modules/users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // No Vercel, usamos as variáveis injetadas no painel, 
      // o arquivo físico é apenas para desenvolvimento local.
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '../../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    HealthModule,
    AuthModule,
    TasksModule,
    ProjectsModule,
    UsersModule,
    ChatModule,
    MailModule,
  ],
})
export class AppModule {}
