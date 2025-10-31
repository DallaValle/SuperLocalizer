export interface Comment {
    id: string
    valueKey: string
    author: string
    text: string
    insertDate: string
    updateDate: string
}

export interface CreateCommentRequest {
    valueKey: string
    author: string
    text: string
}

export interface UpdateCommentRequest {
    id: string
    valueKey: string
    author: string
    text: string
}

export class CommentService {
    private static readonly BASE_URL = 'http://localhost:5000/api'

    /**
     * Get all comments for a specific value
     */
    static async getComments(valueKey: string): Promise<Comment[]> {
        try {
            const response = await fetch(`${this.BASE_URL}/Comment/${valueKey}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error getting comments:', error)
            throw error
        }
    }

    /**
     * Create a new comment
     */
    static async createComment(request: CreateCommentRequest): Promise<Comment> {
        try {
            const response = await fetch(`${this.BASE_URL}/Comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error creating comment:', error)
            throw error
        }
    }

    /**
     * Update an existing comment
     */
    static async updateComment(id: string, request: UpdateCommentRequest): Promise<Comment> {
        try {
            const response = await fetch(`${this.BASE_URL}/Comment/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error updating comment:', error)
            throw error
        }
    }

    /**
     * Delete a comment
     */
    static async deleteComment(id: string): Promise<void> {
        try {
            const response = await fetch(`${this.BASE_URL}/Comment/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        } catch (error) {
            console.error('Error deleting comment:', error)
            throw error
        }
    }
}