import { apiFetch } from './auth';

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
export async function addProjectMember(projectId: string, memberData: AddMemberRequest) {
  return apiFetch<ProjectMember>(`/api/v1/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(memberData),
  });
}

// Listar membros do projeto
export async function getProjectMembers(projectId: string) {
  return apiFetch<ProjectMember[]>(`/api/v1/projects/${projectId}/members`);
}

// Atualizar papel do membro
export async function updateMemberRole(
  projectId: string,
  userId: string,
  roleData: UpdateMemberRoleRequest
) {
  return apiFetch<ProjectMember>(`/api/v1/projects/${projectId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(roleData),
  });
}

// Remover membro do projeto
export async function removeProjectMember(projectId: string, userId: string) {
  return apiFetch<{ message: string }>(`/api/v1/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  });
}
