/**
 * Page de gestion des documents d'un projet
 * Permet de visualiser et gérer les documents techniques requis pour un projet
 */

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import ProjectService from "../services/projectService";
import DocumentService from "../services/documentService";
import { Project } from "../types/project";
import { Document, DocumentAssignment } from "../types/document";
import { User } from "../types/user";
import { useAuthContext } from "../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import axios from "axios";

const ProjectDocuments = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isRoleAssignmentOpen, setIsRoleAssignmentOpen] = useState(false);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Récupérer la liste des rédacteurs
  const { data: writers } = useQuery<User[]>({
    queryKey: ['users', 'WRITER'],
    queryFn: async () => {
      console.log('Fetching writers...');
      const response = await api.get('/api/users/', {
        params: { role: 'WRITER,ADMIN' }
      });
      console.log('Writers response:', response.data);
      return response.data;
    }
  });

  // Récupérer la liste des relecteurs
  const { data: reviewers } = useQuery<User[]>({
    queryKey: ['users', 'REVIEWER'],
    queryFn: async () => {
      console.log('Fetching reviewers...');
      const response = await api.get('/api/users/', {
        params: { role: 'REVIEWER,ADMIN' }
      });
      console.log('Reviewers response:', response.data);
      return response.data;
    }
  });

  // Mutation pour l'assignation des rôles
  const assignRolesMutation = useMutation({
    mutationFn: (assignment: DocumentAssignment) =>
      DocumentService.assignRoles(project!.id, selectedDocument!.id, assignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Rôles assignés avec succès');
      setIsRoleAssignmentOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation des rôles');
    }
  });

  // Chargement des données du projet
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        const projectData = await ProjectService.getProject(parseInt(id));
        setProject(projectData);
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'NOT_STARTED': 'bg-gray-500',
      'IN_PROGRESS': 'bg-yellow-500',
      'UNDER_REVIEW': 'bg-blue-500',
      'IN_CORRECTION': 'bg-orange-500',
      'APPROVED': 'bg-green-500'
    };
    return statusColors[status] || 'bg-gray-500';
  };

  const handleRoleAssignment = (doc: Document) => {
    setSelectedDocument(doc);
    setIsRoleAssignmentOpen(true);
  };

  const handleAssignRoles = (writerId: string, reviewerId: string) => {
    if (!selectedDocument) return;

    const assignment: DocumentAssignment = {};
    if (writerId) assignment.writer_id = parseInt(writerId);
    if (reviewerId) assignment.reviewer_id = parseInt(reviewerId);

    // Vérifier que les IDs sont valides
    if (!assignment.writer_id && !assignment.reviewer_id) {
      toast.error('Veuillez sélectionner au moins un rédacteur ou un relecteur');
      return;
    }

    assignRolesMutation.mutate(assignment);
  };

  // Fonction pour créer ou récupérer le document mémoire technique et rediriger
  const handleRedigerMemoireTechnique = async (projectId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        '/api/documents/create_memoire_technique/',
        { project_id: projectId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const documentId = response.data.document_id;
      // Rediriger vers la page d'édition du mémoire technique
      navigate(`/projects/${projectId}/documents/${documentId}/memoire-technique`);
    } catch (error: any) {
      toast.error("Erreur lors de la création du document mémoire technique : " + (error?.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffec00]"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold">Projet non trouvé</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#ffec00]">
              Documents du projet : {project.name}
            </h1>
          </div>
        </CardHeader>
        <CardContent>
          {!project.project_documents || project.project_documents.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Aucun document requis n'a été défini pour ce projet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.project_documents.map((document) => (
                <Card key={document.id} className="hover:transform hover:scale-102 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-[#ffec00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white">
                          {document.document_type.type}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {document.document_type.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Statut:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status_display || document.status}
                        </span>
                      </div>
                    </div>

                    {document.writer && (
                      <div className="mt-2 text-sm text-gray-400">
                        Rédacteur: {document.writer.first_name} {document.writer.last_name}
                      </div>
                    )}

                    {document.reviewer && (
                      <div className="mt-2 text-sm text-gray-400">
                        Relecteur: {document.reviewer.first_name} {document.reviewer.last_name}
                      </div>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      {document.document_type.type === 'MEMO_TECHNIQUE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#ffec00] border-[#ffec00] hover:bg-[#ffec00]/10"
                          onClick={() => handleRedigerMemoireTechnique(project.id)}
                        >
                          Rédiger le document
                        </Button>
                      )}
                      
                      {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#ffec00] border-[#ffec00] hover:bg-[#ffec00]/10"
                          onClick={() => handleRoleAssignment(document as Document)}
                        >
                          Assigner les rôles
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour l'assignation des rôles */}
      <Dialog open={isRoleAssignmentOpen} onOpenChange={setIsRoleAssignmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner les rôles</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#ffec00]">
                Rédacteur
              </label>
              <Select
                value={selectedDocument?.writer?.id.toString()}
                onValueChange={(value: string) => handleAssignRoles(value, selectedDocument?.reviewer?.id.toString() || '')}
              >
                <SelectTrigger className="border-[#ffec00] text-[#ffec00] hover:bg-[#ffec00]/10">
                  <SelectValue placeholder="Sélectionner un rédacteur" />
                </SelectTrigger>
                <SelectContent className="border-[#ffec00] bg-gray-900">
                  {writers?.map((writer: User) => (
                    <SelectItem
                      key={writer.id}
                      value={writer.id.toString()}
                      className="text-[#ffec00] hover:bg-[#ffec00]/10"
                    >
                      {writer.first_name} {writer.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[#ffec00]">
                Relecteur
              </label>
              <Select
                value={selectedDocument?.reviewer?.id.toString()}
                onValueChange={(value: string) => handleAssignRoles(selectedDocument?.writer?.id.toString() || '', value)}
              >
                <SelectTrigger className="border-[#ffec00] text-[#ffec00] hover:bg-[#ffec00]/10">
                  <SelectValue placeholder="Sélectionner un relecteur" />
                </SelectTrigger>
                <SelectContent className="border-[#ffec00] bg-gray-900">
                  {reviewers?.map((reviewer: User) => (
                    <SelectItem
                      key={reviewer.id}
                      value={reviewer.id.toString()}
                      className="text-[#ffec00] hover:bg-[#ffec00]/10"
                    >
                      {reviewer.first_name} {reviewer.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDocuments; 