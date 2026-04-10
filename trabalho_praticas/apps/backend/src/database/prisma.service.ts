import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    console.log('[PRISMA] PrismaService instanciado. DATABASE_URL presente:', !!process.env.DATABASE_URL);
  }

  async onModuleInit() {
    try {
      console.log('Tentando conectar ao banco de dados...');
      await this.$connect();
      console.log('Conexão com o banco de dados estabelecida com sucesso!');
    } catch (error) {
      console.error('FALHA NA CONEXÃO COM O BANCO:', error);
      // Loga apenas parte da URL para não expor a senha inteira mas confirmar se ela existe
      const dbUrl = process.env.DATABASE_URL || 'NÃO DEFINIDA';
      console.log(`DATABASE_URL prefixo: ${dbUrl.substring(0, 20)}...`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
