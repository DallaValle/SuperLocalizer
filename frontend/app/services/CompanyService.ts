import { HttpClient } from '../utils/HttpClient';
import type { Company } from '../types/domain';

export class CompanyService {
    private static readonly ENDPOINTS = {
        GET: (id: number) => `/company/${id}`,
        GET_CURRENT: '/company/current',
        CREATE: '/company'
    } as const;

    static async getCompany(id: number): Promise<Company> {
        const endpoint = this.ENDPOINTS.GET(id);
        return HttpClient.get<Company>(endpoint);
    }

    static async getCurrentUserCompany(): Promise<Company> {
        return HttpClient.get<Company>(this.ENDPOINTS.GET_CURRENT);
    }

    static async createCompany(company: Partial<Company>): Promise<Company> {
        return HttpClient.post<Company>(this.ENDPOINTS.CREATE, company);
    }
}
