'use client';

import { useState, useEffect } from 'react';
import {
  addProjectMember,
  getProjectMembers,
  updateMemberRole,
  removeProjectMember,
  ProjectMember,
} from '@/lib/project-members';

interface ProjectMembersModalProps {
  projectId: string;
  projectName: string;
  token: string;
  onClose: () => void;
}

export default function ProjectMembersModal({
  projectId,
  projectName,
  token,
  onClose,
}: ProjectMembersModalProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [adding, setAdding] = useState(false);

  // Carregar membros
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const data = await getProjectMembers(projectId, token);
        setMembers(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [projectId, token]);

  // Adicionar novo membro
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setError('Por favor, digite um email válido');
      return;
    }

    try {
      setAdding(true);
      setError(null);
      const newMember = await addProjectMember(
        projectId,
        { email: newEmail, role: newRole },
        token
      );
      setMembers([...members, newMember]);
      setNewEmail('');
      setNewRole('MEMBER');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  // Atualizar papel do membro
  const handleUpdateRole = async (memberId: string, currentUserId: string, newRoleValue: string) => {
    try {
      setError(null);
      const updatedMember = await updateMemberRole(
        projectId,
        currentUserId,
        { role: newRoleValue as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' },
        token
      );
      setMembers(members.map((m) => (m.user.id === currentUserId ? updatedMember : m)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Remover membro
  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      setError(null);
      await removeProjectMember(projectId, userId, token);
      setMembers(members.filter((m) => m.user.id !== userId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Membros de {projectName}</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulário para adicionar novo membro */}
        <form onSubmit={handleAddMember} className="mb-6 pb-6 border-b">
          <h3 className="font-semibold mb-3">Adicionar novo membro</h3>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email do novo membro"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={adding}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={adding}
            >
              <option value="VIEWER">Visualizador</option>
              <option value="MEMBER">Membro</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Proprietário</option>
            </select>
            <button
              type="submit"
              disabled={adding || !newEmail.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {adding ? 'Adicionando...' : 'Adicionar Membro'}
            </button>
          </div>
        </form>

        {/* Lista de membros */}
        <div>
          <h3 className="font-semibold mb-3">Membros atuais ({members.length})</h3>
          {loading ? (
            <p className="text-gray-500">Carregando membros...</p>
          ) : members.length === 0 ? (
            <p className="text-gray-500">Nenhum membro adicionado</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="border rounded-md p-3 bg-gray-50">
                  <div className="font-semibold">{member.user.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{member.user.email}</div>
                  <div className="flex gap-2">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleUpdateRole(member.id, member.user.id, e.target.value)
                      }
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    >
                      <option value="VIEWER">Visualizador</option>
                      <option value="MEMBER">Membro</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Proprietário</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
