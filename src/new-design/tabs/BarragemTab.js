import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, Chip, Avatar, Divider, Typography, Alert, Stack,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Input, IconButton, Tooltip, FormControlLabel, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import WaterIcon from '@mui/icons-material/Water';
import GetAppIcon from '@mui/icons-material/GetApp';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import LayersIcon from '@mui/icons-material/Layers';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import CoordSearchBar from '../components/CoordSearchBar';
import CompactTable from '../components/CompactTable';
import SectionLabel from '../components/SectionLabel';
import { calculateReservoirBalance } from '../../services/barrage';
import { numberWithCommas } from '../../tools';
import { exportBarrageToCsv } from '../../tools/export-barrage-to-csv';
import { MESES, TI_CATS } from '../constants';
import { extractBarragemRows } from '../utils/extract-barragem-rows';
import '../chartSetup';

const BAR_CAT = TI_CATS.find(c => c.key === 'barragem');

const BAR_HEADERS = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço'];

const CELL = { fontSize: '0.78rem', py: 0, px: 0.5 };
const HEAD = { ...CELL, fontWeight: 700, bgcolor: '#f5f7fa', whiteSpace: 'nowrap' };


const StatusChip = ({ check }) => String(check).toLowerCase() === 'ok'
  ? <Chip icon={<CheckCircleOutlineIcon sx={{ fontSize: 12, color: '#2e7d32 !important' }} />} label="OK"       size="small" sx={{ height: 17, fontSize: '0.78rem', bgcolor: '#e8f5e9', color: '#2e7d32', '& .MuiChip-icon': { ml: 0.5 } }} />
  : <Chip icon={<ErrorOutlineIcon     sx={{ fontSize: 12, color: '#b71c1c !important' }} />} label="Problema" size="small" sx={{ height: 17, fontSize: '0.78rem', bgcolor: '#ffebee', color: '#b71c1c', '& .MuiChip-icon': { ml: 0.5 } }} />;

