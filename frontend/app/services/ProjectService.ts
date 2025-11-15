import { HttpClient } from '../utils/HttpClient';
import type { Project } from '../types/domain';
import { CreateLanguageRequest } from './PropertyService';

export class ProjectService {
    private static readonly ENDPOINTS = {
        GET_ALL: (companyId: string) => `/company/${companyId}/project`,
        GET: (companyId: string, id: string) => `/company/${companyId}/project/${id}`,
        CREATE: (companyId: string) => `/company/${companyId}/project`,
        UPDATE: (companyId: string, id: string) => `/company/${companyId}/project/${id}`,
        DELETE: (companyId: string, id: string) => `/company/${companyId}/project/${id}`,
        SET_MAIN: (companyId: string, id: string) => `/company/${companyId}/project/${id}/user`,
        ALL_LANGUAGES: (companyId: string, id: string) => `/company/${companyId}/project/${id}/all-languages`,
        LANGUAGE: (companyId: string, id: string) => `/company/${companyId}/project/${id}/language`,
    } as const;

    static async getAllProjects(companyId: string): Promise<Project[]> {
        const endpoint = this.ENDPOINTS.GET_ALL(companyId);
        return HttpClient.get<Project[]>(endpoint);
    }

    static async getProject(companyId: string, id: string): Promise<Project> {
        const endpoint = this.ENDPOINTS.GET(companyId, id);
        return HttpClient.get<Project>(endpoint);
    }

    static async createProject(companyId: string, project: Partial<Project>): Promise<Project> {
        const endpoint = this.ENDPOINTS.CREATE(companyId);
        return HttpClient.post<Project>(endpoint, project);
    }

    static async updateProject(companyId: string, project: Project): Promise<Project> {
        const endpoint = this.ENDPOINTS.UPDATE(companyId, project.id);
        return HttpClient.put<Project>(endpoint, project);
    }

    static async deleteProject(companyId: string, id: string): Promise<void> {
        const endpoint = this.ENDPOINTS.DELETE(companyId, id);
        return HttpClient.delete<void>(endpoint);
    }

    static async setMainProject(companyId: string, projectId: string): Promise<void> {
        const endpoint = this.ENDPOINTS.SET_MAIN(companyId, projectId);
        return HttpClient.put<void>(endpoint, {});
    }

    /**
     * Languages associated with a project
     */
    async getAllLanguages(companyId: string, id: string): Promise<string[]> {
        const endpoint = ProjectService.ENDPOINTS.ALL_LANGUAGES(companyId, id);
        return HttpClient.get<string[]>(endpoint);
    }

    async createLanguage(companyId: string, id: string, request: CreateLanguageRequest): Promise<void> {
        const endpoint = ProjectService.ENDPOINTS.LANGUAGE(companyId, id);
        return HttpClient.post<void>(endpoint, request);
    }
}