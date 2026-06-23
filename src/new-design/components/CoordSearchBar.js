import React, { useCallback, useState } from 'react';
import { Box, TextField, Button, Stack, Alert, Typography, LinearProgress, IconButton, Tooltip, CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import TransformIcon from '@mui/icons-material/Transform';
import CoordConverter from './CoordConverter';

export default function CoordSearchBar({ id, lat, lng, onLatChange, onLngChange, onApplyCoordinates, onSearch, loading, error, title, children }) {
  const [openConverter, setOpenConverter] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
  }, [lat, lng]);

  const handleConvert = useCallback(({ lat: latN, lng: lngN }) => {
    if (onApplyCoordinates) {
      onApplyCoordinates({ lat: latN, lng: lngN });
    } else {
      onLatChange(String(latN.toFixed(7)));
      onLngChange(String(lngN.toFixed(7)));
    }
    setOpenConverter(false);
  }, [onApplyCoordinates, onLatChange, onLngChange]);
  return (
    <Box id={id} sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
      {title && (
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 1 }}>
          {title}
        </Typography>
      )}

      <Stack direction="row" spacing={1} alignItems="center" mb={children ? 1.2 : 0}>
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
            size="small" onClick={handleCopy}
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
              size="small" onClick={onSearch} disabled={loading}
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
        onConvert={handleConvert}
      />

      {children}

      {loading && <LinearProgress sx={{ mt: 1 }} />}

      {error && (
        <Alert severity="error" sx={{ fontSize: '0.73rem', py: 0.3, mt: 1 }}>{error}</Alert>
      )}
    </Box>
  );
}
