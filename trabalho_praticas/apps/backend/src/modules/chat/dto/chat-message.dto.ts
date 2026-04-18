import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'A mensagem não pode estar vazia.' })
  @MaxLength(1000, { message: 'Mensagem muito longa. Máximo de 1000 caracteres.' })
  message: string;
}
