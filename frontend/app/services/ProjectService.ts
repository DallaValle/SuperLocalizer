import { HttpClient } from '../utils/HttpClient';
import type { Project } from '../types/domain';

export class ProjectService {
    private static readonly ENDPOINTS = {
        GET_ALL: (companyId: number) => `/company/${companyId}/project`,
        GET: (companyId: number, id: number) => `/company/${companyId}/project/${id}`,
        CREATE: (companyId: number) => `/company/${companyId}/project`,
        UPDATE: (companyId: number, id: number) => `/company/${companyId}/project/${id}`,
        DELETE: (companyId: number, id: number) => `/company/${companyId}/project/${id}`,
        ALL_LANGUAGES: (companyId: number, id: number) => `/company/${companyId}/project/${id}/all-languages`,
        SET_MAIN: (companyId: number, id: number) => `/company/${companyId}/project/${id}/user`
    } as const;

    static async getAllProjects(companyId: number): Promise<Project[]> {
        const endpoint = this.ENDPOINTS.GET_ALL(companyId);
        return HttpClient.get<Project[]>(endpoint);
    }

    static async getProject(companyId: number, id: number): Promise<Project> {
        const endpoint = this.ENDPOINTS.GET(companyId, id);
        return HttpClient.get<Project>(endpoint);
    }

    static async createProject(companyId: number, project: Partial<Project>): Promise<Project> {
        const endpoint = this.ENDPOINTS.CREATE(companyId);
        return HttpClient.post<Project>(endpoint, project);
    }

    static async updateProject(companyId: number, project: Project): Promise<Project> {
        const endpoint = this.ENDPOINTS.UPDATE(companyId, project.id);
        return HttpClient.put<Project>(endpoint, project);
    }

    static async deleteProject(companyId: number, id: number): Promise<void> {
        const endpoint = this.ENDPOINTS.DELETE(companyId, id);
        return HttpClient.delete<void>(endpoint);
    }

    /**
     * Get all available languages for the project
     */
    async getAllLanguages(companyId: number, id: number): Promise<string[]> {
        const endpoint = ProjectService.ENDPOINTS.ALL_LANGUAGES(companyId, id);
        return HttpClient.get<string[]>(endpoint);
    }

    static async setMainProject(companyId: number, projectId: number): Promise<void> {
        const endpoint = this.ENDPOINTS.SET_MAIN(companyId, projectId);
        return HttpClient.put<void>(endpoint, {});
    }
}