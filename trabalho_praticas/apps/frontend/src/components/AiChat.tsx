'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api('/api/v1/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao processar comando no servidor.');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.reply || 'Comando executado, mas sem mensagem de resposta.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Dispatch event to refresh data (tarefas, projetos) se for sucesso
      if (data.data) {
        window.dispatchEvent(new Event('refresh-data'));
      }
      
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `Erro: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Botão Flutuante (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir AI Assistant"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(0, 63, 135, 0.3)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: isOpen ? 'scale(0.9) rotate(45deg)' : 'scale(1) rotate(0)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* Janela do Chat */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '6rem',
            right: '2rem',
            width: '380px',
            height: '500px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
            border: '1px solid rgba(194,198,212,0.4)',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)',
            padding: '1rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>smart_toy</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Fluid AI Assistant</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Gerencie tarefas com comandos de texto</p>
            </div>
          </div>

          {/* Mensagens */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#f8fafc',
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)', marginTop: '2rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '0.5rem' }}>chat</span>
                <p style={{ fontSize: '0.875rem' }}>Olá! Tente dizer: "Crie uma tarefa para revisar o relatório amanhã com prioridade alta".</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: msg.role === 'user' ? '#003f87' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                padding: '0.75rem 1rem',
                borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                boxShadow: msg.role === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}>
                {msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#ffffff',
                padding: '0.75rem 1rem',
                borderRadius: '16px 16px 16px 0',
                border: '1px solid #e2e8f0',
                display: 'flex',
                gap: '4px',
              }}>
                <span style={{ width: 6, height: 6, backgroundColor: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                <span style={{ width: 6, height: 6, backgroundColor: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                <span style={{ width: 6, height: 6, backgroundColor: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '1rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid rgba(194,198,212,0.4)',
            display: 'flex',
            gap: '0.5rem',
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite seu comando..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: input.trim() && !isLoading ? '#003f87' : '#e2e8f0',
                color: input.trim() && !isLoading ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
            </button>
          </form>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}} />
    </>
  );
}
