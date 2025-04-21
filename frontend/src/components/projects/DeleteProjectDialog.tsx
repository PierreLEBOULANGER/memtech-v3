/**
 * DeleteProjectDialog.tsx
 * Composant de dialogue pour confirmer la suppression d'un projet
 * Requiert la saisie du mot de passe de l'administrateur pour confirmation
 */

import React, { useState } from 'react';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  isOpen,
  projectName,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Mot de passe incorrect');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-[#ffec00] mb-4">
          Supprimer le projet
        </h2>
        
        <p className="text-white mb-4">
          Vous êtes sur le point de supprimer le projet <span className="font-semibold">{projectName}</span>. 
          Cette action est irréversible.
        </p>
        
        <p className="text-gray-400 mb-4">
          Pour confirmer, veuillez saisir votre mot de passe administrateur.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe administrateur"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-[#ffec00]"
              required
            />
            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting || !password}
            >
              {isSubmitting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteProjectDialog; 