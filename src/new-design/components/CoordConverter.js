/**
 * Conversor de coordenadas para o novo design (cópia local).
 * Suporta conversão de UTM → Decimal e GMS → Decimal.
 */
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  Tabs, Tab, Box, TextField, Button, Typography,
  RadioGroup, FormControlLabel, Radio, FormControl,
  FormLabel, Select, MenuItem, InputLabel, IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import * as turf from '@turf/turf';

const BRASILIA_UTM = { zone: '23', hemisphere: 'S', easting: '190756', northing: '8253264' };

const BRASILIA_GMS = {
  latDeg: '15', latMin: '46', latSec: '47', latDir: 'S',
  lngDeg: '47', lngMin: '55', lngSec: '45', lngDir: 'W',
};

function utmToLatLng(zone, hemisphere, easting, northing) {
  const a = 6378137;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const E0 = 500000;
  const N0 = hemisphere === 'S' ? 10000000 : 0;

  const e2 = 2 * f - f * f;
  const ePrime2 = e2 / (1 - e2);
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

  const x = easting - E0;
  const y = northing - N0;

  const M = y / k0;
  const mu =
    M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu) +
    ((1097 * Math.pow(e1, 4)) / 512) * Math.sin(8 * mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const N1 = a / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1);
  const T1 = tanPhi1 * tanPhi1;
  const C1 = ePrime2 * cosPhi1 * cosPhi1;
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * sinPhi1 * sinPhi1, 1.5);
  const D = x / (N1 * k0);
  const D2 = D * D;

  const lat =
    phi1 -
    ((N1 * tanPhi1) / R1) *
      (D2 / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrime2) * D2 * D2) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ePrime2 - 3 * C1 * C1) *
          D2 * D2 * D2) / 720);

  const lng0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;
  const lng =
    lng0 +
    (D -
      ((1 + 2 * T1 + C1) * D * D2) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ePrime2 + 24 * T1 * T1) *
        D2 * D2 * D) / 120) / cosPhi1;

  const latDeg = (lat * 180) / Math.PI;
  const lngDeg = (lng * 180) / Math.PI;

  turf.point([lngDeg, latDeg]);

  return { lat: latDeg, lng: lngDeg };
}

function gmsComponentToDecimal(degrees, minutes, seconds, direction) {
  const d = Math.abs(parseFloat(degrees) || 0);
  const m = parseFloat(minutes) || 0;
  const s = parseFloat(seconds) || 0;
  const decimal = d + m / 60 + s / 3600;
  return direction === 'S' || direction === 'W' ? -decimal : decimal;
}

function ResultBox({ lat, lng, onConvert }) {
  const copy = () =>
    navigator.clipboard.writeText(`${lat.toFixed(7)}, ${lng.toFixed(7)}`);

  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        px: 1.5,
        py: 1,
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Typography variant="caption">
          <strong>Lat:</strong> {lat.toFixed(7)}
        </Typography>
        <Typography variant="caption">
          <strong>Lng:</strong> {lng.toFixed(7)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title="Copiar coordenadas">
          <IconButton size="small" color="secondary" onClick={copy}>
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Aplicar nos campos de coordenada">
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => onConvert({ lat, lng })}
            sx={{ minWidth: 0, px: 1, fontSize: '0.7rem' }}
          >
            Aplicar
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}

function UtmPanel({ onConvert }) {
  const [utm, setUtm] = useState(BRASILIA_UTM);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handle = (field) => (e) => setUtm((p) => ({ ...p, [field]: e.target.value }));

  function convert() {
    const zone = parseInt(utm.zone);
    const easting = parseFloat(utm.easting);
    const northing = parseFloat(utm.northing);

    if (!zone || zone < 1 || zone > 60 || isNaN(easting) || isNaN(northing)) {
      setError('Preencha todos os campos. Fuso: 1–60.');
      setResult(null);
      return;
    }

    try {
      const r = utmToLatLng(zone, utm.hemisphere, easting, northing);
      setResult(r);
      setError('');
    } catch {
      setError('Erro na conversão. Verifique os valores.');
      setResult(null);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'nowrap' }}>
        <TextField
          label="Fuso"
          type="number"
          size="small"
          color="secondary"
          value={utm.zone}
          onChange={handle('zone')}
          inputProps={{ min: 1, max: 60 }}
          sx={{ width: 68 }}
        />

        <FormControl sx={{ flexShrink: 0 }}>
          <FormLabel sx={{ fontSize: '0.68rem', lineHeight: 1, mb: 0.25 }}>Hemisfério</FormLabel>
          <RadioGroup row value={utm.hemisphere} onChange={handle('hemisphere')}>
            <FormControlLabel
              value="N"
              control={<Radio size="small" color="secondary" />}
              label={<Typography variant="caption">N</Typography>}
              sx={{ mr: 2 }}
            />
            <FormControlLabel
              value="S"
              control={<Radio size="small" color="secondary" />}
              label={<Typography variant="caption">S</Typography>}
              sx={{ mr: 0 }}
            />
          </RadioGroup>
        </FormControl>

        <TextField
          label="Easting — E (m)"
          size="small"
          color="secondary"
          value={utm.easting}
          onChange={handle('easting')}
          sx={{ flex: 1 }}
        />

        <TextField
          label="Northing — N (m)"
          size="small"
          color="secondary"
          value={utm.northing}
          onChange={handle('northing')}
          sx={{ flex: 1 }}
        />
      </Box>

      {error && <Typography color="error" variant="caption">{error}</Typography>}

      <Button size="small" variant="contained" color="secondary" onClick={convert}>
        Converter
      </Button>

      {result && <ResultBox lat={result.lat} lng={result.lng} onConvert={onConvert} />}
    </Box>
  );
}

