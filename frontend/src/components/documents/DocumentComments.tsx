/**
 * DocumentComments.tsx
 * Composant pour afficher et gérer les commentaires d'un document
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'react-toastify';
import DocumentService from '../../services/documentService';
import { Document, DocumentComment } from '../../types/document';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentCommentsProps {
    projectId: number;
    document: Document;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({
    projectId,
    document
}) => {
    const [newComment, setNewComment] = useState('');
    const [requiresCorrection, setRequiresCorrection] = useState(false);
    const queryClient = useQueryClient();

    // Mutation pour ajouter un commentaire
    const addCommentMutation = useMutation({
        mutationFn: (content: string) =>
            DocumentService.addComment(projectId, document.id, content, requiresCorrection),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
            setNewComment('');
            setRequiresCorrection(false);
            toast.success('Commentaire ajouté avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du commentaire');
        }
    });

    // Mutation pour résoudre un commentaire
    const resolveCommentMutation = useMutation({
        mutationFn: (commentId: number) =>
            DocumentService.resolveComment(projectId, document.id, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
            toast.success('Commentaire résolu');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la résolution du commentaire');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            addCommentMutation.mutate(newComment);
        }
    };

    return (
        <div className="space-y-6">
            {/* Liste des commentaires */}
            <div className="space-y-4">
                {document.comments.map((comment, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg ${
                            comment.requires_correction
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-medium">
                                    {comment.user.first_name} {comment.user.last_name}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                    {format(new Date(comment.timestamp), 'PPp', { locale: fr })}
                                </span>
                            </div>
                            {!comment.resolved && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resolveCommentMutation.mutate(comment.id)}
                                >
                                    Résoudre
                                </Button>
                            )}
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                        {comment.requires_correction && (
                            <div className="mt-2 text-sm text-red-600">
                                Nécessite des corrections
                            </div>
                        )}
                        {comment.resolved && (
                            <div className="mt-2 text-sm text-green-600">
                                Résolu
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Formulaire d'ajout de commentaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    rows={3}
                />
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="requiresCorrection"
                        checked={requiresCorrection}
                        onCheckedChange={(checked) => setRequiresCorrection(checked as boolean)}
                    />
                    <label
                        htmlFor="requiresCorrection"
                        className="text-sm font-medium"
                    >
                        Nécessite des corrections
                    </label>
                </div>
                <Button
                    type="submit"
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                    {addCommentMutation.isPending ? 'Ajout...' : 'Ajouter le commentaire'}
                </Button>
            </form>
        </div>
    );
};

export default DocumentComments; 