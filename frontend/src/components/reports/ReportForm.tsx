// Composant de formulaire pour la création et l'édition des rapports techniques
// Gère la soumission des données et la validation

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Autocomplete
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import reportService, { TechnicalReport, ReportFormData } from '../../services/reportService';
import projectService, { Project } from '../../services/projectService';
import userService, { User } from '../../services/userService';

// Interface pour les projets
interface Project {
    id: number;
    name: string;
}

// Interface pour les utilisateurs (relecteurs)
interface User {
    id: number;
    username: string;
}

const ReportForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    // États du formulaire
    const [formData, setFormData] = useState<ReportFormData>({
        title: '',
        content: '',
        project: 0,
        reviewers: []
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Chargement des données initiales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                // Charger les projets et les utilisateurs
                const [projectsData, usersData] = await Promise.all([
                    projectService.getProjects(),
                    userService.getUsers()
                ]);
                setProjects(projectsData);
                setUsers(usersData);

                // Si en mode édition, charger les données du rapport
                if (isEditing && id) {
                    const report = await reportService.getReport(parseInt(id));
                    setFormData({
                        title: report.title,
                        content: report.content,
                        project: report.project,
                        reviewers: report.reviewers
                    });
                }
            } catch (err) {
                setError("Erreur lors du chargement des données");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [id, isEditing]);

    // Gestion des changements dans le formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name as string]: value
        }));
    };

    // Gestion du contenu de l'éditeur
    const handleEditorChange = (content: string) => {
        setFormData(prev => ({
            ...prev,
            content
        }));
    };

    // Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (isEditing && id) {
                await reportService.updateReport(parseInt(id), formData);
            } else {
                await reportService.createReport(formData);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/reports');
            }, 1500);
        } catch (err) {
            setError("Erreur lors de la sauvegarde du rapport");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditing ? 'Modifier le Rapport' : 'Nouveau Rapport'}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Rapport {isEditing ? 'modifié' : 'créé'} avec succès !
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Titre"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}
                    />

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Projet</InputLabel>
                        <Select
                            name="project"
                            value={formData.project}
                            onChange={handleChange}
                            required
                        >
                            {projects.map(project => (
                                <MenuItem key={project.id} value={project.id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Autocomplete
                        multiple
                        options={users}
                        getOptionLabel={(option) => option.username}
                        value={users.filter(user => formData.reviewers.includes(user.id))}
                        onChange={(event, newValue) => {
                            setFormData(prev => ({
                                ...prev,
                                reviewers: newValue.map(user => user.id)
                            }));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Relecteurs"
                                sx={{ mb: 3 }}
                            />
                        )}
                    />

                    <Box sx={{ mb: 3 }}>
                        <Editor
                            apiKey="votre-clé-tinymce"
                            init={{
                                height: 500,
                                menubar: true,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                    'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                                    'fullscreen', 'insertdatetime', 'media', 'table', 'code',
                                    'help', 'wordcount'
                                ],
                                toolbar: 'undo redo | blocks | ' +
                                    'bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | help'
                            }}
                            value={formData.content}
                            onEditorChange={handleEditorChange}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/reports')}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {isEditing ? 'Modifier' : 'Créer'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default ReportForm; 