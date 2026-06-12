import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Stack, Divider, LinearProgress, Alert,
  TextField, Button, ToggleButton, ToggleButtonGroup,
  Table, TableHead, TableBody, TableRow, TableCell, Paper, Chip,
} from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import WaterDropIcon    from '@mui/icons-material/WaterDrop';
import MyLocationIcon   from '@mui/icons-material/MyLocation';
import WallpaperIcon    from '@mui/icons-material/Wallpaper';
import LayersIcon       from '@mui/icons-material/Layers';
import CloseIcon        from '@mui/icons-material/Close';
import { Bar }          from 'react-chartjs-2';

import CompactTable      from '../components/CompactTable';
import UserSearchDialog  from '../components/UserSearchDialog';
import { findPointsInASystem } from '../../services/geolocation';
import { analyzeAvailability, numberWithCommas, nFormatter } from '../../tools';

const WELL_TYPES = [
  { value: '1', label: 'Manual / Tubular Raso' },
  { value: '3', label: 'Tubular Profundo'       },
];

const TABLE_HEADERS = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço', 'Bacia'];

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

function AvailChart({ avail, qUsuario }) {
  const values = [
    avail.q_ex,
    avail.q_points,
    Number(avail.vol_avaiable),
    qUsuario,
  ];

  return (
    <Bar
      data={{
        labels: CHART_ITEMS.map(c => c.label),
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
            beginAtZero: true,
            ticks: {
              font: { size: 9 }, color: '#78909c',
              callback: v => nFormatter(v, 1),
            },
            grid: { color: '#f0f0f0' },
          },
        },
      }}
    />
  );
}

export default function SubterraneanTab({
  lat, lng, onLatChange, onLngChange,
  onMarkerSelect, onSubShape, onSubMarkers, onClearCircle,
}) {
  const [wellTypeId, setWellTypeId]     = useState('1');
  const [subPoints, setSubPoints]       = useState(null);
  const [avail, setAvail]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // Q Usuário: vem da seleção de interferência no diálogo
  const [qUsuario, setQUsuario]         = useState(0);
  const [selUser, setSelUser]           = useState(null);
  const [dialogOpen, setDialogOpen]     = useState(false);

  const handleSearch = useCallback(async () => {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) {
      setError('Coordenadas inválidas. Ex: -15.7801');
      return;
    }

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
        setAvail(null);
        return;
      }
      setAvail(analyzeAvailability(info, points));
    } catch (err) {
      console.error('[subterrânea]', err);
      setError('Erro ao buscar dados subterrâneos. Verifique conexão ou autenticação.');
      setSubPoints(null);
      setAvail(null);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, wellTypeId, onSubShape, onSubMarkers, onClearCircle]);

  const handleUserSelect = useCallback(({ qUsuario: q, user }) => {
    setQUsuario(isNaN(q) ? 0 : q);
    setSelUser(user);
    setDialogOpen(false);
  }, []);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Busca por coordenada ─────────────────────────────────────────────── */}
      <Box sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 1 }}>
          Busca por coordenada — Subterrânea
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
          <Button
            variant="contained" size="small" onClick={handleSearch} disabled={loading}
            sx={{ flexShrink: 0, textTransform: 'none', fontSize: '0.75rem', px: 2, bgcolor: '#003566', '&:hover': { bgcolor: '#004080' } }}
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </Button>
        </Stack>

        <ToggleButtonGroup
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
            <ToggleButton key={t.value} value={t.value}>{t.label}</ToggleButton>
          ))}
        </ToggleButtonGroup>

        {loading && <LinearProgress sx={{ mt: 1 }} />}
        {error && <Alert severity="error" sx={{ fontSize: '0.73rem', py: 0.3, mt: 1 }}>{error}</Alert>}
      </Box>

      {/* ── Análise de disponibilidade ───────────────────────────────────────── */}
      <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderBottom: '1px solid #e8eaf0' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 1 }}>
          Análise de disponibilidade
        </Typography>

        {!avail && !loading && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.disabled', py: 0.5 }}>
            <MyLocationIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>
              Busque por coordenadas para calcular a disponibilidade do subsistema.
            </Typography>
          </Stack>
        )}

        {avail && (
          <>
            {/* chips: Bacia + UH */}
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mb={1}>
              {avail.bacia_nome && (
                <Chip size="small" icon={<WallpaperIcon sx={{ fontSize: '0.85rem !important' }} />}
                  label={avail.bacia_nome} sx={{ fontSize: '0.65rem', height: 20 }} />
              )}
              {avail.uh_nome && (
                <Chip size="small" icon={<LayersIcon sx={{ fontSize: '0.85rem !important' }} />}
                  label={`${avail.uh_label ?? ''} — ${avail.uh_nome}`} sx={{ fontSize: '0.65rem', height: 20 }} />
              )}
            </Stack>

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
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{numberWithCommas(avail.q_ex)}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{avail.n_points}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{numberWithCommas(avail.q_points)}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{numberWithCommas(avail.q_points_per)} %</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.75rem', py: 0.8, px: 1 }}>{numberWithCommas(avail.vol_avaiable)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            {/* Chart + botão Adicionar Usuário */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.8}>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#546e7a', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Vazões (m³/ano)
              </Typography>
              <Stack direction="row" spacing={0.6} alignItems="center">
                {selUser && (
                  <Chip
                    size="small"
                    label={selUser.us_nome}
                    onDelete={() => { setQUsuario(0); setSelUser(null); }}
                    deleteIcon={<CloseIcon sx={{ fontSize: '0.75rem !important' }} />}
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#ede7f6', color: '#4a148c', maxWidth: 140 }}
                  />
                )}
                <Button
                  size="small" variant="outlined"
                  startIcon={<PersonSearchIcon sx={{ fontSize: '0.9rem !important' }} />}
                  onClick={() => setDialogOpen(true)}
                  sx={{ textTransform: 'none', fontSize: '0.65rem', py: 0.3, px: 1, borderColor: '#6a1b9a', color: '#6a1b9a', '&:hover': { bgcolor: '#f3e5f5' } }}
                >
                  Adicionar usuário
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ height: 130 }}>
              <AvailChart avail={avail} qUsuario={qUsuario} />
            </Box>
          </>
        )}
      </Box>

      {/* ── Outorgas subterrâneas ────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.8, flexShrink: 0, bgcolor: '#f5f7ff' }}>
        <Stack direction="row" alignItems="center" spacing={0.6}>
          <WaterDropIcon sx={{ fontSize: 13, color: '#0277bd' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#0277bd', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Outorgas subterrâneas
          </Typography>
        </Stack>
        {subPoints !== null && (
          <Chip label={subPoints.length} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#e1f5fe', color: '#0277bd' }} />
        )}
      </Box>
      <Divider />

      <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 } }}>
        {subPoints === null ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <WaterDropIcon sx={{ fontSize: 32, color: '#b0bec5', mb: 1 }} />
            <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
              Busque por coordenadas para ver as outorgas subterrâneas do subsistema.
            </Typography>
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
            rows={subPoints.map(m => [
              m.us_nome ?? '—', m.us_cpf_cnpj ?? '—',
              m.int_processo ?? '—', m.emp_endereco ?? '—', m.bh_nome ?? '—',
            ])}
            onRowClick={i => onMarkerSelect?.({ ...subPoints[i], _catColor: '#0277bd', _catLabel: 'Subterrânea' })}
          />
        )}
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
