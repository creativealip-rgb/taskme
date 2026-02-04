import { mockDbData } from '../config/database.js';

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export class WorkspaceService {
  async createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<any> {
    const shareToken = Math.random().toString(36).slice(2, 10);

    const workspace = {
      id: `project-${Date.now()}`,
      name: input.name,
      description: input.description || null,
      ownerId: userId,
      isPublic: false,
      shareToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDbData.workspaces.push(workspace);
    return workspace;
  }

  async getWorkspaceById(id: string): Promise<any | null> {
    return mockDbData.workspaces.find(w => w.id === id) || null;
  }

  async getWorkspaceByShareToken(token: string): Promise<any | null> {
    return mockDbData.workspaces.find(w => w.shareToken === token) || null;
  }

  async getWorkspacesByUser(userId: string): Promise<any[]> {
    return mockDbData.workspaces.filter(w => w.ownerId === userId);
  }

  async updateWorkspace(id: string, input: UpdateWorkspaceInput): Promise<any | null> {
    const index = mockDbData.workspaces.findIndex(w => w.id === id);
    if (index === -1) return null;

    const updated = {
      ...mockDbData.workspaces[index],
      ...input,
      description: input.description || null,
      updatedAt: new Date().toISOString(),
    };

    mockDbData.workspaces[index] = updated;
    return updated;
  }

  async generateNewShareToken(id: string): Promise<string | null> {
    const index = mockDbData.workspaces.findIndex(w => w.id === id);
    if (index === -1) return null;

    const newToken = Math.random().toString(36).slice(2, 10);
    mockDbData.workspaces[index].shareToken = newToken;
    return newToken;
  }

  async togglePublic(id: string): Promise<boolean | null> {
    const index = mockDbData.workspaces.findIndex(w => w.id === id);
    if (index === -1) return null;

    mockDbData.workspaces[index].isPublic = !mockDbData.workspaces[index].isPublic;
    mockDbData.workspaces[index].updatedAt = new Date().toISOString();
    return mockDbData.workspaces[index].isPublic;
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    const index = mockDbData.workspaces.findIndex(w => w.id === id);
    if (index === -1) return false;

    mockDbData.workspaces.splice(index, 1);
    return true;
  }

  async getPublicWorkspaceTasks(shareToken: string): Promise<any | null> {
    const workspace = await this.getWorkspaceByShareToken(shareToken);
    if (!workspace || !workspace.isPublic) return null;

    const tasks = mockDbData.tasks.filter(t => t.workspaceId === workspace.id);
    return { workspace, tasks };
  }

  async getOrCreateDefaultWorkspace(userId: string): Promise<any> {
    const existing = await this.getWorkspacesByUser(userId);
    if (existing.length > 0) return existing[0];

    return this.createWorkspace(userId, {
      name: 'My Tasks',
      description: 'Default workspace for my tasks',
    });
  }
}

export const workspaceService = new WorkspaceService();
