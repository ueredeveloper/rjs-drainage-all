import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box, Typography, Tabs, Tab, TextField, Button,
  Chip, Stack, Divider, Slider, LinearProgress, Alert,
  IconButton, Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TransformIcon from '@mui/icons-material/Transform';
import { PolarArea } from 'react-chartjs-2';

import CompactTable from '../components/CompactTable';
import TextSearchBar from '../components/TextSearchBar';
import CoordConverter from '../components/CoordConverter';
import { polarCenteredLabelsPlugin } from '../chartSetup';
import { TI_CATS, MESES } from '../constants';
import { numberWithCommas } from '../../tools';

const HEADERS_BASE  = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço'];
const HEADERS_VAZAO = [...HEADERS_BASE, ...MESES];

// colunas extras por categoria (sem vazão mensal)
const CAT_EXTRA_COLS = {
  barragem: [
    { label: 'Rio',              key: 'rio_barragem' },
    { label: 'Mecan. Extravasor', key: 'mecanismo_controle_extravasor' },
    { label: 'Domínio',          key: 'id_dominio_barragem' },
    { label: 'Última Inspeção',  key: 'data_ult_inspecao' },
    { label: 'Crista',           key: 'comprimento_crista_m' },
    { label: 'Classe',           key: 'class_barr' },
    { label: 'Área de Contrib.', key: 'area_contribuicao' },
    { label: 'Área Inund.',      key: 'area_inundada_ha' },
  ],
  efluente: [
    { label: 'Nome da Bacia', key: 'bh_nome' },
    { label: 'Classe',        key: 'classe_manancial' },
    { label: 'Descrição',     key: 'sp_descricao' },
  ],
  pluvial: [
    { label: 'Verificado',      key: 'int_verificado' },
    { label: 'Tipo de Outorga', key: 'to_descricao' },
  ],
};

const CATS_SEM_VAZAO = new Set(Object.keys(CAT_EXTRA_COLS));

