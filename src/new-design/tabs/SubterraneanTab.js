import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Box, Typography, Stack, Divider, LinearProgress, Alert,
  TextField, Button, ToggleButton, ToggleButtonGroup,
  Table, TableHead, TableBody, TableRow, TableCell, Paper, Chip, Avatar,
  IconButton, Tooltip, CircularProgress, useTheme, useMediaQuery,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TransformIcon from '@mui/icons-material/Transform';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import WaterDropIcon    from '@mui/icons-material/WaterDrop';
import MyLocationIcon   from '@mui/icons-material/MyLocation';
import WallpaperIcon    from '@mui/icons-material/Wallpaper';
import LayersIcon       from '@mui/icons-material/Layers';
import CloseIcon        from '@mui/icons-material/Close';
import { Bar }          from 'react-chartjs-2';

import CompactTable      from '../components/CompactTable';
import UserSearchDialog  from '../components/UserSearchDialog';
import CoordConverter    from '../components/CoordConverter';
import { findPointsInASystem } from '../../services/geolocation';
import { analyzeAvailability, numberWithCommas } from '../../tools';
import { MESES, abbr } from '../constants';
import { PT_SUFFIXES, makeBarValuesPlugin } from '../chartSetup';

const barValuesPlugin = makeBarValuesPlugin('m³/ano');

const WELL_TYPES = [
  { value: '1', label: 'Manual / Tubular Raso' },
  { value: '3', label: 'Tubular Profundo'       },
];

const TABLE_HEADERS = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço', ...MESES];

const AVAIL_COLS = [
  'Sistema', 'Código', 'Q Explotável (m³/ano)',
  'Nº Poços', 'Q Outorgada (m³/ano)', '% Utilizada', 'Vol. Disponível (m³/ano)',
];


// Configuração do chart de disponibilidade
const CHART_ITEMS = [
  { key: 'q_ex',         label: 'Q Explotável',  color: '#0277bd' },
  { key: 'q_points',     label: 'Q Outorgada',   color: '#f57f17' },
  { key: 'vol_avaiable', label: 'Q Disponível',  color: '#2e7d32' },
  { key: '_qUsuario',    label: 'Q Usuário',      color: '#6a1b9a' },
];

