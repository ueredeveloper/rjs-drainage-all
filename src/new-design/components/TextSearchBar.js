import React, { useState } from 'react';
import { Box, TextField, Button, Typography, LinearProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const PLACEHOLDER = 'Nome, CPF/CNPJ, endereço, processo, nº do ato...';

export default function TextSearchBar({ onSearch, loading, error }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <Box id="nd-text-search" sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f5f7ff', borderBottom: '1px solid #e8eaf0' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 1 }}>
        Busca por dados do requerente
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          fullWidth
          placeholder={PLACEHOLDER}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          sx={{ '& input': { fontSize: '0.78rem' } }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          startIcon={<SearchIcon sx={{ fontSize: '0.9rem !important' }} />}
          sx={{ flexShrink: 0, textTransform: 'none', fontSize: '0.75rem', px: 1.5, borderColor: '#003566', color: '#003566', '&:hover': { bgcolor: '#e8f0fe' } }}
        >
          Buscar
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mt: 1 }} />}

      {error && (
        <Alert severity="error" sx={{ fontSize: '0.73rem', py: 0.3, mt: 1 }}>{error}</Alert>
      )}
    </Box>
  );
}