export default function GeralTab({
  lat, lng, onLatChange, onLngChange, onApplyCoordinates,
  radius, onRadiusChange,
  onSearch, onTextSearch,
  loading, error,
  textLoading, textError,
  searchResult, searchPages, onClearPage, onClearAll,
  onMarkerSelect, searchHistory,
  hiddenCats, onToggleCat,
}) {
  const [subTab, setSubTab] = useState(0);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [openConverter, setOpenConverter] = useState(false);

  // Vai para a última página quando uma nova pesquisa é adicionada
  const prevLenRef = useRef(0);
  const pagesLen = searchPages?.length ?? 0;
  useEffect(() => {
    if (pagesLen > prevLenRef.current) {
      setActivePageIdx(pagesLen - 1);
      setSubTab(0);
    } else if (activePageIdx >= pagesLen && pagesLen > 0) {
      setActivePageIdx(pagesLen - 1);
    }
    prevLenRef.current = pagesLen;
  }, [pagesLen, activePageIdx]);

  const activePage = searchPages?.[activePageIdx] ?? null;
  const activeData = activePage?.data ?? null;

  // ── Resultados da página ativa por categoria ──────────────────────────────
  const categories = useMemo(() => {
    if (!activeData) return {};
    return {
      subterranea: Array.isArray(activeData.subterranea) ? activeData.subterranea : [],
      superficial: Array.isArray(activeData.superficial) ? activeData.superficial : [],
      barragem:    Array.isArray(activeData.barragem)    ? activeData.barragem    : [],
      pluvial:     Array.isArray(activeData.pluvial)     ? activeData.pluvial     : [],
      efluente:    Array.isArray(activeData.efluente)    ? activeData.efluente    : [],
    };
  }, [activeData]);

  const activeCat    = TI_CATS[subTab];
  const activeRows   = categories[activeCat?.key] ?? [];
  const semVazao     = CATS_SEM_VAZAO.has(activeCat?.key);
  const extraCols    = CAT_EXTRA_COLS[activeCat?.key] ?? [];
  const tableHeaders = semVazao
    ? [...HEADERS_BASE, ...extraCols.map(c => c.label)]
    : HEADERS_VAZAO;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Busca por coordenada + raio ────────────────────────────────────── */}
      <Box id="nd-geral-coord-search" sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 1 }}>
          Busca por Coordenadas
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={1.2}>
          <TextField size="small" label="Latitude"  value={lat} onChange={e => onLatChange(e.target.value)} sx={{ flex: 1, '& input': { fontSize: '0.78rem' } }} />
          <TextField size="small" label="Longitude" value={lng} onChange={e => onLngChange(e.target.value)} sx={{ flex: 1, '& input': { fontSize: '0.78rem' } }} />
          <Button
            variant="contained" size="small" onClick={onSearch} disabled={loading}
            sx={{ flexShrink: 0, textTransform: 'none', fontSize: '0.75rem', px: 2, bgcolor: '#003566', '&:hover': { bgcolor: '#004080' } }}
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </Button>
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
        </Stack>

        <CoordConverter
          open={openConverter}
          onClose={() => setOpenConverter(false)}
          onConvert={({ lat: latN, lng: lngN }) => {
            onApplyCoordinates?.({ lat: latN, lng: lngN });
            setOpenConverter(false);
          }}
        />

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#78909c', flexShrink: 0 }}>600 m</Typography>
          <Slider
            value={radius} min={600} max={2000} step={100}
            onChange={(_, v) => onRadiusChange(v)}
            valueLabelDisplay="auto" valueLabelFormat={v => `${v} m`}
            marks={[{ value: 600 }, { value: 1000 }, { value: 1300 }, { value: 1500 }, { value: 2000 }]}
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

      {/* ── PolarArea — reflete a página ativa ──────────────────────────── */}
      {!loading && (() => {
        const isDemo = pagesLen === 0 || !activePage;
        const DEMO_COUNTS = [45, 28, 12, 8, 3];
        const hidden = hiddenCats ?? new Set();
        const rawCounts = isDemo
          ? DEMO_COUNTS
          : TI_CATS.map(c => (Array.isArray(activeData?.[c.key]) ? activeData[c.key].length : 0));
        const counts = rawCounts.map((v, i) => hidden.has(TI_CATS[i].key) ? 0 : v);
        const logData = counts.map(v => Math.log1p(v));
        const chartKey = isDemo ? 'demo' : `${activePageIdx}-${JSON.stringify(counts)}`;

        return (
          <Box id="nd-geral-polar-chart" sx={{ px: 2, pt: 1.2, pb: 0.5, flexShrink: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {isDemo ? 'Distribuição de outorgas' : `Distribuição — ${activePage?.label ?? ''}`}
              </Typography>
              <Chip
                label={isDemo ? 'Demonstração' : `${pagesLen} pesquisa${pagesLen !== 1 ? 's' : ''}`}
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

            {/* Toggles por categoria */}
            {!isDemo && (
              <Stack id="nd-geral-cat-toggles" direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="flex-end" mt={0.8}>
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

      {/* ── Navegação de pesquisas (paginação) ────────────────────────────── */}
      {pagesLen > 0 && (
        <Box id="nd-geral-pages-nav" sx={{ px: 1.5, py: 0.8, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#78909c', flexShrink: 0, mr: 0.3 }}>
              Pesquisas:
            </Typography>
            {(searchPages ?? []).map((page, idx) => {
              const total = Object.values(page.data).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0);
              const isActive = activePageIdx === idx;
              return (
                <Chip
                  key={page.id}
                  label={`${page.label} · ${total}`}
                  size="small"
                  onClick={() => { setActivePageIdx(idx); setSubTab(0); }}
                  onDelete={() => {
                    onClearPage?.(page.id);
                  }}
                  sx={{
                    height: 22,
                    fontSize: '0.62rem',
                    fontWeight: isActive ? 700 : 400,
                    bgcolor: isActive ? '#1565c020' : 'transparent',
                    color: isActive ? '#1565c0' : '#546e7a',
                    border: `1px solid ${isActive ? '#1565c0' : '#dde3ea'}`,
                    '& .MuiChip-deleteIcon': {
                      fontSize: 14,
                      color: isActive ? '#1565c080' : '#90a4ae',
                      '&:hover': { color: '#e53935' },
                    },
                    transition: 'all 0.15s ease',
                  }}
                />
              );
            })}
            {pagesLen > 1 && (
              <Chip
                label="Limpar tudo"
                size="small"
                onClick={onClearAll}
                variant="outlined"
                sx={{
                  height: 22, fontSize: '0.62rem',
                  color: '#e53935', border: '1px solid #ffcdd2',
                  '&:hover': { bgcolor: '#ffebee' },
                }}
              />
            )}
          </Stack>
        </Box>
      )}

      {/* ── Resultados da página ativa ─────────────────────────────────────── */}
      {activePage && !loading ? (
        <>
          <Box id="nd-geral-subtabs" sx={{ borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
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

          <Box id="nd-geral-table" sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5, height: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 } }}>
            {activeRows.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  Nenhuma outorga {activeCat?.label} encontrada no raio buscado.
                </Typography>
              </Box>
            ) : (
              <CompactTable
                headers={tableHeaders}
                rows={activeRows.map(m => {
                  const base = [m.us_nome ?? '—', m.us_cpf_cnpj ?? '—', m.int_processo ?? '—', m.emp_endereco ?? '—'];
                  if (semVazao) return [...base, ...extraCols.map(c => m[c.key] ?? '—')];
                  const demandas = m.dt_demanda?.demandas ?? [];
                  const monthly = MESES.map((_, i) => {
                    const d = demandas.find(d => parseInt(d.mes) === i + 1);
                    if (!d) return '—';
                    const v = parseFloat(d.vazao_ld);
                    return isNaN(v) ? '—' : numberWithCommas(v, 2);
                  });
                  return [...base, ...monthly];
                })}
                onRowClick={i => onMarkerSelect?.({
                  ...activeRows[i],
                  _catColor: activeCat?.color,
                  _catLabel: activeCat?.label,
                })}
              />
            )}
          </Box>
        </>
      ) : !loading && (
        <Box sx={{ opacity: 0.4, pointerEvents: 'none', flex: 1, overflow: 'hidden' }}>
          <CompactTable
            headers={HEADERS_VAZAO}
            rows={Array.from({ length: 15 }, () => HEADERS_VAZAO.map((_, j) => (
              <Box sx={{ height: 9, borderRadius: 1, bgcolor: '#cfd8dc', width: j === 0 ? 80 : j === 1 ? 56 : j === 2 ? 64 : j === 3 ? 90 : 36 }} />
            )))}
          />
        </Box>
      )}
    </Box>
  );
}
