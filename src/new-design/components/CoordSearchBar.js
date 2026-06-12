import React from 'react';
import { Box, TextField, Button, Stack, Alert, Typography, LinearProgress } from '@mui/material';

export default function CoordSearchBar({ lat, lng, onLatChange, onLngChange, onSearch, loading, error, title, children }) {
  return (
    <Box sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
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
        <Button
          variant="contained" size="small" onClick={onSearch} disabled={loading}
          sx={{ flexShrink: 0, textTransform: 'none', fontSize: '0.75rem', px: 2, bgcolor: '#003566', '&:hover': { bgcolor: '#004080' } }}
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </Button>
      </Stack>

      {children}

      {loading && <LinearProgress sx={{ mt: 1 }} />}

      {error && (
        <Alert severity="error" sx={{ fontSize: '0.73rem', py: 0.3, mt: 1 }}>{error}</Alert>
      )}
    </Box>
  );
}
