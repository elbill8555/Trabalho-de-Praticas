import { api } from './api';

export interface ProjectMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AddMemberRequest {
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface UpdateMemberRoleRequest {
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

// Adicionar novo membro ao projeto
export async function addProjectMember(projectId: string, memberData: AddMemberRequest, token: string) {
  const response = await api(`/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add member');
  }

  return response.json() as Promise<ProjectMember>;
}

// Listar membros do projeto
export async function getProjectMembers(projectId: string, token: string) {
  const response = await api(`/projects/${projectId}/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project members');
  }

  return response.json() as Promise<ProjectMember[]>;
}

// Atualizar papel do membro
export async function updateMemberRole(
  projectId: string,
  userId: string,
  roleData: UpdateMemberRoleRequest,
  token: string
) {
  const response = await api(`/projects/${projectId}/members/${userId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    throw new Error('Failed to update member role');
  }

  return response.json() as Promise<ProjectMember>;
}

// Remover membro do projeto
export async function removeProjectMember(projectId: string, userId: string, token: string) {
  const response = await api(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to remove member');
  }

  return response.json();
}
