'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  projectId?: string | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface TaskAssigneeModalProps {
  task: Task;
  projectId: string;
  token: string;
  onClose: () => void;
  onAssign: (task: Task) => void;
}

export default function TaskAssigneeModal({
  task,
  projectId,
  token,
  onClose,
  onAssign,
}: TaskAssigneeModalProps) {
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Carregar membros do projeto
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const response = await api(`/projects/${projectId}/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar membros');
        }

        const data = await response.json();
        setProjectMembers(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [projectId, token]);

  // Atribuir tarefa a um usuário
  const handleAssign = async (userId: string) => {
    try {
      setAssigning(true);
      setError(null);

      const response = await api(`/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedToId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atribuir tarefa');
      }

      const updatedTask = await response.json();
      onAssign(updatedTask);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAssigning(false);
    }
  };

  // Remover atribuição
  const handleRemoveAssignee = async () => {
    try {
      setAssigning(true);
      setError(null);

      const response = await api(`/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedToId: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao remover atribuição');
      }

      const updatedTask = await response.json();
      onAssign(updatedTask);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-2">{task.title}</h2>
        <p className="text-sm text-gray-600 mb-4">Atribuir responsável</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {task.assignedTo && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm font-semibold">Atualmente atribuído a:</p>
            <p className="text-sm">{task.assignedTo.name}</p>
            <p className="text-xs text-gray-600">{task.assignedTo.email}</p>
            <button
              onClick={handleRemoveAssignee}
              disabled={assigning}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
            >
              Remover atribuição
            </button>
          </div>
        )}

        <h3 className="font-semibold mb-3">Selecionar novo responsável</h3>

        {loading ? (
          <p className="text-gray-500">Carregando membros...</p>
        ) : projectMembers.length === 0 ? (
          <p className="text-gray-500">Nenhum membro disponível neste projeto</p>
        ) : (
          <div className="space-y-2">
            {projectMembers.map((member) => (
              <button
                key={member.user.id}
                onClick={() => handleAssign(member.user.id)}
                disabled={assigning || task.assignedTo?.id === member.user.id}
                className="w-full text-left p-3 border rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-semibold">{member.user.name}</div>
                <div className="text-sm text-gray-600">{member.user.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {member.role === 'VIEWER' && 'Visualizador'}
                  {member.role === 'MEMBER' && 'Membro'}
                  {member.role === 'ADMIN' && 'Admin'}
                  {member.role === 'OWNER' && 'Proprietário'}
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
