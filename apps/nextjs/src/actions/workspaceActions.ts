'use server';

import { revalidatePath } from 'next/cache';
import { apiClient, type CreateWorkspaceInput, type UpdateWorkspaceInput } from '@/lib/api-client';
import { Workspace } from '@/types';

export async function getWorkspaces(): Promise<Workspace[]> {
  try {
    const workspaces = await apiClient.getWorkspaces() as Workspace[];
    return workspaces;
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    return [];
  }
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  try {
    return await apiClient.getWorkspace(id) as Workspace;
  } catch (error) {
    console.error('Failed to fetch workspace:', error);
    return null;
  }
}

export async function createWorkspace(
  data: CreateWorkspaceInput
): Promise<{ success: boolean; error?: string; data?: Workspace }> {
  try {
    const workspace = await apiClient.createWorkspace(data) as Workspace;
    revalidatePath('/');
    return { success: true, data: workspace };
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return { success: false, error: 'Failed to create workspace' };
  }
}

export async function updateWorkspace(
  id: string,
  data: UpdateWorkspaceInput
): Promise<{ success: boolean; error?: string; data?: Workspace }> {
  try {
    const workspace = await apiClient.updateWorkspace(id, data) as Workspace;
    revalidatePath('/');
    revalidatePath(`/projects/${id}`);
    return { success: true, data: workspace };
  } catch (error) {
    console.error('Failed to update workspace:', error);
    return { success: false, error: 'Failed to update workspace' };
  }
}

export async function deleteWorkspace(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.deleteWorkspace(id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete workspace:', error);
    return { success: false, error: 'Failed to delete workspace' };
  }
}
