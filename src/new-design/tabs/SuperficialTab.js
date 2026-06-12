import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import WavesIcon from '@mui/icons-material/Waves';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import CoordSearchBar from '../components/CoordSearchBar';
import ChartSection from '../components/ChartSection';
import SectionLabel from '../components/SectionLabel';
import ScrollList from '../components/OutorgaList';
import CompactTable from '../components/CompactTable';
import { MOCK_SUP, MESES } from '../constants';
import { chartOpts } from '../chartSetup';

const BAR_COLORS  = ['#2e7d3288', '#388e3c88', '#43a04788', '#558b2f88', '#33691e88'];
const BAR_BORDERS = ['#2e7d32',   '#388e3c',   '#43a047',   '#558b2f',   '#33691e'];
const TABLE_HEADERS = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço', 'Bacia'];

export default function SuperficialTab({
  lat, lng, onLatChange, onLngChange,
  onSearch, loading, error,
  searchResult, onMarkerSelect,
}) {
  const supRows = Array.isArray(searchResult?.superficial) ? searchResult.superficial : null;

  const lineData = {
    labels: MESES,
    datasets: [
      { label: 'Rio Descoberto', data: [4.2, 3.8, 5.1, 4.6, 3.9, 3.2, 2.8, 2.5, 3.4, 4.1, 4.8, 4.5], borderColor: '#2e7d32', backgroundColor: '#2e7d3215', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 1.5 },
      { label: 'Lago Paranoá',   data: [15.0, 14.5, 16.2, 15.8, 14.0, 12.5, 11.8, 12.0, 13.5, 15.2, 16.0, 15.5], borderColor: '#558b2f', backgroundColor: '#558b2f15', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 1.5 },
    ],
  };

  const captItems = supRows?.length > 0 ? supRows.slice(0, 6) : MOCK_SUP;
  const captData = {
    labels: captItems.map(o => (o.us_nome ?? o.nome ?? '').split(' ').slice(0, 2).join(' ')),
    datasets: [{
      label: 'm³/mês',
      data: captItems.map(o => o.volume ?? o.int_volume ?? 0),
      backgroundColor: captItems.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
      borderColor:     captItems.map((_, i) => BAR_BORDERS[i % BAR_BORDERS.length]),
      borderWidth: 1.5, borderRadius: 5,
    }],
  };

  const lineOpts = chartOpts({
    plugins: {
      legend: { display: true, position: 'bottom', labels: { font: { size: 9 }, boxWidth: 10, padding: 6 } },
      tooltip: { bodyFont: { size: 10 }, titleFont: { size: 10 } },
    },
  });

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <CoordSearchBar
        lat={lat} lng={lng}
        onLatChange={onLatChange} onLngChange={onLngChange}
        onSearch={onSearch} loading={loading} error={error}
        title="Busca por coordenada — Superficial"
      />

      {!searchResult && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary', px: 3, py: 2, textAlign: 'center' }}>
          <MyLocationIcon sx={{ fontSize: 36, color: '#bdbdbd' }} />
          <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
            Busque por coordenadas para carregar as captações superficiais da área.
          </Typography>
        </Box>
      )}

      <ChartSection title="Vazão Mensal — Principais Mananciais (L/s)" height={140}>
        <Line data={lineData} options={lineOpts} />
      </ChartSection>

      <Divider />

      <ChartSection title="Volume Captado por Outorga (m³/mês)" height={125}>
        <Bar data={captData} options={chartOpts()} />
      </ChartSection>

      <Divider />

      {supRows !== null ? (
        <>
          <SectionLabel title="Outorgas superficiais" count={supRows.length} />
          <Divider />
          <Box sx={{ flex: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: 5, height: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 } }}>
            {supRows.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  Nenhuma captação superficial encontrada no raio buscado.
                </Typography>
              </Box>
            ) : (
              <CompactTable
                headers={TABLE_HEADERS}
                rows={supRows.map(m => [
                  m.us_nome ?? '—', m.us_cpf_cnpj ?? '—',
                  m.int_processo ?? '—', m.emp_endereco ?? '—', m.bh_nome ?? '—',
                ])}
                onRowClick={i => onMarkerSelect?.({
                  ...supRows[i], _catColor: '#2e7d32', _catLabel: 'Superficial',
                })}
              />
            )}
          </Box>
        </>
      ) : (
        <>
          <SectionLabel title="Captações superficiais (exemplo)" count={MOCK_SUP.length} />
          <Divider />
          <ScrollList items={MOCK_SUP} color="#2e7d32" bg="#e8f5e9" Icon={WavesIcon} />
        </>
      )}
    </Box>
  );
}