function AvailChart({ avail, qUsuario, logScale }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const values = [
    avail.q_ex,
    avail.q_points,
    Number(avail.vol_avaiable),
    qUsuario,
  ];

  return (
    <Bar
      plugins={[barValuesPlugin]}
      data={{
        labels: CHART_ITEMS.map(c => abbr(c.label, isMobile)),
        datasets: [{
          data: values,
          backgroundColor: CHART_ITEMS.map(c => `${c.color}33`),
          borderColor:     CHART_ITEMS.map(c => c.color),
          borderWidth: 1.5,
          borderRadius: 4,
          borderSkipped: false,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${numberWithCommas(ctx.raw)} m³/ano`,
            },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 10 }, color: '#455a64' },
            grid: { display: false },
          },
          y: {
            type: logScale ? 'logarithmic' : 'linear',
            beginAtZero: !logScale,
            min: logScale ? 0.1 : 0,
            ticks: {
              font: { size: 9 }, color: '#78909c',
              callback: v => {
                const abs = Math.abs(v);
                const { value, symbol } = PT_SUFFIXES.find(s => abs >= s.value) ?? PT_SUFFIXES.at(-1);
                const n = (v / value).toFixed(1).replace('.', ',').replace(/,0$/, '');
                return symbol ? `${n} ${symbol}` : n;
              },
            },
            grid: { color: '#f0f0f0' },
          },
        },
      }}
    />
  );
}

export default function SubterraneanTab({
  lat, lng, onLatChange, onLngChange, onApplyCoordinates,
  onMarkerSelect, onSubShape, onSubMarkers, onClearCircle,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [wellTypeId, setWellTypeId]     = useState('1');
  const [subPoints, setSubPoints]       = useState(null);
  const [rawAvail, setRawAvail]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // Q Usuário: vem da seleção de interferência no diálogo
  const [qUsuario, setQUsuario]         = useState(0);
  const [selUser, setSelUser]           = useState(null);
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [openConverter, setOpenConverter] = useState(false);
  const [logScale, setLogScale]         = useState(true);

  // Disponibilidade com usuário somado (reativo a qUsuario e rawAvail)
  const avail = useMemo(() => {
    if (!rawAvail) return null;
    const q = isNaN(qUsuario) ? 0 : Number(qUsuario);
    if (q === 0) return rawAvail;
    const q_points = rawAvail.q_points + q;
    const q_ex     = rawAvail.q_ex;
    return {
      ...rawAvail,
      n_points:     rawAvail.n_points + 1,
      q_points,
      q_points_per: q_ex > 0 ? ((q_points * 100) / q_ex).toFixed(4) : '0.0000',
      vol_avaiable: (q_ex - q_points).toFixed(4),
    };
  }, [rawAvail, qUsuario]);

  // Sync subPoints → map markers whenever the list changes
  useEffect(() => {
    if (subPoints !== null) onSubMarkers?.(subPoints);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPoints]);

  const handleSearch = useCallback(async () => {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) {
      setError('Coordenadas inválidas. Ex: -15.7801');
      return;
    }

    onApplyCoordinates?.({ lat: latN, lng: lngN });

    setLoading(true);
    setError(null);
    setQUsuario(0);      // zera Q Usuário a cada nova busca por coordenada
    setSelUser(null);
    onClearCircle?.();
    onSubShape?.(null);
    onSubMarkers?.([]);

    try {
      const response = await findPointsInASystem(Number(wellTypeId), latN, lngN);
      const info   = response?._hg_info  ?? null;
      const points = response?._points   ?? [];
      const shape  = response?._hg_shape ?? null;

      setSubPoints(points);
      onSubShape?.(shape);
      onSubMarkers?.(points);

      if (!info) {
        setError('Nenhum sistema encontrado para estas coordenadas.');
        setRawAvail(null);
        return;
      }
      setRawAvail(analyzeAvailability(info, points));
    } catch (err) {
      console.error('[subterrânea]', err);
      setError('Erro ao buscar dados subterrâneos. Verifique conexão ou autenticação.');
      setSubPoints(null);
      setRawAvail(null);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, wellTypeId, onSubShape, onSubMarkers, onClearCircle, onApplyCoordinates]);

  const handleUserSelect = useCallback(async ({ qUsuario: q, user, interference }) => {
    setQUsuario(isNaN(q) ? 0 : q);
    setSelUser(user);
    setDialogOpen(false);
    if (!interference) return;

    const syntheticPoint = {
      us_nome:       user.us_nome,
      us_cpf_cnpj:   user.us_cpf_cnpj,
      int_processo:  user.proc_sei ?? user.doc_sei ?? null,
      emp_endereco:  interference.end_logradouro,
      int_latitude:  interference.int_latitude,
      int_longitude: interference.int_longitude,
      dt_demanda:    { demandas: Array.isArray(interference.dt_demanda) ? interference.dt_demanda : [] },
      _isUserAdded:  true,
    };

    const latN = parseFloat(interference.int_latitude);
    const lngN = parseFloat(interference.int_longitude);

    const subTpId = Number(interference.sub_tp_id);
    const resolvedWellTypeId = (!isNaN(subTpId) && subTpId > 0)
      ? (subTpId === 1 || subTpId === 2 ? '1' : '3')
      : wellTypeId;
    setWellTypeId(resolvedWellTypeId);

    if (!isNaN(latN) && !isNaN(lngN)) {
      setLoading(true);
      setError(null);
      onClearCircle?.();
      onSubShape?.(null);
      onSubMarkers?.([]);
      onApplyCoordinates?.({ lat: latN, lng: lngN, info: syntheticPoint });

      try {
        const response = await findPointsInASystem(Number(resolvedWellTypeId), latN, lngN);
        const info   = response?._hg_info  ?? null;
        const points = response?._points   ?? [];
        const shape  = response?._hg_shape ?? null;

        const allPoints = [syntheticPoint, ...points.filter(p => !p._isUserAdded)];
        setSubPoints(allPoints);
        onSubShape?.(shape);
        onSubMarkers?.(allPoints);

        if (info) setRawAvail(analyzeAvailability(info, points));
        else setRawAvail(null);
      } catch (err) {
        console.error('[subterrânea] handleUserSelect', err);
        setError('Erro ao buscar sistema para a interferência selecionada.');
        setSubPoints([syntheticPoint]);
        onSubMarkers?.([syntheticPoint]);
      } finally {
        setLoading(false);
      }
    } else {
      setSubPoints(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return [...current.filter(p => !p._isUserAdded), syntheticPoint];
      });
    }
  }, [wellTypeId, onSubShape, onSubMarkers, onClearCircle, onApplyCoordinates]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Busca por coordenada ─────────────────────────────────────────────── */}
      <Box id="nd-sub-coord-search" sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 1 }}>
          {abbr('Busca por Coordenadas', isMobile)}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={1.2}>
          <TextField
            size="small" label="Latitude" value={lat}
            onChange={e => onLatChange(e.target.value)}
            sx={{ flex: 1, '& input': { fontSize: '0.78rem' } }}
          />
          <TextField
            size="small" label="Longitude" value={lng}
            onChange={e => onLngChange(e.target.value)}
            sx={{ flex: 1, '& input': { fontSize: '0.78rem' } }}
          />
          <Tooltip title="Copiar coordenadas">
            <IconButton
              size="small" onClick={() => navigator.clipboard.writeText(`${lat}, ${lng}`)}
              sx={{ flexShrink: 0, color: '#1565c0', border: '1px solid #90caf9', borderRadius: 1, p: 0.7 }}
            >
              <ContentCopyIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Converter coordenadas (UTM ou GMS → Decimal)">
            <IconButton
              size="small" onClick={() => setOpenConverter(true)}
              sx={{ flexShrink: 0, color: '#1565c0', border: '1px solid #90caf9', borderRadius: 1, p: 0.7 }}
            >
              <TransformIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={loading ? 'Buscando…' : 'Buscar'}>
            <span>
              <IconButton
                size="small" onClick={handleSearch} disabled={loading}
                sx={{ flexShrink: 0, bgcolor: '#003566', color: '#fff', borderRadius: 1, p: 0.7, '&:hover': { bgcolor: '#004080' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}
              >
                {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SearchIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <CoordConverter
          open={openConverter}
          onClose={() => setOpenConverter(false)}
          onConvert={({ lat: latN, lng: lngN }) => {
            onApplyCoordinates?.({ lat: latN, lng: lngN });
            setOpenConverter(false);
          }}
        />

        <ToggleButtonGroup
          id="nd-sub-well-type"
          value={wellTypeId} exclusive size="small"
          onChange={(_, v) => v && setWellTypeId(v)}
          sx={{
            width: '100%',
            '& .MuiToggleButton-root': {
              flex: 1, fontSize: '0.72rem', textTransform: 'none', py: 0.5,
              borderColor: '#90caf9', color: '#1565c0',
              '&.Mui-selected': { bgcolor: '#1565c020', color: '#0d47a1', fontWeight: 700 },
            },
          }}
        >
          {WELL_TYPES.map(t => (
            <ToggleButton key={t.value} value={t.value}>{abbr(t.label, isMobile)}</ToggleButton>
          ))}
        </ToggleButtonGroup>

        {loading && <LinearProgress sx={{ mt: 1 }} />}
        {error && <Alert severity="error" sx={{ fontSize: '0.73rem', py: 0.3, mt: 1 }}>{error}</Alert>}
      </Box>

      <Box id="nd-sub-results" sx={{ flex: 1, overflow: 'auto', minHeight: 0, '&::-webkit-scrollbar': { width: 5, height: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 } }}>

      <Box id="nd-sub-chart-area">
      {/* ── Chips: Bacia + UH ────────────────────────────────────────────────── */}
      {avail && (
        <Stack direction="row" spacing={1} sx={{ px: 2, py: 0.8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {avail.bacia_nome && (
            <Chip
              avatar={<Avatar sx={{ bgcolor: 'transparent', width: 20, height: 20 }}><WallpaperIcon sx={{ fontSize: 14 }} /></Avatar>}
              label={avail.bacia_nome}
              size="small" sx={{ fontSize: '0.65rem', height: 20 }}
            />
          )}
          {avail.uh_nome && (
            <Chip
              avatar={<Avatar sx={{ bgcolor: 'transparent', width: 20, height: 20 }}><LayersIcon sx={{ fontSize: 14 }} /></Avatar>}
              label={`${avail.uh_label ?? ''} — ${avail.uh_nome}`}
              size="small" sx={{ fontSize: '0.65rem', height: 20 }}
            />
          )}
        </Stack>
      )}

      {/* ── Análise de disponibilidade ───────────────────────────────────────── */}
      <Box id="nd-sub-avail-section" sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e8eaf0' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 1 }}>
          {abbr('Análise de disponibilidade', isMobile)}
        </Typography>

        {/* Título + botão Adicionar Usuário — sempre visível */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.8}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#546e7a', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Vazões (m³/ano)
          </Typography>
          <Stack direction="row" spacing={0.6} alignItems="center">
            {selUser && (
              <Chip
                size="small"
                label={selUser.us_nome}
                onDelete={() => {
                  setQUsuario(0);
                  setSelUser(null);
                  setSubPoints(prev => Array.isArray(prev) ? prev.filter(p => !p._isUserAdded) : prev);
                }}
                deleteIcon={<CloseIcon sx={{ fontSize: '0.75rem !important' }} />}
                sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#ede7f6', color: '#4a148c', maxWidth: 140 }}
              />
            )}
            <Button
              size="small" variant="outlined"
              startIcon={<PersonSearchIcon sx={{ fontSize: '0.9rem !important' }} />}
              onClick={(e) => { e.currentTarget.blur(); setDialogOpen(true); }}
              sx={{ textTransform: 'none', fontSize: '0.65rem', py: 0.3, px: 1, borderColor: '#6a1b9a', color: '#6a1b9a', '&:hover': { bgcolor: '#f3e5f5' } }}
            >
              Adicionar usuário
            </Button>
          </Stack>
        </Stack>

        {!avail && !loading && (
          <Box>
            {/* tabela sample com linhas vazias */}
            <Paper variant="outlined" sx={{ overflow: 'auto', mb: 1.5, opacity: 0.45 }}>
              <Table size="small" sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0f4ff' }}>
                    {AVAIL_COLS.map(h => (
                      <TableCell key={h} align="center" sx={{ fontSize: '0.63rem', fontWeight: 700, py: 0.8, px: 1, whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {AVAIL_COLS.map((_, i) => (
                      <TableCell key={i} align="center" sx={{ py: 0.8, px: 1 }}>
                        <Box sx={{ height: 10, borderRadius: 1, bgcolor: '#cfd8dc', mx: 'auto', width: i === 0 ? 60 : i === 1 ? 40 : 50 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            <Stack direction="row" alignItems="center" spacing={0.8} mb={1} sx={{ color: 'text.disabled' }}>
              <MyLocationIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                Busque por coordenadas para calcular a disponibilidade do subsistema.
              </Typography>
            </Stack>
            {/* placeholder chart com valores sample — exibido normalmente */}
            <Box id="nd-sub-avail-chart-placeholder" sx={{ height: 140 }}>
              <Bar
                plugins={[barValuesPlugin]}
                data={{
                  labels: CHART_ITEMS.map(c => abbr(c.label, isMobile)),
                  datasets: [{
                    data: [95000, 12400, 82600, 3800],
                    backgroundColor: CHART_ITEMS.map(c => `${c.color}55`),
                    borderColor:     CHART_ITEMS.map(c => c.color),
                    borderWidth: 1.5,
                    borderRadius: 4,
                    borderSkipped: false,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: false,
                  plugins: { legend: { display: false }, tooltip: { enabled: false } },
                  scales: {
                    x: { ticks: { font: { size: 10 }, color: '#90a4ae' }, grid: { display: false } },
                    y: {
                      type: 'logarithmic', min: 0.1,
                      ticks: {
                        font: { size: 9 }, color: '#90a4ae',
                        callback: v => {
                          const abs = Math.abs(v);
                          const { value, symbol } = PT_SUFFIXES.find(s => abs >= s.value) ?? PT_SUFFIXES.at(-1);
                          const n = (v / value).toFixed(1).replace('.', ',').replace(/,0$/, '');
                          return symbol ? `${n} ${symbol}` : n;
                        },
                      },
                      grid: { color: '#f0f0f0' },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {avail && (
          <>
            {/* Tabela de disponibilidade */}
            <Paper variant="outlined" sx={{ overflow: 'auto', mb: 1.5 }}>
              <Table size="small" sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0f4ff' }}>
                    {AVAIL_COLS.map(h => (
                      <TableCell key={h} align="center" sx={{ fontSize: '0.63rem', fontWeight: 700, py: 0.8, px: 1, whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{avail.sistema  ?? '—'}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{avail.cod_plan ?? '—'}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{numberWithCommas(avail.q_ex, 2)}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{avail.n_points}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{numberWithCommas(avail.q_points, 2)}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{numberWithCommas(avail.q_points_per, 2)} %</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{numberWithCommas(avail.vol_avaiable, 2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            <Box id="nd-sub-avail-chart" sx={{ position: 'relative', height: 140 }}>
              <AvailChart avail={avail} qUsuario={qUsuario} logScale={logScale} />
              <ToggleButtonGroup
                value={logScale ? 'log' : 'lin'} exclusive size="small"
                onChange={(_, v) => v && setLogScale(v === 'log')}
                sx={{
                  position: 'absolute', bottom: 4, right: 4, zIndex: 10,
                  bgcolor: 'rgba(255,255,255,0.88)', borderRadius: 1,
                  '& .MuiToggleButton-root': {
                    fontSize: '0.58rem', textTransform: 'none', py: 0.15, px: 0.7, lineHeight: 1.4,
                    borderColor: '#b0bec5', color: '#607d8b',
                    '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#0277bd', fontWeight: 700, borderColor: '#90caf9' },
                  },
                }}
              >
                <ToggleButton value="log">Log</ToggleButton>
                <ToggleButton value="lin">Linear</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </>
        )}
      </Box>
      </Box>

      <Box id="nd-sub-table-area">
      {/* ── Outorgas subterrâneas ────────────────────────────────────────────── */}
      <Box id="nd-sub-grants-header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.8, bgcolor: '#f5f7ff' }}>
        <Stack direction="row" alignItems="center" spacing={0.6}>
          <WaterDropIcon sx={{ fontSize: 13, color: '#0277bd' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#0277bd', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {abbr('Outorgas subterrâneas', isMobile)}
          </Typography>
        </Stack>
        {subPoints !== null && (
          <Chip label={subPoints.length} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#e1f5fe', color: '#0277bd' }} />
        )}
      </Box>
      <Divider />

      <Box id="nd-sub-grants-table">
        {subPoints === null ? (
          <Box sx={{ opacity: 0.4, pointerEvents: 'none' }}>
            <CompactTable
              headers={TABLE_HEADERS}
              rows={Array.from({ length: 15 }, () => TABLE_HEADERS.map((_, j) => (
                <Box sx={{ height: 9, borderRadius: 1, bgcolor: '#cfd8dc', width: j === 0 ? 80 : j === 1 ? 56 : j === 2 ? 64 : j === 3 ? 90 : 36 }} />
              )))}
            />
          </Box>
        ) : subPoints.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
              Nenhuma outorga subterrânea encontrada no subsistema.
            </Typography>
          </Box>
        ) : (
          <CompactTable
            headers={TABLE_HEADERS}
            rows={subPoints.map(m => {
              const demandas = m.dt_demanda?.demandas ?? [];
              const monthly = MESES.map((_, i) => {
                const d = demandas.find(d => parseInt(d.mes) === i + 1);
                if (!d) return '—';
                const v = parseFloat(d.vazao_ld);
                return isNaN(v) ? '—' : numberWithCommas(v, 2);
              });
              return [m.us_nome ?? '—', m.us_cpf_cnpj ?? '—', m.int_processo ?? '—', m.emp_endereco ?? '—', ...monthly];
            })}
            onRowClick={i => onMarkerSelect?.({ ...subPoints[i], _catColor: '#0277bd', _catLabel: 'Subterrânea' })}
          />
        )}
      </Box>
      </Box>

      </Box>

      {/* ── Diálogo de busca de usuário ──────────────────────────────────────── */}
      <UserSearchDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleUserSelect}
      />
    </Box>
  );
}

