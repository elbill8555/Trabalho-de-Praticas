import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}
