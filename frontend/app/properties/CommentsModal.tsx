'use client'

import { useState } from 'react'
import './CommentsModal.css'

export interface Comment {
    id: string
    text: string
    createdAt: string
    author?: string
}

interface CommentsModalProps {
    isOpen: boolean
    onClose: () => void
    comments: string[]
    onUpdateComments: (comments: string[]) => void
    propertyKey: string
    language: string
}

export default function CommentsModal({
    isOpen,
    onClose,
    comments,
    onUpdateComments,
    propertyKey,
    language
}: CommentsModalProps) {
    const [newComment, setNewComment] = useState('')
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editingText, setEditingText] = useState('')

    const handleAddComment = () => {
        if (newComment.trim()) {
            const updatedComments = [...comments, newComment.trim()]
            onUpdateComments(updatedComments)
            setNewComment('')
        }
    }

    const handleEditComment = (index: number) => {
        setEditingIndex(index)
        setEditingText(comments[index])
    }

    const handleSaveEdit = () => {
        if (editingIndex !== null && editingText.trim()) {
            const updatedComments = [...comments]
            updatedComments[editingIndex] = editingText.trim()
            onUpdateComments(updatedComments)
            setEditingIndex(null)
            setEditingText('')
        }
    }

    const handleCancelEdit = () => {
        setEditingIndex(null)
        setEditingText('')
    }

    const handleDeleteComment = (index: number) => {
        if (confirm('Sei sicuro di voler eliminare questo commento?')) {
            const updatedComments = comments.filter((_, i) => i !== index)
            onUpdateComments(updatedComments)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            action()
        }
    }

    if (!isOpen) return null

    return (
        <div className="comments-modal-overlay" onClick={onClose}>
            <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
                <div className="comments-modal-header">
                    <h3>Commenti per {propertyKey} ({language})</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="comments-modal-content">
                    {/* Lista commenti esistenti */}
                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <p className="no-comments">Nessun commento presente</p>
                        ) : (
                            comments.map((comment, index) => (
                                <div key={index} className="comment-item">
                                    {editingIndex === index ? (
                                        <div className="comment-edit">
                                            <textarea
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                className="comment-edit-input"
                                                rows={3}
                                                onKeyDown={(e) => handleKeyDown(e, handleSaveEdit)}
                                            />
                                            <div className="comment-edit-actions">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="save-comment-btn"
                                                >
                                                    💾 Salva
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="cancel-comment-btn"
                                                >
                                                    ❌ Annulla
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="comment-display">
                                            <p className="comment-text">{comment}</p>
                                            <div className="comment-actions">
                                                <button
                                                    onClick={() => handleEditComment(index)}
                                                    className="edit-comment-btn"
                                                >
                                                    ✏️ Modifica
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(index)}
                                                    className="delete-comment-btn"
                                                >
                                                    🗑️ Elimina
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
                        <h4>Aggiungi nuovo commento</h4>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Scrivi il tuo commento qui..."
                            className="new-comment-input"
                            rows={3}
                            onKeyDown={(e) => handleKeyDown(e, handleAddComment)}
                        />
                        <div className="add-comment-actions">
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="add-comment-btn"
                            >
                                ➕ Aggiungi Commento
                            </button>
                        </div>
                        <p className="keyboard-hint">💡 Suggerimento: Premi Ctrl+Enter (o Cmd+Enter su Mac) per salvare rapidamente</p>
                    </div>
                </div>
            </div>
        </div>
    )
}