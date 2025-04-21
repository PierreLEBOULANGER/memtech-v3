/**
 * CreateProject.tsx
 * Page de création d'un nouveau projet
 * Formulaire permettant de saisir les informations d'un nouveau projet
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Card, CardContent, CardHeader, MenuItem, Grid, Autocomplete, Avatar, FormControlLabel, Checkbox, FormGroup, FormControl, FormLabel, Divider } from '@mui/material';
import ProjectService from '../services/projectService';
import MOAService, { MOA } from '../services/moaService';
import MOEService, { MOE } from '../services/moeService';
import DocumentTypeService, { DocumentType } from '../services/documentTypeService';
import api from '../services/api';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moas, setMOAs] = useState<MOA[]>([]);
  const [moes, setMOEs] = useState<MOE[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedMOA, setSelectedMOA] = useState<MOA | null>(null);
  const [selectedMOE, setSelectedMOE] = useState<MOE | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [referenceDocuments, setReferenceDocuments] = useState<{
    RC: File | null;
    CCTP: File | null;
  }>({
    RC: null,
    CCTP: null
  });

  const [formData, setFormData] = useState({
    name: '',
    offer_delivery_date: '',
    maitre_ouvrage: '',
    maitre_oeuvre: '',
    status: 'PENDING'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moaData, moeData, docTypeData] = await Promise.all([
          MOAService.getMOAs(),
          MOEService.getMOEs(),
          DocumentTypeService.getDocumentTypes()
        ]);
        setMOAs(moaData);
        setMOEs(moeData);
        setDocumentTypes(docTypeData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMOASelection = (event: React.SyntheticEvent, newValue: MOA | null) => {
    setSelectedMOA(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        maitre_ouvrage: newValue.id
      }));
    }
  };

  const handleMOESelection = (event: React.SyntheticEvent, newValue: MOE | null) => {
    setSelectedMOE(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        maitre_oeuvre: newValue.id
      }));
    }
  };

  const handleDocumentSelection = (docTypeId: number) => {
    setSelectedDocuments(prev => {
      if (prev.includes(docTypeId)) {
        return prev.filter(id => id !== docTypeId);
      } else {
        return [...prev, docTypeId];
      }
    });
  };

  const handleFileUpload = (type: 'RC' | 'CCTP', file: File) => {
    setReferenceDocuments(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Vérifier que les champs requis sont remplis
      if (!formData.name || !formData.offer_delivery_date || !selectedMOA || !selectedMOE) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      // Créer le projet
      const project = await ProjectService.createProject({
        ...formData,
        maitre_ouvrage: selectedMOA.id,
        maitre_oeuvre: selectedMOE.id
      });

      // Ajouter les documents requis
      if (selectedDocuments.length > 0) {
        await ProjectService.addRequiredDocuments(project.id, selectedDocuments);
      }

      // Uploader les documents de référence
      if (referenceDocuments.RC) {
        const rcFormData = new FormData();
        rcFormData.append('file', referenceDocuments.RC);
        rcFormData.append('type', 'RC');
        const token = localStorage.getItem('access_token');
        await api.post(`/api/projects/${project.id}/reference-documents/`, rcFormData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      }

      if (referenceDocuments.CCTP) {
        const cctpFormData = new FormData();
        cctpFormData.append('file', referenceDocuments.CCTP);
        cctpFormData.append('type', 'CCTP');
        const token = localStorage.getItem('access_token');
        await api.post(`/api/projects/${project.id}/reference-documents/`, cctpFormData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      }

      // Rediriger vers la liste des projets
      navigate('/projects');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du projet";
      setError(errorMessage);
      console.error('Erreur lors de la création du projet:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardHeader title="Créer un nouveau projet" />
        <CardContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du projet"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de remise de l'offre"
                  name="offer_delivery_date"
                  type="date"
                  value={formData.offer_delivery_date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={moas}
                  getOptionLabel={(option) => option.name}
                  value={selectedMOA}
                  onChange={handleMOASelection}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Maître d'ouvrage"
                      required
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.logo && (
                          <Avatar
                            src={`data:image/png;base64,${option.logo}`}
                            alt={option.name}
                            sx={{ width: 24, height: 24 }}
                          />
                        )}
                        <Box>
                          <Typography>{option.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {option.address}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  )}
                />
              </Grid>

              {selectedMOA && (
                <Grid item xs={12}>
                  <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                        {selectedMOA.logo && (
                          <Avatar
                            src={`data:image/png;base64,${selectedMOA.logo}`}
                            alt={selectedMOA.name}
                            sx={{ width: 100, height: 100 }}
                            variant="rounded"
                          />
                        )}
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {selectedMOA.name}
                          </Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {selectedMOA.address}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={moes}
                  getOptionLabel={(option) => option.name}
                  value={selectedMOE}
                  onChange={handleMOESelection}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Maître d'œuvre"
                      required
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.logo && (
                          <Avatar
                            src={`data:image/png;base64,${option.logo}`}
                            alt={option.name}
                            sx={{ width: 24, height: 24 }}
                          />
                        )}
                        <Box>
                          <Typography>{option.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {option.address}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  )}
                />
              </Grid>

              {selectedMOE && (
                <Grid item xs={12}>
                  <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                        {selectedMOE.logo && (
                          <Avatar
                            src={`data:image/png;base64,${selectedMOE.logo}`}
                            alt={selectedMOE.name}
                            sx={{ width: 100, height: 100 }}
                            variant="rounded"
                          />
                        )}
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {selectedMOE.name}
                          </Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {selectedMOE.address}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <FormControl component="fieldset">
                  <FormLabel component="legend">Documents requis pour ce projet</FormLabel>
                  <FormGroup>
                    {documentTypes.map((docType) => (
                      <FormControlLabel
                        key={docType.id}
                        control={
                          <Checkbox
                            checked={selectedDocuments.includes(docType.id)}
                            onChange={() => handleDocumentSelection(docType.id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">{docType.type}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {docType.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <FormControl component="fieldset">
                  <FormLabel component="legend">Documents de référence</FormLabel>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                      >
                        {referenceDocuments.RC ? referenceDocuments.RC.name : 'Télécharger le RC'}
                        <input
                          type="file"
                          hidden
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload('RC', e.target.files[0]);
                            }
                          }}
                        />
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                      >
                        {referenceDocuments.CCTP ? referenceDocuments.CCTP.name : 'Télécharger le CCTP'}
                        <input
                          type="file"
                          hidden
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload('CCTP', e.target.files[0]);
                            }
                          }}
                        />
                      </Button>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? "Création en cours..." : "Créer le projet"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateProject; 