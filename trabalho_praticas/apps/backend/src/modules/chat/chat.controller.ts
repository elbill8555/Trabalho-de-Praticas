import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /api/v1/chat
   * Body: { "message": "Crie uma tarefa chamada estudar IA com prioridade alta" }
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(@Request() req, @Body() dto: ChatMessageDto) {
    const userId = req.user.id;
    const result = await this.chatService.processMessage(userId, dto.message);
    return result;
  }
}
