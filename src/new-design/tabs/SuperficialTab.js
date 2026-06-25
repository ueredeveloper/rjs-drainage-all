import React, { useState, useRef } from 'react';
import {
  Box, Tabs, Tab, Chip, Avatar, Divider, Typography, Alert, Stack,
  IconButton, Tooltip, useTheme, useMediaQuery,
} from '@mui/material';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import LayersIcon from '@mui/icons-material/Layers';
import GetAppIcon from '@mui/icons-material/GetApp';

import { exportGeralToCsv } from '../../tools/export-geral-to-csv';

import CoordSearchBar from '../components/CoordSearchBar';
import CompactTable from '../components/CompactTable';
import SectionLabel from '../components/SectionLabel';
import { SurfaceChart, SurfaceTable, SurfaceTableModulations } from '../components/surface';

import { fetchShape, fetchMarkersByUH, fetchOttoBasins } from '../../services/shapes';
import { getMarkersInsideOttoBasins, searchHydrograficUnit, numberWithCommas } from '../../tools';
import {
  calculateQOutorgadaSecao, calculateQIndividualSecao, calculateQOutorgavelSecao,
  calculateQReferenciaSecao, calculateQDisponivelSecao,
  calculateQOutorgadaUH, calculateQReferenciaUH, calculateQRemanescenteUH,
  calculateQOutorgavelUH, calculateQDisponivelUH,
  calculateQSolicitadaMenorQDisponivel, calculateQSolicitadaMenorQIndividual,
} from '../../tools/surface-tools';
import { initialsStates } from '../../initials-states';
import { MESES, abbr } from '../constants';

const TABLE_HEADERS = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço', ...MESES];

