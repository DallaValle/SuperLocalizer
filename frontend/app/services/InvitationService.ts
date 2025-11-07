import { HttpClient } from '../utils/HttpClient';

export interface InvitationResponse {
    token: string;
    message: string;
}

export class InvitationService {
    private static readonly ENDPOINTS = {
        CREATE_INVITATION: '/auth/create/invitation',
    } as const;

    /**
     * Creates an invitation and returns the invitation token
     */
    static async createInvitation(): Promise<InvitationResponse> {
        return await HttpClient.post<InvitationResponse>(this.ENDPOINTS.CREATE_INVITATION, {});
    }

    /**
     * Generates a complete invitation URL that can be shared
     */
    static generateInvitationUrl(token: string, baseUrl?: string): string {
        const base = baseUrl || window.location.origin;
        return `${base}/signup?invitationToken=${encodeURIComponent(token)}`;
    }
}