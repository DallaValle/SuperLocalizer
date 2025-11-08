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
        GET_COMMENTS: (valueKey: string) => `/property/${valueKey}/comment`,
        CREATE: (valueKey: string) => `/property/${valueKey}/comment`,
        UPDATE: (valueKey: string, id: string) => `/property/${valueKey}/comment/${id}`,
        DELETE: (valueKey: string, id: string) => `/property/${valueKey}/comment/${id}`
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
        return HttpClient.post<Comment>(this.ENDPOINTS.CREATE(request.valueKey), request);
    }

    /**
     * Update an existing comment
     */
    static async updateComment(id: string, request: UpdateCommentRequest): Promise<Comment> {
        const endpoint = this.ENDPOINTS.UPDATE(request.valueKey, id);
        return HttpClient.put<Comment>(endpoint, request);
    }

    /**
     * Delete a comment
     */
    static async deleteComment(valueKey: string, id: string): Promise<void> {
        const endpoint = this.ENDPOINTS.DELETE(valueKey, id);
        return HttpClient.delete<void>(endpoint);
    }
}