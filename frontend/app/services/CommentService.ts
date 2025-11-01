import { HttpClient } from '../utils/HttpClient';
import type {
    Comment,
    CreateCommentRequest,
    UpdateCommentRequest
} from '../types/domain';

/**
 * Service for managing comment-related API operations
 */
export class CommentService {
    private static readonly ENDPOINTS = {
        GET_COMMENTS: (valueKey: string) => `/comment/${valueKey}`,
        CREATE: '/comment',
        UPDATE: (id: string) => `/comment/${id}`,
        DELETE: (id: string) => `/comment/${id}`
    } as const;

    /**
     * Get all comments for a specific value
     */
    static async getComments(valueKey: string): Promise<Comment[]> {
        const endpoint = this.ENDPOINTS.GET_COMMENTS(valueKey);
        return HttpClient.get<Comment[]>(endpoint);
    }

    /**
     * Create a new comment
     */
    static async createComment(request: CreateCommentRequest): Promise<Comment> {
        return HttpClient.post<Comment>(this.ENDPOINTS.CREATE, request);
    }

    /**
     * Update an existing comment
     */
    static async updateComment(id: string, request: UpdateCommentRequest): Promise<Comment> {
        const endpoint = this.ENDPOINTS.UPDATE(id);
        return HttpClient.put<Comment>(endpoint, request);
    }

    /**
     * Delete a comment
     */
    static async deleteComment(id: string): Promise<void> {
        const endpoint = this.ENDPOINTS.DELETE(id);
        return HttpClient.delete<void>(endpoint);
    }
}