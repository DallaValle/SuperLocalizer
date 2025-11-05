import { HttpClient } from '../utils/HttpClient';
import type { Company } from '../types/domain';

export class CompanyService {
    private static readonly ENDPOINTS = {
        GET: (id: number) => `/company/${id}`,
        CREATE: '/company'
    } as const;

    static async getCompany(id: number): Promise<Company> {
        const endpoint = this.ENDPOINTS.GET(id);
        return HttpClient.get<Company>(endpoint);
    }

    static async createCompany(company: Partial<Company>): Promise<Company> {
        return HttpClient.post<Company>(this.ENDPOINTS.CREATE, company);
    }
}
