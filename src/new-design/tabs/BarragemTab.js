import React, { useState } from 'react';
import { Box, Tabs, Tab, Divider, Chip, Slider, Stack, Typography } from '@mui/material';
import WaterIcon from '@mui/icons-material/Water';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import CoordSearchBar from '../components/CoordSearchBar';
import CompactTable from '../components/CompactTable';
import SectionLabel from '../components/SectionLabel';
import ScrollList from '../components/OutorgaList';
import { VOLUMES_BARRAGEM, DEMANDAS_BARRAGEM, MOCK_BAR } from '../constants';

const TABLE_HEADERS = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço', 'Bacia'];

export default function BarragemTab({
  lat, lng, onLatChange, onLngChange,
  radius, onRadiusChange,
  onSearch, loading, error,
  searchResult, onMarkerSelect,
}) {
  const [subTab, setSubTab] = useState(0);

  const barRows = Array.isArray(searchResult?.barragem) ? searchResult.barragem : null;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <CoordSearchBar
        lat={lat} lng={lng}
        onLatChange={onLatChange} onLngChange={onLngChange}
        onSearch={onSearch} loading={loading} error={error}
        title="Busca por coordenada — Barragem"
      >
        {/* Slider de raio — igual ao Geral */}
        <Stack direction="row" alignItems="center" spacing={1.5} mt={0.5}>
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
          <Chip
            label={`${(radius / 1000).toLocaleString('pt-BR', { minimumFractionDigits: radius % 1000 === 0 ? 0 : 1 })} km`}
            size="small"
            sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#e3f2fd', color: '#1565c0', flexShrink: 0 }}
          />
        </Stack>
      </CoordSearchBar>

      {!searchResult && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary', px: 3, py: 2, textAlign: 'center' }}>
          <MyLocationIcon sx={{ fontSize: 36, color: '#bdbdbd' }} />
          <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
            Busque por coordenadas para carregar as barragens e reservatórios da área.
          </Typography>
        </Box>
      )}

      {/* Sub-abas estáticas: Volumes / Demandas / Outorgas */}
      <Box sx={{ borderBottom: '1px solid #e0e0e0', flexShrink: 0, bgcolor: '#fafafa' }}>
        <Tabs
          value={subTab} onChange={(_, v) => setSubTab(v)}
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, fontSize: '0.68rem', textTransform: 'none', py: 0, px: 2.5 }, '& .MuiTabs-indicator': { height: 2 } }}
        >
          <Tab label="Volumes" />
          <Tab label="Demandas" />
          <Tab label="Outorgas" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 } }}>

        {subTab === 0 && (
          <Box sx={{ p: 1.5 }}>
            <CompactTable
              headers={['Reservatório', 'Vol. Total (hm³)', 'Vol. Útil (hm³)', 'Cota Máx. (m)', 'Operação']}
              rows={VOLUMES_BARRAGEM.map(d => [
                d.nome, d.volTotal, d.volUtil, d.cotaMax,
                <Chip key="s" label={d.status} size="small" sx={{ height: 17, fontSize: '0.58rem', bgcolor: d.status === 'Normal' ? '#e8f5e9' : '#fff3e0', color: d.status === 'Normal' ? '#2e7d32' : '#e65100' }} />,
              ])}
            />
          </Box>
        )}

        {subTab === 1 && (
          <Box sx={{ p: 1.5 }}>
            <CompactTable
              headers={['Processo', 'Demandante', 'Volume (m³/mês)', 'Período', 'Status']}
              rows={DEMANDAS_BARRAGEM.map(d => [
                d.processo, d.demandante, d.volume, d.periodo,
                <Chip key="s" label={d.status} size="small" sx={{ height: 17, fontSize: '0.58rem', bgcolor: '#e8f5e9', color: '#2e7d32' }} />,
              ])}
            />
          </Box>
        )}

        {subTab === 2 && (
          <>
            {barRows !== null ? (
              <>
                <SectionLabel title="Outorgas de barragem" count={barRows.length} />
                <Divider />
                {barRows.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                      Nenhuma barragem encontrada no raio buscado.
                    </Typography>
                  </Box>
                ) : (
                  <CompactTable
                    headers={TABLE_HEADERS}
                    rows={barRows.map(m => [
                      m.us_nome ?? '—', m.us_cpf_cnpj ?? '—',
                      m.int_processo ?? '—', m.emp_endereco ?? '—', m.bh_nome ?? '—',
                    ])}
                    onRowClick={i => onMarkerSelect?.({
                      ...barRows[i], _catColor: '#bf360c', _catLabel: 'Barragem',
                    })}
                  />
                )}
              </>
            ) : (
              <>
                <SectionLabel title="Outorgas de barragem (exemplo)" count={MOCK_BAR.length} />
                <Divider />
                <ScrollList items={MOCK_BAR} color="#bf360c" bg="#fbe9e7" Icon={WaterIcon} />
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
