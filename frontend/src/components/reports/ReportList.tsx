// Composant qui affiche la liste des rapports techniques
// Permet de filtrer les rapports et d'effectuer différentes actions

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    ButtonGroup,
    Typography,
    Box,
    Tabs,
    Tab,
    CircularProgress,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import reportService, { TechnicalReport } from '../../services/reportService';

// Interface pour les propriétés des onglets
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

// Composant pour le contenu des onglets
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

// Composant principal de la liste des rapports
const ReportList: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [reports, setReports] = useState<TechnicalReport[]>([]);

    // Chargement des rapports en fonction de l'onglet sélectionné
    const loadReports = async (tab: number) => {
        try {
            setLoading(true);
            setError(null);
            let data: TechnicalReport[];
            switch (tab) {
                case 0: // Tous les rapports
                    data = await reportService.getReports();
                    break;
                case 1: // Mes rapports
                    data = await reportService.getMyReports();
                    break;
                case 2: // À relire
                    data = await reportService.getReportsToReview();
                    break;
                default:
                    data = await reportService.getReports();
            }
            setReports(data);
        } catch (err) {
            setError("Erreur lors du chargement des rapports");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Chargement initial et lors du changement d'onglet
    useEffect(() => {
        loadReports(tabValue);
    }, [tabValue]);

    // Gestion du changement d'onglet
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Suppression d'un rapport
    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
            try {
                await reportService.deleteReport(id);
                loadReports(tabValue);
            } catch (err) {
                setError("Erreur lors de la suppression du rapport");
                console.error(err);
            }
        }
    };

    // Rendu du composant
    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Rapports Techniques
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/reports/new')}
                >
                    Nouveau Rapport
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Tous les rapports" />
                    <Tab label="Mes rapports" />
                    <Tab label="À relire" />
                </Tabs>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TabPanel value={tabValue} index={tabValue}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Titre</TableCell>
                                    <TableCell>Projet</TableCell>
                                    <TableCell>Auteur</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Date de création</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>{report.title}</TableCell>
                                        <TableCell>{report.project_name}</TableCell>
                                        <TableCell>{report.author_name}</TableCell>
                                        <TableCell>{report.status_display}</TableCell>
                                        <TableCell>
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <ButtonGroup size="small">
                                                <Button
                                                    onClick={() => navigate(`/reports/${report.id}`)}
                                                >
                                                    Voir
                                                </Button>
                                                <Button
                                                    onClick={() => navigate(`/reports/${report.id}/edit`)}
                                                >
                                                    Modifier
                                                </Button>
                                                <Button
                                                    color="error"
                                                    onClick={() => handleDelete(report.id)}
                                                >
                                                    Supprimer
                                                </Button>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </TabPanel>
        </Box>
    );
};

export default ReportList; 