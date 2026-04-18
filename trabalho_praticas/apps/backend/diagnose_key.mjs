import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: 'c:/Users/billa/OneDrive/Área de Trabalho/TrabalhoPraticas/Trabalho de Praticas/trabalho_praticas/.env' });

async function run() {
  const rawKey = process.env.GEMINI_API_KEY;
  if (!rawKey) {
    console.log("ERRO: GEMINI_API_KEY não encontrada no .env");
    return;
  }

  console.log("--- Diagnóstico de Chave ---");
  console.log("Comprimento da chave:", rawKey.length);
  console.log("Últimos 4 caracteres:", rawKey.slice(-4));
  console.log("Contém \\r (carriage return)?", rawKey.includes('\r'));
  console.log("Contém espaço no final?", rawKey.endsWith(' '));

  const trimmedKey = rawKey.trim();
  console.log("Comprimento após trim():", trimmedKey.length);

  const genAI = new GoogleGenerativeAI(trimmedKey);
  
  // Testando com o modelo mais básico possível
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    console.log("Tentando chamada com gemini-1.5-flash...");
    const result = await model.generateContent("Oi");
    console.log("Sucesso!");
  } catch (err) {
    console.log("Falha com gemini-1.5-flash:", err.message);
    if (err.message.includes('404')) {
      console.log("DICA: Erro 404 geralmente significa que a chave não tem permissão para acessar os modelos do Gemini ou a região não é suportada.");
    }
  }
}

run();
