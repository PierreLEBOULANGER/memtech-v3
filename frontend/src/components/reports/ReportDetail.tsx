// Composant qui affiche les détails d'un rapport technique
// Permet de visualiser le contenu et d'effectuer des actions comme l'approbation ou le rejet

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Send as SubmitIcon
} from '@mui/icons-material';
import reportService, { TechnicalReport } from '../../services/reportService';

const ReportDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<TechnicalReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Chargement des données du rapport
    useEffect(() => {
        const loadReport = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const data = await reportService.getReport(parseInt(id));
                setReport(data);
            } catch (err) {
                setError("Erreur lors du chargement du rapport");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [id]);

    // Gestion de la suppression
    const handleDelete = async () => {
        if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
        try {
            await reportService.deleteReport(parseInt(id));
            navigate('/reports');
        } catch (err) {
            setError("Erreur lors de la suppression du rapport");
            console.error(err);
        }
    };

    // Gestion de la soumission pour relecture
    const handleSubmitForReview = async () => {
        if (!id) return;
        try {
            const updatedReport = await reportService.submitForReview(parseInt(id));
            setReport(updatedReport);
            setSuccess("Rapport soumis pour relecture");
        } catch (err) {
            setError("Erreur lors de la soumission pour relecture");
            console.error(err);
        }
    };

    // Gestion de l'approbation
    const handleApprove = async () => {
        if (!id) return;
        try {
            const updatedReport = await reportService.approveReport(parseInt(id));
            setReport(updatedReport);
            setSuccess("Rapport approuvé");
        } catch (err) {
            setError("Erreur lors de l'approbation du rapport");
            console.error(err);
        }
    };

    // Gestion du rejet
    const handleReject = async () => {
        if (!id) return;
        try {
            const updatedReport = await reportService.rejectReport(parseInt(id));
            setReport(updatedReport);
            setSuccess("Rapport rejeté");
            setRejectDialogOpen(false);
            setRejectReason('');
        } catch (err) {
            setError("Erreur lors du rejet du rapport");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!report) {
        return (
            <Alert severity="error">
                Rapport non trouvé
            </Alert>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Paper sx={{ p: 3 }}>
                {/* En-tête */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        {report.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/reports/${id}/edit`)}
                        >
                            Modifier
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                        >
                            Supprimer
                        </Button>
                    </Box>
                </Box>

                {/* Messages de succès/erreur */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                {/* Informations du rapport */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Projet : {report.project_name}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Auteur : {report.author_name}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Statut : <Chip label={report.status_display} color="primary" size="small" />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Créé le : {new Date(report.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Dernière modification : {new Date(report.updated_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            Relecteurs : {report.reviewer_names.join(', ')}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* Contenu du rapport */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Contenu
                    </Typography>
                    <div dangerouslySetInnerHTML={{ __html: report.content }} />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    {report.status === 'draft' && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SubmitIcon />}
                            onClick={handleSubmitForReview}
                        >
                            Soumettre pour relecture
                        </Button>
                    )}
                    {report.status === 'pending_review' && (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={handleApprove}
                            >
                                Approuver
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => setRejectDialogOpen(true)}
                            >
                                Rejeter
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>

            {/* Dialog de rejet */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Rejeter le rapport</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Raison du rejet"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleReject} color="error">
                        Rejeter
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportDetail; 