function GmsPanel({ onConvert }) {
  const [gms, setGms] = useState(BRASILIA_GMS);
  const [result, setResult] = useState(null);

  const handle = (field) => (e) => setGms((p) => ({ ...p, [field]: e.target.value }));

  function convert() {
    const lat = gmsComponentToDecimal(gms.latDeg, gms.latMin, gms.latSec, gms.latDir);
    const lng = gmsComponentToDecimal(gms.lngDeg, gms.lngMin, gms.lngSec, gms.lngDir);
    setResult({ lat, lng });
  }

  function DirSelect({ field, options }) {
    return (
      <FormControl size="small" sx={{ width: 56, flexShrink: 0 }}>
        <InputLabel color="secondary" sx={{ fontSize: '0.75rem' }}>Dir.</InputLabel>
        <Select
          label="Dir."
          color="secondary"
          value={gms[field]}
          onChange={handle(field)}
          sx={{ fontSize: '0.78rem' }}
        >
          {options.map((o) => (
            <MenuItem key={o} value={o} sx={{ fontSize: '0.78rem' }}>{o}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  const fieldSx = { width: 52, flexShrink: 0, '& input': { fontSize: '0.8rem' }, '& label': { fontSize: '0.75rem' } };
  const labelSx = { width: 22, flexShrink: 0, fontWeight: 600, fontSize: '0.75rem' };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'nowrap' }}>
        <Typography variant="caption" color="text.secondary" sx={labelSx}>Lat</Typography>
        <TextField label="G" size="small" color="secondary" value={gms.latDeg} onChange={handle('latDeg')} sx={fieldSx} />
        <TextField label="M" size="small" color="secondary" value={gms.latMin} onChange={handle('latMin')} sx={fieldSx} />
        <TextField label="S" size="small" color="secondary" value={gms.latSec} onChange={handle('latSec')} sx={fieldSx} />
        <DirSelect field="latDir" options={['N', 'S']} />

        <Box sx={{ width: '1px', height: 32, bgcolor: 'divider', mx: 0.5, flexShrink: 0 }} />

        <Typography variant="caption" color="text.secondary" sx={labelSx}>Lng</Typography>
        <TextField label="G" size="small" color="secondary" value={gms.lngDeg} onChange={handle('lngDeg')} sx={fieldSx} />
        <TextField label="M" size="small" color="secondary" value={gms.lngMin} onChange={handle('lngMin')} sx={fieldSx} />
        <TextField label="S" size="small" color="secondary" value={gms.lngSec} onChange={handle('lngSec')} sx={fieldSx} />
        <DirSelect field="lngDir" options={['E', 'W']} />
      </Box>

      <Button size="small" variant="contained" color="secondary" onClick={convert}>
        Converter
      </Button>

      {result && <ResultBox lat={result.lat} lng={result.lng} onConvert={onConvert} />}
    </Box>
  );
}

export default function CoordConverter({ open, onClose, onConvert }) {
  const [tab, setTab] = useState(0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1,
          px: 2,
        }}
      >
        <Typography variant="subtitle2">Conversor de Coordenadas</Typography>
        <Tooltip title="Fechar">
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ minHeight: 36 }}
        >
          <Tab label="UTM → Decimal" sx={{ minHeight: 36, fontSize: '0.75rem', py: 0 }} />
          <Tab label="GMS → Decimal" sx={{ minHeight: 36, fontSize: '0.75rem', py: 0 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ px: 2, py: 1.5 }}>
        {tab === 0 && <UtmPanel onConvert={onConvert} />}
        {tab === 1 && <GmsPanel onConvert={onConvert} />}
      </DialogContent>
    </Dialog>
  );
}