export default function BarragemTab({
  lat, lng, onLatChange, onLngChange, onApplyCoordinates, onMarkerSelect,
  onBarMarkers, onBarShape, onClearCircle,
}) {
  const [calcTab, setCalcTab] = useState(0);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [result, setResult] = useState(null);
  const [highlightRows, setHighlightRows] = useState(false);

  const [damData, setDamData] = useState({
    Max_Volume: 374411.5,
    Min_Volume: 0.0,
    Tot_Area: 10.02,
    M_Infiltration: 0.00000022219,
    Q_Reg: 0.0341987545584542,
    Min_Vol_Observed: 0,
    Q_Cap: Array(12).fill(5.5),
  });

  const [operacao, setOperacao] = useState({
    anos: 1,
    Meses: MESES,
    Dias: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    Evaporacao: [130.06, 141.88, 136.4, 126.0, 108.5, 99.0, 105.4, 133.3, 147.0, 155.0, 135.0, 127.1],
    tempDia: [21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21],
    qmm: Array(12).fill(0),
    vazao_l_s: Array(12).fill(5.5),
    fillQmm: false,
  });

  useEffect(() => {
    setDamData(prev => ({ ...prev, Q_Cap: operacao.vazao_l_s }));
  }, [operacao.vazao_l_s]);


  const handleDamChange = (e) => {
    const { name, value } = e.target;
    setDamData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleArrayChange = (arrayName, index, value) => {
    const arr = [...operacao[arrayName]];
    const parsed = parseFloat(value);
    arr[index] = isNaN(parsed) ? 0 : parsed;
    setOperacao(prev => ({ ...prev, [arrayName]: arr }));
  };

  const handleCalculate = async () => {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) {
      setCalcError('Coordenadas inválidas. Informe lat/lng antes de calcular.');
      return;
    }
    setCalcLoading(true);
    setCalcError(null);
    onBarMarkers?.([]);
    onBarShape?.(null);
    try {
      const data = await calculateReservoirBalance({
        coordenadas: { latitude: latN, longitude: lngN },
        dam_data: damData,
        operacao,
      });
      console.log('[BarragemTab] resultado do serviço:', data);
      setResult(data);
      const rows = extractBarragemRows(data) ?? [];
      onBarMarkers?.(rows);

      const geoFeatures = data?.dbResult?.informacoes_adicionais?.otto_geometrias;
      if (Array.isArray(geoFeatures) && geoFeatures.length > 0) {
        onBarShape?.({
          type: 'FeatureCollection',
          features: geoFeatures.map(f => ({
            type: 'Feature',
            properties: { cobacia: f.cobacia },
            geometry: { type: f.geometry?.type ?? 'Polygon', coordinates: f.geometry?.coordinates },
          })),
        });
      }
      if (data?.dbResult?.operacao?.QmmRegionalizada) {
        setOperacao(prev => ({ ...prev, qmm: data.dbResult.operacao.QmmRegionalizada }));
      }
      setHighlightRows(true);
      setTimeout(() => setHighlightRows(false), 4000);
    } catch {
      setCalcError('Erro ao calcular o balanço hídrico. Verifique os dados e tente novamente.');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleExport = () => {
    exportBarrageToCsv({
      marker: { int_latitude: lat, int_longitude: lng },
      damData,
      operacao,
      result,
    });
  };

  const handleSearch = async () => {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) {
      setCalcError('Coordenadas inválidas. Informe lat/lng antes de buscar.');
      return;
    }
    onClearCircle?.();
    onApplyCoordinates?.({ lat: latN, lng: lngN });
    await handleCalculate();
  };

  const barRows = extractBarragemRows(result);

  const pulseStyle = highlightRows ? {
    animation: 'barPulse 1s ease-in-out infinite',
    '@keyframes barPulse': {
      '0%':   { backgroundColor: 'rgba(33,150,243,0.06)' },
      '50%':  { backgroundColor: 'rgba(33,150,243,0.20)' },
      '100%': { backgroundColor: 'rgba(33,150,243,0.06)' },
    },
  } : {};

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Barra de coordenadas ───────────────────────────────────────────── */}
      <CoordSearchBar
        id="nd-bar-coord-search"
        lat={lat} lng={lng}
        onLatChange={onLatChange} onLngChange={onLngChange}
        onApplyCoordinates={onApplyCoordinates}
        onSearch={handleSearch} loading={calcLoading} error={calcError}
        title="Busca por Coordenadas"
      />

      {/* ── Chips área / UH — direita, visíveis após cálculo ──────────────── */}
      {result && (
        <Stack direction="row" spacing={1} sx={{ px: 2, py: 0.8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Chip
            avatar={<Avatar sx={{ bgcolor: 'transparent', width: 20, height: 20 }}><WallpaperIcon sx={{ fontSize: 14 }} /></Avatar>}
            label={`Área: ${result?.dbResult?.informacoes_adicionais?.area_contribuicao?.toFixed(4) ?? '—'} km²`}
            size="small" sx={{ fontSize: '0.65rem', height: 20 }}
          />
          <Chip
            avatar={<Avatar sx={{ bgcolor: 'transparent', width: 20, height: 20 }}><LayersIcon sx={{ fontSize: 14 }} /></Avatar>}
            label={`UH: ${result?.dbResult?.informacoes_adicionais?.uh_nome ?? '—'} — ${result?.dbResult?.informacoes_adicionais?.uh_rotulo ?? ''}`}
            size="small" sx={{ fontSize: '0.65rem', height: 20 }}
          />
        </Stack>
      )}

      {/* ── Parâmetros da barragem ─────────────────────────────────────────── */}
      <Box id="nd-bar-dam-params" sx={{ px: 1.5, pt: 0.8, pb: 1, flexShrink: 0, bgcolor: '#f8f9fa', borderBottom: '1px solid #e8eaed' }}>
        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#90a4ae', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', mb: 0.6 }}>
          Parâmetros da barragem
        </Typography>
        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap justifyContent="center">
          {[
            { label: 'V. Máx (m³)',   name: 'Max_Volume',     value: damData.Max_Volume },
            { label: 'V. Mín (m³)',   name: 'Min_Volume',     value: damData.Min_Volume },
            { label: 'Área (m²)',     name: 'Tot_Area',        value: damData.Tot_Area },
            { label: 'Infilt. (m/d)', name: 'M_Infiltration', value: damData.M_Infiltration },
          ].map(({ label, name, value }) => (
            <TextField
              key={name} label={label} name={name} type="number" value={value}
              onChange={handleDamChange} size="small" variant="outlined"
              sx={{
                width: 120,
                '& input': { fontSize: '0.78rem' },
                '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
              }}
            />
          ))}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Anos</InputLabel>
            <Select
              value={operacao.anos} label="Anos"
              onChange={(e) => setOperacao(prev => ({ ...prev, anos: e.target.value }))}
              sx={{ bgcolor: '#fff', fontSize: '0.78rem' }}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1} sx={{ fontSize: '0.68rem' }}>{i + 1} ano{i > 0 ? 's' : ''}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* ── Toolbar: sub-abas de resultado + ações ────────────────────────── */}
      <Box id="nd-bar-toolbar" sx={{ display: 'flex', alignItems: 'center', px: 1, borderBottom: '1px solid #e0e0e0', flexShrink: 0, bgcolor: '#fff' }}>
        <Tabs
          value={calcTab} onChange={(_, v) => setCalcTab(v)}
          sx={{
            flex: 1, minHeight: 34,
            '& .MuiTab-root': { minHeight: 34, fontSize: '0.78rem', textTransform: 'none', py: 0, px: 1.5 },
            '& .MuiTabs-indicator': { height: 2 },
          }}
        >
          <Tab label="Operação" />
          <Tab label="Planilha" disabled={!result} />
          <Tab label="Bruta"    disabled={!result} />
        </Tabs>
        <Stack direction="row" alignItems="center" spacing={0.3} sx={{ flexShrink: 0 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={operacao.fillQmm}
                onChange={(e) => setOperacao(prev => ({ ...prev, fillQmm: e.target.checked }))}
                size="small" sx={{ p: 0.3 }}
              />
            }
            label="Preencher Qmm"
            sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: '0.62rem' } }}
          />
          <Tooltip title="Exportar dados (CSV)">
            <span>
              <IconButton size="small" onClick={handleExport} disabled={!result}>
                <GetAppIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {calcError && (
        <Box sx={{ px: 1.5, pt: 0.5, flexShrink: 0 }}>
          <Alert severity="error" sx={{ fontSize: '0.7rem', py: 0.3 }}>{calcError}</Alert>
        </Box>
      )}

      {/* ── Área de conteúdo: tabelas de cálculo + barragens próximas ──────── */}
      <Box id="nd-bar-content" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Seção superior: tabelas de cálculo (altura fixa + scroll) ── */}
        <Box sx={{
          flexShrink: 0, minHeight: 280, maxHeight: 280,
          overflowY: 'auto', overflowX: 'auto',
          '&::-webkit-scrollbar': { width: 4, height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#cfd8dc', borderRadius: 2 },
        }}>

          {/* ── Tab Operação ── */}
          {calcTab === 0 && (
            <TableContainer sx={{ minWidth: 0 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ height: 36 }}>
                    <TableCell sx={{ ...HEAD, minWidth: 118, position: 'sticky', left: 0, zIndex: 3, pl: 1.5 }}>Parâmetro</TableCell>
                    {MESES.map(m => <TableCell key={m} align="center" sx={{ ...HEAD, minWidth: 64 }}>{m}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { label: 'Vazão (L/s)', key: 'vazao_l_s', width: 80 },
                    { label: 'T. Cap (h)',  key: 'tempDia',   width: 60 },
                  ].map(({ label, key, width }) => (
                    <TableRow key={key} hover>
                      <TableCell sx={{ ...CELL, position: 'sticky', left: 0, bgcolor: '#fafafa', zIndex: 1, fontWeight: 500, pl: 1.5 }}>{label}</TableCell>
                      {operacao[key].map((v, i) => (
                        <TableCell key={i} padding="none">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Input
                              value={v}
                              onChange={(e) => handleArrayChange(key, i, e.target.value)}
                              disableUnderline
                              sx={{ width }}
                              inputProps={{ style: { textAlign: 'center', fontSize: '0.78rem', padding: '2px 0' }, type: 'number' }}
                            />
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  <TableRow hover>
                    <TableCell sx={{ ...CELL, position: 'sticky', left: 0, bgcolor: '#fafafa', zIndex: 1, fontWeight: 500, pl: 1.5 }}>Dias</TableCell>
                    {operacao.Dias.map((d, i) => (
                      <TableCell key={i} padding="none">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Select
                            value={d}
                            onChange={(e) => handleArrayChange('Dias', i, e.target.value)}
                            variant="standard" disableUnderline
                            sx={{ fontSize: '0.78rem', width: 60, '& .MuiSelect-select': { py: 0.3, px: 0.5, textAlign: 'center' } }}
                          >
                            {Array.from({ length: 32 }, (_, j) => (
                              <MenuItem key={j} value={j} sx={{ fontSize: '0.78rem', py: 0.2 }}>{j}</MenuItem>
                            ))}
                          </Select>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow hover>
                    <TableCell sx={{ ...CELL, position: 'sticky', left: 0, bgcolor: '#fafafa', zIndex: 1, fontWeight: 500, pl: 1.5 }}>Evap. (mm)</TableCell>
                    {operacao.Evaporacao.map((v, i) => (
                      <TableCell key={i} padding="none">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Input
                            value={v}
                            onChange={(e) => handleArrayChange('Evaporacao', i, e.target.value)}
                            disableUnderline
                            sx={{ width: 60 }}
                            inputProps={{ style: { textAlign: 'center', fontSize: '0.78rem', padding: '2px 0' }, type: 'number' }}
                          />
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow hover sx={pulseStyle}>
                    <TableCell sx={{ ...CELL, position: 'sticky', left: 0, bgcolor: '#fafafa', zIndex: 1, fontWeight: 500, pl: 1.5 }}>Qmm (Reg.) (m³/s)</TableCell>
                    {operacao.qmm.map((v, i) => (
                      <TableCell key={i} padding="none">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Input
                            value={v}
                            onChange={(e) => handleArrayChange('qmm', i, e.target.value)}
                            disableUnderline
                            sx={{ width: 60 }}
                            inputProps={{ style: { textAlign: 'center', fontSize: '0.78rem', padding: '2px 0' }, type: 'number' }}
                          />
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow hover sx={{ ...pulseStyle, height: 36 }}>
                    <TableCell sx={{ ...CELL, position: 'sticky', left: 0, bgcolor: '#fafafa', zIndex: 1, fontWeight: 500, pl: 1.5 }}>Q Defluente (m³/s)</TableCell>
                    {MESES.map((_, i) => {
                      const v = result?.dbResult?.operacao?.Q_defluente?.[i];
                      return (
                        <TableCell key={i} align="center" sx={{ ...CELL, color: v !== undefined ? '#1565c0' : '#bdbdbd' }}>
                          {calcLoading
                            ? <Skeleton variant="text" width={32} sx={{ display: 'inline-block' }} />
                            : v !== undefined ? numberWithCommas(v, 4) : '—'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ── Tab Planilha ── */}
          {calcTab === 1 && (
            result?.resultadoCalculo ? (
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ height: 36 }}>
                      {['Mês', 'Qmm', 'Entrada', 'Infilt.', 'Evap.', 'Capt.', 'V. Final', 'Status'].map((h, i) => (
                        <TableCell key={h} align={i === 0 ? 'left' : i === 7 ? 'center' : 'right'} sx={i === 0 ? { ...HEAD, pl: 1.5 } : HEAD}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.resultadoCalculo.planilha.map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ ...CELL, pl: 1.5 }}>{row.Mes}</TableCell>
                        <TableCell align="right" sx={CELL}>{numberWithCommas(row.Qmmm_m3s, 4)}</TableCell>
                        <TableCell align="right" sx={CELL}>{numberWithCommas(row.Entrada_m3_mes, 2)}</TableCell>
                        <TableCell align="right" sx={CELL}>{numberWithCommas(row.Infiltracao_m3_mes, 2)}</TableCell>
                        <TableCell align="right" sx={CELL}>{numberWithCommas(row.Evaporacao_m3_mes, 2)}</TableCell>
                        <TableCell align="right" sx={CELL}>{numberWithCommas(row.Captacao_m3_mes, 2)}</TableCell>
                        <TableCell align="right" sx={{ ...CELL, fontWeight: 600 }}>{numberWithCommas(row.Vol_Final, 2)}</TableCell>
                        <TableCell align="center" sx={CELL}><StatusChip check={row.CHECK} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <CalculateIcon sx={{ fontSize: 32, color: '#e0e0e0' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.76rem' }}>
                  Realize a busca para ver a planilha de balanço hídrico.
                </Typography>
              </Box>
            )
          )}

          {/* ── Tab Bruta ── */}
          {calcTab === 2 && (
            result?.resultadoCalculo ? (
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ height: 36 }}>
                      {['Mês', 'Entr. Méd', 'Evap.', 'Infilt.', 'QCap', 'V. Final', 'V. Prob', 'Chk'].map((h, i) => (
                        <TableCell key={h} align={i === 0 ? 'left' : i === 7 ? 'center' : 'right'} sx={i === 0 ? { ...HEAD, pl: 1.5 } : HEAD}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.resultadoCalculo.bruta.meses.map((mes, idx) => {
                      const b = result.resultadoCalculo.bruta;
                      return (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ ...CELL, pl: 1.5 }}>{mes}</TableCell>
                          <TableCell align="right" sx={CELL}>{numberWithCommas(b.entrada_media[idx], 2)}</TableCell>
                          <TableCell align="right" sx={CELL}>{numberWithCommas(b.evaporacao_m3[idx], 2)}</TableCell>
                          <TableCell align="right" sx={CELL}>{numberWithCommas(b.infiltracao[idx], 2)}</TableCell>
                          <TableCell align="right" sx={CELL}>{numberWithCommas(b.qcap_total[idx], 2)}</TableCell>
                          <TableCell align="right" sx={{ ...CELL, fontWeight: 600 }}>{numberWithCommas(b.volume_final[idx], 2)}</TableCell>
                          <TableCell align="right" sx={CELL}>{numberWithCommas(b.volume_prob[idx], 2)}</TableCell>
                          <TableCell align="center" sx={CELL}><StatusChip check={b.CHECK[idx]} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <CalculateIcon sx={{ fontSize: 32, color: '#e0e0e0' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.76rem' }}>
                  Realize a busca para ver os dados brutos.
                </Typography>
              </Box>
            )
          )}
        </Box>

        {/* ── Seção inferior: barragens próximas (preenche espaço restante) ── */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderTop: '1px solid #e0e0e0' }}>
          <SectionLabel
            title="Barragens próximas"
            count={barRows !== null ? barRows.length : undefined}
          />
          <Divider />

          <Box sx={{
            flex: 1, overflowY: 'auto', overflowX: 'auto',
            pl: 3, pr: 1.5, pt: 0.5,
            '&::-webkit-scrollbar': { width: 4, height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cfd8dc', borderRadius: 2 },
          }}>
            {barRows === null ? (
              <Box sx={{ opacity: 0.4, pointerEvents: 'none' }}>
                <CompactTable
                  headers={BAR_HEADERS}
                  rows={Array.from({ length: 15 }, () => BAR_HEADERS.map((_, j) => (
                    <Box sx={{ height: 9, borderRadius: 1, bgcolor: '#cfd8dc', width: j === 0 ? 80 : j === 1 ? 60 : j === 2 ? 70 : 90 }} />
                  )))}
                  cellSx={{ pl: 3, fontSize: '0.78rem' }} rowSx={{ height: 40 }}
                />
              </Box>
            ) : calcLoading ? (
              <Box sx={{ px: 1.5, py: 1 }}>
                {[1, 2, 3].map(i => <Skeleton key={i} variant="text" height={28} sx={{ mb: 0.5 }} />)}
              </Box>
            ) : barRows.length === 0 ? (
              <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <WaterIcon sx={{ fontSize: 30, color: '#e0e0e0' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.76rem' }}>
                  Nenhuma barragem encontrada para estas coordenadas.
                </Typography>
              </Box>
            ) : (
              <CompactTable
                headers={BAR_HEADERS}
                cellSx={{ pl: 3, fontSize: '0.78rem' }} rowSx={{ height: 40 }}
                rows={barRows.map(m => [
                  m.us_nome ?? '—',
                  m.us_cpf_cnpj ?? '—',
                  m.int_processo ?? '—',
                  m.emp_endereco ?? '—',
                ])}
                onRowClick={i => onMarkerSelect?.({
                  ...barRows[i],
                  _catColor: BAR_CAT.color,
                  _catLabel: BAR_CAT.label,
                })}
              />
            )}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
