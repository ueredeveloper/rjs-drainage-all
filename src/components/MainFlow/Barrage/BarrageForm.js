import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Input,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormLabel,
  Chip,
  Avatar
} from '@mui/material';

import WallpaperIcon from '@mui/icons-material/Wallpaper';
import LayersIcon from '@mui/icons-material/Layers';
import { useData } from '../../../hooks/analyse-hooks';
import { calculateReservoirBalance } from '../../../services/barrage';
import { numberWithCommas } from '../../../tools';

const months = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export default function BarrageForm() {
  const { marker } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [highlightUpdatedRows, setHighlightUpdatedRows] = useState(false);

  const [damData, setDamData] = useState({
    Max_Volume: 374411.5,
    Min_Volume: 374411.5,
    Tot_Area: 10.02,
    M_Infiltration: 0.00000022219,
    Q_Reg: 0.0341987545584542,
    Min_Vol_Observed: 359643.6073,
    Q_Cap: 1.9178
  });

  const [operacao, setOperacao] = useState({
    anos: 1,
    Meses: months,
    Dias: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    Evaporacao: [130.06, 141.88, 136.4, 126.0, 108.5, 99.0, 105.4, 133.3, 147.0, 155.0, 135.0, 127.1],
    tempDia: [24, 24, 24, 24, 24, 0, 0, 0, 0, 24, 24, 24]
  });

  const handleDamChange = (e) => {
    const { name, value } = e.target;
    setDamData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleOperacaoChange = (name, value) => {
    setOperacao(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (arrayName, index, value) => {
    const newArray = [...operacao[arrayName]];
    newArray[index] = parseFloat(value);
    setOperacao(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const handleCalculate = async () => {
    if (!marker || !marker.int_latitude || !marker.int_longitude) {
      setError("Por favor, selecione ou busque uma coordenada válida.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      coordenadas: {
        latitude: parseFloat(marker.int_latitude),
        longitude: parseFloat(marker.int_longitude)
      },
      dam_data: damData,
      operacao: operacao
    };

    try {
      const data = await calculateReservoirBalance(payload);

      console.log("Resultado do cálculo do balanço hídrico:", data);
      setResult(data);
      setHighlightUpdatedRows(true);
      setTimeout(() => setHighlightUpdatedRows(false), 4000);
    } catch (err) {
      setError("Erro ao calcular o balanço hídrico. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ p: 0, pt: 2, pb: 2}}>
      <Grid container spacing={2}>
        {/* Dam Data Section */}
        <Grid item xs={12}>
          {result?.dbResult?.informacoes_adicionais && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: 'transparent', width: 24, height: 24 }}>
                    <WallpaperIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                }
                sx={{ m: 1, fontSize: "12px" }}
                label={`Área de Contribuição: ${result.dbResult.informacoes_adicionais.area_contribuicao?.toFixed(4)} km²`}
              />

              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: 'transparent', width: 24, height: 24 }}>
                    <LayersIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                }
                sx={{ m: 1, fontSize: "12px" }}
                label={`Unidade Hidrográfica: ${result.dbResult.informacoes_adicionais.uh_nome || ""} - UH ${result.dbResult.informacoes_adicionais.uh_rotulo || ""}`}
              />
            </Box>
          )}
          <FormLabel sx={{py: 4}} >Dados da Barragem</FormLabel>
          <Paper elevation={3} sx={{ p: 1 }}>
            
            <Grid container spacing={1} alignItems="center" sx={{ my: 1 }}>
              <Grid item xs={6} md>
                <TextField
                  fullWidth
                  label="V. Máx (m³)"
                  name="Max_Volume"
                  type="number"
                  value={damData.Max_Volume}
                  onChange={handleDamChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md>
                <TextField
                  fullWidth
                  label="V. Mín (m³)"
                  name="Min_Volume"
                  type="number"
                  value={damData.Min_Volume}
                  onChange={handleDamChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md>
                <TextField
                  fullWidth
                  label="Área (m²)"
                  name="Tot_Area"
                  type="number"
                  value={damData.Tot_Area}
                  onChange={handleDamChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md>
                <TextField
                  fullWidth
                  label="Infilt. (m/d)"
                  name="M_Infiltration"
                  type="number"
                  value={damData.M_Infiltration}
                  onChange={handleDamChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md>
                <TextField
                  fullWidth
                  label="Q Reg (m³/s)"
                  name="Q_Reg"
                  type="number"
                  value={damData.Q_Reg}
                  onChange={handleDamChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md>
                <TextField
                  fullWidth
                  label="Min Vol. Obs"
                  name="Min_Vol_Observed"
                  type="number"
                  value={damData.Min_Vol_Observed}
                  onChange={handleDamChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md>
                <TextField
                  fullWidth
                  label="Capt. (L/s)"
                  name="Q_Cap"
                  type="number"
                  value={damData.Q_Cap}
                  onChange={handleDamChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md>
                <FormControl fullWidth size="small">
                  <InputLabel>Anos</InputLabel>
                  <Select
                    value={operacao.anos}
                    label="Anos"
                    onChange={(e) => handleOperacaoChange('anos', e.target.value)}
                  >
                    {[...Array(10)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>{i + 1} Ano(s)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCalculate}
                  disabled={loading}
                  size="medium"
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : "Calcular"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Error Feedback */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {/* Tabs Section: Operation, Planilha, Bruta */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Abas de Dados e Resultado" variant="scrollable" scrollButtons="auto">
                <Tab label="Operação" />
                <Tab label="Planilha" disabled={!result} />
                <Tab label="Bruta" disabled={!result} />
              </Tabs>
            </Box>

            {/* Tab Panel: Operação */}
            <div role="tabpanel" hidden={tabIndex !== 0}>
              {tabIndex === 0 && (
                <Box sx={{ p: 1 }}>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', maxHeight: 440 }}>
                    <Table size="small" stickyHeader aria-label="tabela de operação">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', minWidth: 80, fontSize: '0.8rem', backgroundColor: 'background.paper' }}>Parâmetro</TableCell>
                          {months.map((m) => <TableCell key={m} align="center" sx={{ minWidth: 40, p: 0.5, fontSize: '0.8rem', backgroundColor: 'background.paper' }}>{m}</TableCell>)}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Linha Dias */}
                        <TableRow hover>
                          <TableCell component="th" scope="row" sx={{ fontSize: '0.8rem' }}>Dias</TableCell>
                          {operacao.Dias.map((d, i) => (
                            <TableCell key={i} padding="none" align="center">
                              <Select
                                value={d}
                                onChange={(e) => handleArrayChange('Dias', i, e.target.value)}
                                variant="standard"
                                disableUnderline
                                sx={{ fontSize: '0.8rem', '& .MuiSelect-select': { py: 0.5 } }}
                              >
                                {[...Array(31)].map((_, i) => <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>)}
                              </Select>
                            </TableCell>
                          ))}
                        </TableRow>
                        {/* Linha Evaporação */}
                        <TableRow hover>
                          <TableCell component="th" scope="row" sx={{ fontSize: '0.8rem' }}>Evap. (mm)</TableCell>
                          {operacao.Evaporacao.map((v, i) => (
                            <TableCell key={i} padding="none" align="center">
                              <Input
                                value={v}
                                onChange={(e) => handleArrayChange('Evaporacao', i, e.target.value)}
                                disableUnderline
                                inputProps={{ style: { textAlign: 'center', fontSize: '0.8rem', padding: '4px 0' }, type: 'number' }}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                        {/* Linha Temp Capt */}
                        <TableRow hover>
                          <TableCell component="th" scope="row" sx={{ fontSize: '0.8rem' }}>T. Cap (h)</TableCell>
                          {operacao.tempDia.map((v, i) => (
                            <TableCell key={i} padding="none" align="center">
                              <Input
                                value={v}
                                onChange={(e) => handleArrayChange('tempDia', i, e.target.value)}
                                disableUnderline
                                inputProps={{ style: { textAlign: 'center', fontSize: '0.8rem', padding: '4px 0' }, type: 'number' }}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                        {/* Linha Qmm (Regionalizada) */}
                        <TableRow hover sx={{
                          ...(highlightUpdatedRows && {
                            animation: 'pulse 1s infinite',
                            '@keyframes pulse': {
                              '0%': { backgroundColor: 'rgba(33, 150, 243, 0.1)' },
                              '50%': { backgroundColor: 'rgba(33, 150, 243, 0.3)' },
                              '100%': { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
                            }
                          })
                        }}>
                          <TableCell component="th" scope="row" sx={{ fontSize: '0.8rem' }}>Qmm (Reg.)</TableCell>
                          {months.map((_, i) => {
                            const v = result?.dbResult?.operacao?.QmmRegionalizada?.[i];
                            return (
                              <TableCell key={i} padding="none" align="center" sx={{ fontSize: '0.8rem' }}>{v !== undefined ? numberWithCommas(v, 4) : ''}</TableCell>
                            );
                          })}
                        </TableRow>
                        {/* Linha Q_defluente */}
                        <TableRow hover sx={{
                          ...(highlightUpdatedRows && {
                            animation: 'pulse 1s infinite',
                            '@keyframes pulse': {
                              '0%': { backgroundColor: 'rgba(33, 150, 243, 0.1)' },
                              '50%': { backgroundColor: 'rgba(33, 150, 243, 0.3)' },
                              '100%': { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
                            }
                          })
                        }}>
                          <TableCell component="th" scope="row" sx={{ fontSize: '0.8rem' }}>Q Defluente</TableCell>
                          {months.map((_, i) => {
                            const v = result?.dbResult?.operacao?.Q_defluente?.[i];
                            return (
                              <TableCell key={i} padding="none" align="center" sx={{ fontSize: '0.8rem' }}>{v !== undefined ? numberWithCommas(v, 4) : ''}</TableCell>
                            );
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </div>

            {/* Tab Panel: Planilha */}
            <div role="tabpanel" hidden={tabIndex !== 1}>
              {tabIndex === 1 && result && result.resultadoCalculo && (
                <Box sx={{ p: 1 }}>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 190, overflowY: 'auto' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.75rem' }}>Mês</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Qmm</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Entrada</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Infilt.</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Evap.</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Capt.</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>V. Final</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.75rem' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.resultadoCalculo.planilha.map((row, index) => (
                          <TableRow key={index} hover>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{row.Mes}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem', p:2 }}>{numberWithCommas(row.Qmmm_m3s, 4)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem', p:2 }}>{numberWithCommas(row.Entrada_m3_mes, 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem', p:2 }}>{numberWithCommas(row.Infiltracao_m3_mes, 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem', p:2 }}>{numberWithCommas(row.Evaporacao_m3_mes, 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem', p:2 }}>{numberWithCommas(row.Captacao_m3_mes, 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem', p:2 }}>{numberWithCommas(row.Vol_Final, 2)}</TableCell>
                            <TableCell align="center" sx={{
                              color: row.CHECK === "OK" ? 'green' : 'red',
                              fontWeight: 'bold',
                              fontSize: '0.75rem'
                            }}>
                              {row.CHECK}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </div>

            {/* Tab Panel: Bruta */}
            <div role="tabpanel" hidden={tabIndex !== 2}>
              {tabIndex === 2 && result && result.resultadoCalculo && (
                <Box sx={{ p: 1 }}>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 190, overflowY: 'auto' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.75rem' }}>Mês</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Entr. Méd</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Evap.</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Infilt.</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>QCap</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>V. Final</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem' }}>V. Prob</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.75rem' }}>Chk</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.resultadoCalculo.bruta.meses.map((mes, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{mes}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{numberWithCommas(result.resultadoCalculo.bruta.entrada_media[idx], 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{numberWithCommas(result.resultadoCalculo.bruta.evaporacao_m3[idx], 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{numberWithCommas(result.resultadoCalculo.bruta.infiltracao[idx], 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{numberWithCommas(result.resultadoCalculo.bruta.qcap_total[idx], 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{numberWithCommas(result.resultadoCalculo.bruta.volume_final[idx], 2)}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{numberWithCommas(result.resultadoCalculo.bruta.volume_prob[idx], 2)}</TableCell>
                            <TableCell align="center" sx={{
                              color: result.resultadoCalculo.bruta.CHECK[idx] === "OK" ? 'green' : 'red',
                              fontWeight: 'bold',
                              fontSize: '0.75rem'
                            }}>
                              {result.resultadoCalculo.bruta.CHECK[idx]}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}