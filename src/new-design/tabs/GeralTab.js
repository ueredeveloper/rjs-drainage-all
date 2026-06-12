import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Tabs, Tab, TextField, Button,
  Chip, Stack, Divider, Slider, LinearProgress, Alert,
} from '@mui/material';
import { PolarArea } from 'react-chartjs-2';

import CompactTable from '../components/CompactTable';
import TextSearchBar from '../components/TextSearchBar';
import { polarCenteredLabelsPlugin } from '../chartSetup';
import { TI_CATS } from '../constants';

const TABLE_HEADERS = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço', 'Bacia Hidrográfica'];

export default function GeralTab({
  lat, lng, onLatChange, onLngChange,
  radius, onRadiusChange,
  onSearch, onTextSearch,
  loading, error,
  textLoading, textError,
  searchResult, onMarkerSelect, searchHistory,
  hiddenCats, onToggleCat,
}) {
  const [subTab, setSubTab] = useState(0);

  // ── Resultados geográficos por categoria ──────────────────────────────────
  const categories = useMemo(() => {
    if (!searchResult) return {};
    return {
      subterranea: Array.isArray(searchResult.subterranea) ? searchResult.subterranea : [],
      superficial: Array.isArray(searchResult.superficial) ? searchResult.superficial : [],
      barragem:    Array.isArray(searchResult.barragem)    ? searchResult.barragem    : [],
      pluvial:     Array.isArray(searchResult.pluvial)     ? searchResult.pluvial     : [],
      efluente:    Array.isArray(searchResult.efluente)    ? searchResult.efluente    : [],
    };
  }, [searchResult]);

  const activeCat  = TI_CATS[subTab];
  const activeRows = categories[activeCat?.key] ?? [];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Busca por coordenada + raio ────────────────────────────────────── */}
      <Box sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9 }}>
            Busca por coordenada decimal
          </Typography>
          <Chip
            label={`Raio: ${(radius / 1000).toLocaleString('pt-BR', { minimumFractionDigits: radius % 1000 === 0 ? 0 : 1 })} km`}
            size="small"
            sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#e3f2fd', color: '#1565c0' }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mb={1.2}>
          <TextField size="small" label="Latitude"  value={lat} onChange={e => onLatChange(e.target.value)} sx={{ flex: 1, '& input': { fontSize: '0.78rem' } }} />
          <TextField size="small" label="Longitude" value={lng} onChange={e => onLngChange(e.target.value)} sx={{ flex: 1, '& input': { fontSize: '0.78rem' } }} />
          <Button
            variant="contained" size="small" onClick={onSearch} disabled={loading}
            sx={{ flexShrink: 0, textTransform: 'none', fontSize: '0.75rem', px: 2, bgcolor: '#003566', '&:hover': { bgcolor: '#004080' } }}
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#78909c', flexShrink: 0 }}>600 m</Typography>
          <Slider
            value={radius} min={600} max={2000} step={100}
            onChange={(_, v) => onRadiusChange(v)}
            valueLabelDisplay="auto" valueLabelFormat={v => `${v} m`}
            marks={[{ value: 600 }, { value: 1000 }, { value: 1500 }, { value: 2000 }]}
            sx={{
              flex: 1, color: '#003566',
              '& .MuiSlider-thumb': { width: 14, height: 14 },
              '& .MuiSlider-valueLabel': { fontSize: '0.62rem', py: 0.3, px: 0.8 },
            }}
          />
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#78909c', flexShrink: 0 }}>2.000 m</Typography>
        </Stack>
      </Box>

      {loading && <LinearProgress />}

      {error && (
        <Box sx={{ px: 2, pt: 1, flexShrink: 0 }}>
          <Alert severity="error" sx={{ fontSize: '0.73rem', py: 0.3 }}>{error}</Alert>
        </Box>
      )}

      {/* ── Busca por dados do requerente ─────────────────────────────────── */}
      <TextSearchBar onSearch={onTextSearch} loading={textLoading} error={textError} />

      {/* ── PolarArea — sempre reflete o searchResult atual ──────────────── */}
      {!loading && (() => {
        const isDemo = !searchResult;
        const DEMO_COUNTS = [45, 28, 12, 8, 3];
        // conta diretamente do resultado atual — garante consistência com a tabela
        const hidden = hiddenCats ?? new Set();
        const rawCounts = isDemo
          ? DEMO_COUNTS
          : TI_CATS.map(c => (Array.isArray(searchResult[c.key]) ? searchResult[c.key].length : 0));
        // categorias ocultas aparecem como 0 no chart
        const counts = rawCounts.map((v, i) => hidden.has(TI_CATS[i].key) ? 0 : v);
        const logData = counts.map(v => Math.log1p(v));
        const chartKey = isDemo ? 'demo' : JSON.stringify(counts);

        return (
          <Box sx={{ px: 2, pt: 1.2, pb: 0.5, flexShrink: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {isDemo ? 'Distribuição de outorgas' : 'Distribuição por tipo'}
              </Typography>
              <Chip
                label={isDemo ? 'Demonstração' : `${searchHistory.length} pesquisa${searchHistory.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ height: 16, fontSize: '0.58rem', bgcolor: isDemo ? '#fff3e0' : '#f5f5f5', color: isDemo ? '#e65100' : '#78909c' }}
              />
            </Stack>

            <Box sx={{ height: 300, mt: 0.5 }}>
              <PolarArea
                key={chartKey}
                data={{
                  labels: TI_CATS.map(c => c.label),
                  datasets: [{
                    data:     logData,
                    _rawData: counts,
                    backgroundColor:     TI_CATS.map(c => `${c.color}${isDemo ? '22' : '40'}`),
                    borderColor:         TI_CATS.map(c => isDemo ? `${c.color}70` : c.color),
                    borderWidth: 2,
                    spacing: 4,
                    hoverBackgroundColor: TI_CATS.map(c => `${c.color}70`),
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 900, easing: 'easeInOutCubic', animateRotate: true, animateScale: true },
                  transitions: { active: { animation: { duration: 250 } } },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      bodyFont: { size: 10 }, titleFont: { size: 10 },
                      callbacks: {
                        label: ctx => {
                          const real = counts[ctx.dataIndex];
                          return isDemo
                            ? ` ${ctx.label}: ${real} (exemplo)`
                            : ` ${ctx.label}: ${real} outorga${real !== 1 ? 's' : ''}`;
                        },
                      },
                    },
                  },
                  scales: {
                    r: { beginAtZero: true, ticks: { display: false }, grid: { color: '#e8eaf0' }, pointLabels: { display: false } },
                  },
                }}
                plugins={[polarCenteredLabelsPlugin]}
              />
            </Box>
            {isDemo && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.disabled', fontSize: '0.6rem', mt: 0.5 }}>
                Busque por coordenadas ou desenhe no mapa para ver dados reais.
              </Typography>
            )}

            {/* Toggles — inferior direito */}
            {!isDemo && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="flex-end" mt={0.8}>
                {TI_CATS.map((c, i) => {
                  const isHidden = hidden.has(c.key);
                  return (
                    <Chip
                      key={c.key}
                      label={`${c.label} (${rawCounts[i]})`}
                      size="small"
                      clickable
                      onClick={() => onToggleCat?.(c.key)}
                      sx={{
                        height: 20,
                        fontSize: '0.6rem',
                        fontWeight: isHidden ? 400 : 600,
                        bgcolor: isHidden ? '#f5f5f5' : `${c.color}18`,
                        color: isHidden ? '#bdbdbd' : c.color,
                        border: `1px solid ${isHidden ? '#e0e0e0' : c.color}`,
                        textDecoration: isHidden ? 'line-through' : 'none',
                        transition: 'all 0.18s ease',
                      }}
                    />
                  );
                })}
              </Stack>
            )}
          </Box>
        );
      })()}

      <Divider />

      {/* ── Resultados (geográficos ou por texto) — mesma tabela categorizada ── */}
      {searchResult && !loading && (
        <>
          <Box sx={{ borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
            <Tabs
              value={subTab} onChange={(_, v) => setSubTab(v)}
              variant="scrollable" scrollButtons="auto"
              sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38, fontSize: '0.68rem', textTransform: 'none', py: 0, px: 1.5 }, '& .MuiTabs-indicator': { height: 2 } }}
            >
              {TI_CATS.map(c => (
                <Tab key={c.key} label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <span>{c.label}</span>
                    <Chip label={(categories[c.key] ?? []).length} size="small"
                      sx={{ height: 16, fontSize: '0.58rem', bgcolor: `${c.color}18`, color: c.color, minWidth: 20 }} />
                  </Stack>
                } />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5, height: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 } }}>
            {activeRows.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  Nenhuma outorga {activeCat?.label} encontrada no raio buscado.
                </Typography>
              </Box>
            ) : (
              <CompactTable
                headers={TABLE_HEADERS}
                rows={activeRows.map(m => [
                  m.us_nome ?? '—', m.us_cpf_cnpj ?? '—',
                  m.int_processo ?? '—', m.emp_endereco ?? '—', m.bh_nome ?? '—',
                ])}
                onRowClick={i => onMarkerSelect?.({
                  ...activeRows[i],
                  _catColor: activeCat?.color,
                  _catLabel: activeCat?.label,
                })}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
