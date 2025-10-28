'use client'

import { useState, useEffect } from 'react'
import { Comment, CommentService, CreateCommentRequest, UpdateCommentRequest } from '../services/CommentService'
import './CommentsModal.css'

interface CommentsModalProps {
    isOpen: boolean
    onClose: () => void
    valueId: string
    propertyKey: string
    language: string
    onCommentsUpdated?: () => void
}

export default function CommentsModal({
    isOpen,
    onClose,
    valueId,
    propertyKey,
    language,
    onCommentsUpdated
}: CommentsModalProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [newComment, setNewComment] = useState('')
    const [editingComment, setEditingComment] = useState<Comment | null>(null)
    const [editingText, setEditingText] = useState('')

    // Load comments when modal opens
    useEffect(() => {
        if (isOpen && valueId) {
            loadComments()
        }
    }, [isOpen, valueId])

    const loadComments = async () => {
        setLoading(true)
        setError(null)
        try {
            const commentsData = await CommentService.getCommentsByValueId(valueId)
            setComments(commentsData)
        } catch (err) {
            setError('Failed to load comments')
            console.error('Error loading comments:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            setError('Comment text is required')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const request: CreateCommentRequest = {
                valueId,
                author: 'Anonymous',
                text: newComment.trim()
            }

            const createdComment = await CommentService.createComment(request)
            setComments(prev => [...prev, createdComment])
            setNewComment('')
            onCommentsUpdated?.()
        } catch (err) {
            setError('Failed to create comment')
            console.error('Error creating comment:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleEditComment = (comment: Comment) => {
        setEditingComment(comment)
        setEditingText(comment.text)
    }

    const handleSaveEdit = async () => {
        if (!editingComment || !editingText.trim()) {
            setError('Comment text is required')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const request: UpdateCommentRequest = {
                id: editingComment.id,
                valueId: editingComment.valueId,
                author: editingComment.author,
                text: editingText.trim()
            }

            const updatedComment = await CommentService.updateComment(editingComment.id, request)
            setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c))
            setEditingComment(null)
            setEditingText('')
            onCommentsUpdated?.()
        } catch (err) {
            setError('Failed to update comment')
            console.error('Error updating comment:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingComment(null)
        setEditingText('')
    }

    const handleDeleteComment = async (comment: Comment) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return
        }

        setLoading(true)
        setError(null)
        try {
            await CommentService.deleteComment(comment.id)
            setComments(prev => prev.filter(c => c.id !== comment.id))
            onCommentsUpdated?.()
        } catch (err) {
            setError('Failed to delete comment')
            console.error('Error deleting comment:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            action()
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    if (!isOpen) return null

    return (
        <div className="comments-modal-overlay" onClick={onClose}>
            <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
                <div className="comments-modal-header">
                    <h3>Comments for {propertyKey} ({language})</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="comments-modal-content">
                    {error && (
                        <div className="error-message">
                            {error}
                            <button onClick={() => setError(null)}>×</button>
                        </div>
                    )}

                    {loading && <div className="loading-message">Loading...</div>}

                    {/* Lista commenti esistenti */}
                    <div className="comments-list">
                        {comments.length === 0 && !loading ? (
                            <p className="no-comments">No comments available</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="comment-item">
                                    {editingComment?.id === comment.id ? (
                                        <div className="comment-edit">
                                            <div className="comment-edit-field">
                                                <label>Comment:</label>
                                                <textarea
                                                    value={editingText}
                                                    onChange={(e) => setEditingText(e.target.value)}
                                                    className="comment-edit-input"
                                                    rows={3}
                                                    onKeyDown={(e) => handleKeyDown(e, handleSaveEdit)}
                                                />
                                            </div>
                                            <div className="comment-edit-actions">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="save-comment-btn"
                                                    disabled={loading}
                                                >
                                                    💾 Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="cancel-comment-btn"
                                                    disabled={loading}
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="comment-display">
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.author}</span>
                                                <span className="comment-date">{formatDate(comment.insertDate)}</span>
                                                {comment.updateDate !== comment.insertDate && (
                                                    <span className="comment-updated">(edited {formatDate(comment.updateDate)})</span>
                                                )}
                                            </div>
                                            <p className="comment-text">{comment.text}</p>
                                            <div className="comment-actions">
                                                <button
                                                    onClick={() => handleEditComment(comment)}
                                                    className="edit-comment-btn"
                                                    disabled={loading}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(comment)}
                                                    className="delete-comment-btn"
                                                    disabled={loading}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Form per nuovo commento */}
                    <div className="add-comment-section">
                        <h4>Add new comment</h4>
                        <div className="add-comment-field">
                            <label>Comment:</label>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write your comment here..."
                                className="new-comment-input"
                                rows={3}
                                onKeyDown={(e) => handleKeyDown(e, handleAddComment)}
                            />
                        </div>
                        <div className="add-comment-actions">
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || loading}
                                className="add-comment-btn"
                            >
                                ➕ Add Comment
                            </button>
                        </div>
                        <p className="keyboard-hint">💡 Tip: Press Ctrl+Enter (or Cmd+Enter on Mac) to save quickly</p>
                    </div>
                </div>
            </div>
        </div>
    )
}