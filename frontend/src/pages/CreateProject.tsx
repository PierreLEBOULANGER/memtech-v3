/**
 * CreateProject.tsx
 * Page de création d'un nouveau projet
 * Formulaire permettant de saisir les informations d'un nouveau projet
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Card, CardContent, CardHeader, MenuItem, Grid, Autocomplete, Avatar } from '@mui/material';
import ProjectService from '../services/projectService';
import MOAService, { MOA } from '../services/moaService';
import MOEService, { MOE } from '../services/moeService';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moas, setMOAs] = useState<MOA[]>([]);
  const [moes, setMOEs] = useState<MOE[]>([]);
  const [selectedMOA, setSelectedMOA] = useState<MOA | null>(null);
  const [selectedMOE, setSelectedMOE] = useState<MOE | null>(null);
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
        const [moaData, moeData] = await Promise.all([
          MOAService.getMOAs(),
          MOEService.getMOEs()
        ]);
        setMOAs(moaData);
        setMOEs(moeData);
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
        maitre_ouvrage: newValue.name
      }));
    }
  };

  const handleMOESelection = (event: React.SyntheticEvent, newValue: MOE | null) => {
    setSelectedMOE(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        maitre_oeuvre: newValue.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ProjectService.createProject(formData);
      navigate('/projects');
    } catch (err) {
      setError("Erreur lors de la création du projet");
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                  <MenuItem value="COMPLETED">Terminé</MenuItem>
                  <MenuItem value="CANCELLED">Annulé</MenuItem>
                </TextField>
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
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer le projet'}
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