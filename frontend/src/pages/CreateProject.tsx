/**
 * CreateProject.tsx
 * Page de création d'un nouveau projet
 * Formulaire permettant de saisir les informations d'un nouveau projet
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardHeader,
  MenuItem, 
  Grid, 
  Autocomplete, 
  Avatar, 
  FormControlLabel, 
  Checkbox, 
  FormGroup, 
  FormControl, 
  FormLabel, 
  Divider,
  Paper,
  Container,
  Alert
} from '@mui/material';
import ProjectService from '../services/projectService';
import MOAService, { MOA } from '../services/moaService';
import MOEService, { MOE } from '../services/moeService';
import DocumentTypeService, { DocumentType } from '../services/documentTypeService';
import api from '../services/api';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

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
    maitre_ouvrage: undefined as number | undefined,
    maitre_oeuvre: undefined as number | undefined,
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ 
        p: 3, 
        backgroundColor: 'transparent',
        backdropFilter: 'blur(8px)'
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 600,
          color: '#ffec00',
          mb: 4 
        }}>
          Créer un nouveau projet
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Section Informations Générales */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                color: 'white'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#ffec00',
                  fontWeight: 500,
                  mb: 3
                }}>
                  Informations Générales
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nom du projet"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 236, 0, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 236, 0, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ffec00',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: 'white',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date de remise de l'offre"
                      name="offer_delivery_date"
                      type="date"
                      value={formData.offer_delivery_date}
                      onChange={handleChange}
                      required
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 236, 0, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 236, 0, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ffec00',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: 'white',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Section Maîtrise d'Ouvrage */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                height: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                color: 'white'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#ffec00',
                  fontWeight: 500,
                  mb: 3
                }}>
                  Maître d'Ouvrage
                </Typography>
                <Autocomplete
                  options={moas}
                  getOptionLabel={(option) => option.name}
                  value={selectedMOA}
                  onChange={handleMOASelection}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sélectionner le maître d'ouvrage"
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 236, 0, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 236, 0, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ffec00',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: 'white',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ 
                      '&:hover': { backgroundColor: 'rgba(255, 236, 0, 0.1)' },
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {option.logo && (
                          <Avatar
                            src={`data:image/png;base64,${option.logo}`}
                            alt={option.name}
                            sx={{ width: 40, height: 40 }}
                          />
                        )}
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: 'white' }}>{option.name}</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {option.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                />
                {selectedMOA && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    backgroundColor: 'rgba(255, 236, 0, 0.1)', 
                    borderRadius: 1 
                  }}>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                      {selectedMOA.logo && (
                        <Avatar
                          src={`data:image/png;base64,${selectedMOA.logo}`}
                          alt={selectedMOA.name}
                          sx={{ width: 80, height: 80 }}
                          variant="rounded"
                        />
                      )}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ffec00' }}>
                          {selectedMOA.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                          {selectedMOA.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Section Maîtrise d'Œuvre */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                height: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                color: 'white'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#ffec00',
                  fontWeight: 500,
                  mb: 3
                }}>
                  Maître d'Œuvre
                </Typography>
                <Autocomplete
                  options={moes}
                  getOptionLabel={(option) => option.name}
                  value={selectedMOE}
                  onChange={handleMOESelection}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sélectionner le maître d'œuvre"
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 236, 0, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 236, 0, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ffec00',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: 'white',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ 
                      '&:hover': { backgroundColor: 'rgba(255, 236, 0, 0.1)' },
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {option.logo && (
                          <Avatar
                            src={`data:image/png;base64,${option.logo}`}
                            alt={option.name}
                            sx={{ width: 40, height: 40 }}
                          />
                        )}
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: 'white' }}>{option.name}</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {option.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                />
                {selectedMOE && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    backgroundColor: 'rgba(255, 236, 0, 0.1)', 
                    borderRadius: 1 
                  }}>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                      {selectedMOE.logo && (
                        <Avatar
                          src={`data:image/png;base64,${selectedMOE.logo}`}
                          alt={selectedMOE.name}
                          sx={{ width: 80, height: 80 }}
                          variant="rounded"
                        />
                      )}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ffec00' }}>
                          {selectedMOE.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                          {selectedMOE.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Section Documents Requis */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ 
                p: 3,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                color: 'white'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#ffec00',
                  fontWeight: 500,
                  mb: 3
                }}>
                  Documents Requis
                </Typography>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <Grid container spacing={2}>
                    {documentTypes.map((docType) => (
                      <Grid item xs={12} sm={6} md={4} key={docType.id}>
                        <Paper 
                          elevation={1} 
                          sx={{ 
                            p: 2,
                            backgroundColor: selectedDocuments.includes(docType.id) 
                              ? 'rgba(255, 236, 0, 0.2)' 
                              : 'rgba(0, 0, 0, 0.3)',
                            transition: 'background-color 0.3s',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 236, 0, 0.1)'
                            }
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedDocuments.includes(docType.id)}
                                onChange={() => handleDocumentSelection(docType.id)}
                                sx={{
                                  color: 'rgba(255, 236, 0, 0.5)',
                                  '&.Mui-checked': {
                                    color: '#ffec00',
                                  },
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffec00' }}>
                                  {docType.type}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}>
                                  {docType.description}
                                </Typography>
                              </Box>
                            }
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </FormControl>
              </Paper>
            </Grid>

            {/* Section Documents de Référence */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ 
                p: 3,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                color: 'white'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#ffec00',
                  fontWeight: 500,
                  mb: 3
                }}>
                  Documents de Référence
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<CloudUploadIcon sx={{ color: '#ffec00' }} />}
                      sx={{
                        p: 2,
                        border: '2px dashed',
                        borderColor: 'rgba(255, 236, 0, 0.3)',
                        color: '#ffec00',
                        '&:hover': {
                          borderColor: '#ffec00',
                          backgroundColor: 'rgba(255, 236, 0, 0.1)'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#ffec00' }}>
                          {referenceDocuments.RC ? referenceDocuments.RC.name : 'Télécharger le RC'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Format PDF uniquement
                        </Typography>
                      </Box>
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
                      startIcon={<CloudUploadIcon sx={{ color: '#ffec00' }} />}
                      sx={{
                        p: 2,
                        border: '2px dashed',
                        borderColor: 'rgba(255, 236, 0, 0.3)',
                        color: '#ffec00',
                        '&:hover': {
                          borderColor: '#ffec00',
                          backgroundColor: 'rgba(255, 236, 0, 0.1)'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#ffec00' }}>
                          {referenceDocuments.CCTP ? referenceDocuments.CCTP.name : 'Télécharger le CCTP'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Format PDF uniquement
                        </Typography>
                      </Box>
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
              </Paper>
            </Grid>

            {/* Boutons d'action */}
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2,
                mt: 2 
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    color: '#ffec00',
                    borderColor: 'rgba(255, 236, 0, 0.5)',
                    '&:hover': {
                      borderColor: '#ffec00',
                      backgroundColor: 'rgba(255, 236, 0, 0.1)'
                    }
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    px: 6,
                    py: 1.5,
                    backgroundColor: '#ffec00',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 236, 0, 0.8)'
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255, 236, 0, 0.3)'
                    }
                  }}
                >
                  {loading ? "Création en cours..." : "Créer le projet"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateProject; 