// Dados de exemplo para o estado sem busca
const MOCK_SECAO = {
  alias: 'Análise na Seção de Captação',
  meses: { values: ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'] },
  q_outorgada:  { alias: 'SQOUTORGADA-MONT.-SEÇÃO', values: [1.2,1.1,1.4,1.3,1.0,0.9,0.8,0.8,1.0,1.2,1.3,1.2] },
  q_referencia: { alias: 'QREFERÊNCIA-SEÇÃO',       values: [8.5,7.8,9.2,8.1,6.4,5.2,4.8,4.9,6.3,7.9,8.8,8.6] },
  q_outorgavel: { alias: 'QOUTORGÁVEL-SEÇÃO',       values: [6.8,6.2,7.4,6.5,5.1,4.2,3.8,3.9,5.0,6.3,7.0,6.9] },
  q_individual: { alias: 'QOUTORGÁVEL-INDIVIDUAL',  values: [1.4,1.2,1.5,1.3,1.0,0.8,0.8,0.8,1.0,1.3,1.4,1.4] },
  q_disponivel: { alias: 'QDISPONÍVEL-SEÇÃO',       values: [5.6,5.1,6.0,5.2,4.1,3.3,3.0,3.1,4.0,5.1,5.7,5.7] },
  q_sol_q_dis:  { alias: 'QSOLICITADA ≤ QDISPONÍVEL', values: Array(12).fill(false) },
  q_sol_q_ind:  { alias: 'QSOLICITADA ≤ QINDIVIDUAL', values: Array(12).fill(false) },
  outorgas: [],
};
const MOCK_UH = {
  alias: 'Análise na Unidade Hidrográfica',
  meses: { values: ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'] },
  q_outorgada:   { alias: 'SQOUTORGADA-UH',        values: [12,11,14,13,10,9,8,8,10,12,13,12] },
  q_referencia:  { alias: 'QREFERÊNCIA-UH',         values: [85,78,92,81,64,52,48,49,63,79,88,86] },
  q_remanescente:{ alias: 'QREMANESCENTE-UH',       values: [17,15.6,18.4,16.2,12.8,10.4,9.6,9.8,12.6,15.8,17.6,17.2] },
  q_outorgavel:  { alias: 'QOUTORGÁVEL-UH',         values: [68,62,74,65,51,42,38,39,50,63,70,69] },
  q_disponivel:  { alias: 'QDISPONÍVEL-UH',         values: [56,51,60,52,41,33,30,31,40,51,57,57] },
  q_sol_q_dis:   { alias: 'QSOLICITADA ≤ QDISPONÍVEL-UH', values: Array(12).fill(false) },
  q_disponibilidade: { alias: 'Há disponibilidade?', values: Array(12).fill(false) },
  q_demanda_ajustada:{ alias: 'Demanda ajustada',   values: Array(12).fill(0) },
  outorgas: [],
  attributes: { uh_codigo: '', uh_nome: '' },
};

export default function SuperficialTab({ lat, lng, onLatChange, onLngChange, onApplyCoordinates, onMarkerSelect, onSupShape, onSupMarkers, onClearCircle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surfaceAnalyse, setSurfaceAnalyse] = useState(initialsStates.surfaceAnalyse);
  const [ottoInfo, setOttoInfo] = useState({ area: 0, uhNome: '', uhRotulo: '' });
  const overlaysCacheRef = useRef([]);

  const hasData = surfaceAnalyse.secao.q_referencia.values.some(v => v !== 0);
  const secaoGrants = surfaceAnalyse.secao.outorgas ?? [];

  const handleExport = () => {
    const BASE_FIELDS = [
      'us_nome', 'us_cpf_cnpj', 'int_processo', 'emp_endereco', 'us_endereco', 'us_bairro', 'us_cep',
      'bh_nome', 'uh_nome', 'to_descricao', 'ti_descricao', 'tp_descricao', 'sp_descricao',
      'fin_finalidade', 'int_num_ato', 'int_data_publicacao', 'int_data_vencimento',
      'int_latitude', 'int_longitude', 'us_email', 'us_telefone_1', 'us_caixa_postal',
      'hg_codigo', 'hg_sistema', 'hg_subsistema',
    ];
    const monthHeaders = MESES.map((_, i) => `vazao_mes_${String(i + 1).padStart(2, '0')}`);
    const headers = [...BASE_FIELDS, ...monthHeaders];

    const rows = secaoGrants.map(m => {
      const base = BASE_FIELDS.map(k => m[k] ?? '');
      const demandas = m.dt_demanda?.demandas ?? [];
      const monthly = MESES.map((_, i) => {
        const d = demandas.find(d => parseInt(d.mes) === i + 1);
        if (!d) return '';
        const v = parseFloat(d.vazao);
        return isNaN(v) ? '' : v;
      });
      return [...base, ...monthly];
    });

    exportGeralToCsv({
      headers,
      rows,
      filename: `outorgas_superficial_${ottoInfo.uhRotulo || ''}`,
    });
  };

  async function handleSearch() {
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) { setError('Coordenadas inválidas. Ex: -15.7801'); return; }
    if (!window.google?.maps) {
      setError('API do Google Maps ainda carregando. Aguarde um instante e tente novamente.');
      return;
    }

    onApplyCoordinates?.({ lat: latN, lng: lngN });

    setLoading(true);
    setError(null);
    onClearCircle?.();
    onSupShape?.(null);
    onSupMarkers?.([]);
    try {
      const ottoBasins = await fetchOttoBasins(latN, lngN);
      const { uh_rotulo: uhRotulo, uh_nome: uhNome = '' } = ottoBasins.ottoBasins[0].attributes;

      setOttoInfo({ area: ottoBasins.ottoBasinsToGmaps.area, uhNome, uhRotulo });

      // Envia polígonos das otto bacias para o mapa como GeoJSON
      const supShape = {
        type: 'FeatureCollection',
        features: ottoBasins.ottoBasins.map(f => ({
          type: 'Feature',
          properties: f.attributes ?? {},
          geometry: f.geometry,
        })),
      };
      onSupShape?.(supShape);
 
      const uhGrants = await fetchMarkersByUH(uhRotulo);
      const sectionGrants = await getMarkersInsideOttoBasins(ottoBasins.ottoBasinsToGmaps, uhGrants, null);

      // Envia pontos da seção para o mapa
      onSupMarkers?.(sectionGrants?.superficial ?? []);

const hydrographicBasin = await searchHydrograficUnit(
        fetchShape,
        overlaysCacheRef.current,
        val => { overlaysCacheRef.current = typeof val === 'function' ? val(overlaysCacheRef.current) : val; },
        uhRotulo,
      );

      const ottoBasinArea = ottoBasins.ottoBasinsToGmaps.area;

      const q_outorgada_secao  = calculateQOutorgadaSecao(sectionGrants);
      const q_referencia_secao = calculateQReferenciaSecao(hydrographicBasin, ottoBasinArea);
      const q_outorgavel_secao = calculateQOutorgavelSecao(q_referencia_secao);
      const q_individual_secao = calculateQIndividualSecao(q_outorgavel_secao, 0.2);
      const q_disponivel_secao = calculateQDisponivelSecao(q_outorgavel_secao, q_outorgada_secao);
      const q_sol_q_dis        = calculateQSolicitadaMenorQDisponivel(surfaceAnalyse.q_solicitada.values, q_disponivel_secao);
      const q_sol_q_ind        = calculateQSolicitadaMenorQIndividual(surfaceAnalyse.q_solicitada.values, q_individual_secao);

      const q_outorgada_uh  = calculateQOutorgadaUH(uhGrants[0]);
      const q_referencia_uh = calculateQReferenciaUH(hydrographicBasin);
      const q_remanescente_uh = calculateQRemanescenteUH(q_referencia_uh);
      const q_outorgavel_uh = calculateQOutorgavelUH(q_referencia_uh);
      const q_disponivel_uh = calculateQDisponivelUH(q_outorgavel_uh, q_outorgada_uh);

      setSurfaceAnalyse(prev => ({
        ...prev,
        secao: {
          ...prev.secao,
          outorgas:    sectionGrants?.superficial ?? [],
          q_outorgada:  { ...prev.secao.q_outorgada,  values: q_outorgada_secao  },
          q_referencia: { ...prev.secao.q_referencia, values: q_referencia_secao },
          q_outorgavel: { ...prev.secao.q_outorgavel, values: q_outorgavel_secao },
          q_individual: { ...prev.secao.q_individual, values: q_individual_secao },
          q_disponivel: { ...prev.secao.q_disponivel, values: q_disponivel_secao },
          q_sol_q_dis:  { ...prev.secao.q_sol_q_dis,  values: q_sol_q_dis        },
          q_sol_q_ind:  { ...prev.secao.q_sol_q_ind,  values: q_sol_q_ind        },
        },
        uh: {
          ...prev.uh,
          outorgas:     uhGrants,
          attributes:   hydrographicBasin.attributes,
          q_outorgada:  { ...prev.uh.q_outorgada,   values: q_outorgada_uh   },
          q_referencia: { ...prev.uh.q_referencia,  values: q_referencia_uh  },
          q_remanescente: { ...prev.uh.q_remanescente, values: q_remanescente_uh },
          q_outorgavel: { ...prev.uh.q_outorgavel,  values: q_outorgavel_uh  },
          q_disponivel: { ...prev.uh.q_disponivel,  values: q_disponivel_uh  },
        },
      }));

    } catch (err) {
      console.error('[superficial]', err);
      // JSON parse errors indicam resposta não-JSON do servidor (ex: acesso negado, token expirado)
      const isAuthError = err instanceof SyntaxError && err.message.includes('JSON');
      setError(isAuthError
        ? 'Acesso negado ao serviço de unidades hidrográficas. Verifique se você está autenticado no sistema principal.'
        : `Erro na análise superficial: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <CoordSearchBar
        id="nd-sup-coord-search"
        lat={lat} lng={lng}
        onLatChange={onLatChange} onLngChange={onLngChange}
        onApplyCoordinates={onApplyCoordinates}
        onSearch={handleSearch} loading={loading} error={error}
        title={abbr('Busca por Coordenadas', isMobile)}
      />

      {error && (
        <Box sx={{ px: 2, pt: 0.5, flexShrink: 0 }}>
          <Alert severity="error" sx={{ fontSize: '0.73rem', py: 0.3 }}>{error}</Alert>
        </Box>
      )}

      {hasData && (
        <Stack id="nd-sup-uh-chips" direction="row" spacing={1} sx={{ px: 2, py: 0.8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Chip
            avatar={<Avatar sx={{ bgcolor: 'transparent', width: 20, height: 20 }}><WallpaperIcon sx={{ fontSize: 14 }} /></Avatar>}
            label={`Área: ${ottoInfo.area.toFixed(4)} km²`}
            size="small" sx={{ fontSize: '0.65rem', height: 20 }}
          />
          <Chip
            avatar={<Avatar sx={{ bgcolor: 'transparent', width: 20, height: 20 }}><LayersIcon sx={{ fontSize: 14 }} /></Avatar>}
            label={`UH: ${ottoInfo.uhNome} — ${ottoInfo.uhRotulo}`}
            size="small" sx={{ fontSize: '0.65rem', height: 20 }}
          />
        </Stack>
      )}

      {/* Abas acima do conteúdo */}
      <Tabs
        id="nd-sup-tabs"
        value={tabIndex} onChange={(_, v) => setTabIndex(v)}
        variant="scrollable" scrollButtons="auto"
        sx={{
          flexShrink: 0, borderBottom: '1px solid #e0e0e0',
          '& .MuiTab-root': { minHeight: 38, fontSize: '0.68rem', textTransform: 'none', py: 0 },
          '& .MuiTabs-indicator': { height: 2 },
        }}
      >
        <Tab label="Gráficos" />
        <Tab label="Tabelas" />
        <Tab label="Modulações" />
      </Tabs>

      {/* Conteúdo das sub-abas + tabela de outorgas sempre abaixo */}
      <Box id="nd-sup-content" sx={{ flex: 1, overflow: 'auto', minHeight: 0,
        '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 }
      }}>

        {/* ── Conteúdo da aba ativa ─────────────────────────────────────────── */}
        <Box id="nd-sup-chart-area">
        {tabIndex === 0 && (
          <Box id="nd-sup-charts" sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
            <Box sx={{ height: 200 }}><SurfaceChart analyse={hasData ? surfaceAnalyse.secao : MOCK_SECAO} /></Box>
            <Box sx={{ height: 200 }}><SurfaceChart analyse={hasData ? surfaceAnalyse.uh   : MOCK_UH}    /></Box>
          </Box>
        )}

        {tabIndex === 1 && (
          hasData ? (
            <Box id="nd-sup-tables">
              <SurfaceTable q_solicitada={surfaceAnalyse.q_solicitada} analyse={surfaceAnalyse.secao} setSurfaceAnalyse={setSurfaceAnalyse} />
              <SurfaceTable q_solicitada={surfaceAnalyse.q_solicitada} analyse={surfaceAnalyse.uh}   setSurfaceAnalyse={setSurfaceAnalyse} />
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                Realize a busca para ver as tabelas de vazão.
              </Typography>
            </Box>
          )
        )}

        {tabIndex === 2 && (
          hasData ? (
            <Box id="nd-sup-modulations">
              <SurfaceTableModulations analyse={surfaceAnalyse.h_ajuste} setSurfaceAnalyse={setSurfaceAnalyse} />
              <SurfaceTableModulations analyse={surfaceAnalyse.h_modula} setSurfaceAnalyse={setSurfaceAnalyse} />
              <SurfaceTableModulations analyse={surfaceAnalyse.q_modula} setSurfaceAnalyse={setSurfaceAnalyse} />
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                Realize a busca para ver as modulações.
              </Typography>
            </Box>
          )
        )}

        </Box>

        {/* ── Outorgas — sempre abaixo do conteúdo da aba ──────────────────── */}
        <Box id="nd-sup-table-area">
        <Divider />
        <Box id="nd-sup-outorgas-header" sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <SectionLabel title="Outorgas na seção de captação" count={hasData ? secaoGrants.length : undefined} />
          </Box>
          <Tooltip title="Exportar tabela (XLSX)">
            <span>
              <IconButton size="small" onClick={handleExport} disabled={secaoGrants.length === 0} sx={{ mr: 1 }}>
                <GetAppIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Divider />
        <Box id="nd-sup-outorgas-table">
          {!hasData ? (
            <Box sx={{ opacity: 0.4, pointerEvents: 'none' }}>
              <CompactTable
                headers={TABLE_HEADERS}
                rows={Array.from({ length: 15 }, () => TABLE_HEADERS.map((_, j) => (
                  <Box sx={{ height: 9, borderRadius: 1, bgcolor: '#cfd8dc', width: j === 0 ? 80 : j === 1 ? 56 : j === 2 ? 64 : j === 3 ? 90 : 36 }} />
                )))}
              />
            </Box>
          ) : secaoGrants.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                Nenhuma captação superficial encontrada na seção.
              </Typography>
            </Box>
          ) : (
            <CompactTable
              headers={TABLE_HEADERS}
              rows={secaoGrants.map(m => {
                const demandas = m.dt_demanda?.demandas ?? [];
                const monthly = MESES.map((_, i) => {
                  const d = demandas.find(d => parseInt(d.mes) === i + 1);
                  if (!d) return '—';
                  const v = parseFloat(d.vazao);
                  return isNaN(v) ? '—' : numberWithCommas(v, 2);
                });
                return [m.us_nome ?? '—', m.us_cpf_cnpj ?? '—', m.int_processo ?? '—', m.emp_endereco ?? '—', ...monthly];
              })}
              onRowClick={i => onMarkerSelect?.({ ...secaoGrants[i], _catColor: '#2e7d32', _catLabel: 'Superficial' })}
            />
          )}
        </Box>
        </Box>
      </Box>

    </Box>
  );
}
