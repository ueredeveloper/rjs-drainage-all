import React, { useState } from 'react';
import { Box, TextField, LinearProgress, Alert, IconButton, Tooltip, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const PLACEHOLDER = 'Nome, CPF/CNPJ, endereço, processo, nº do ato...';


export default function TextSearchBar({ onSearch, loading, error }) {
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < 3;

  const handleSearch = () => {
    if (trimmed.length >= 3) onSearch(trimmed);
  };

  return (
    <Box id="nd-text-search" sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f5f7ff', borderBottom: '1px solid #e8eaf0' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          fullWidth
          placeholder={PLACEHOLDER}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          error={tooShort}
          helperText={tooShort ? 'Mínimo de 3 caracteres' : ''}
          sx={{ '& input': { fontSize: '0.78rem' }, '& .MuiFormHelperText-root': { fontSize: '0.62rem', mt: 0.3 } }}
        />
        <Tooltip title={loading ? 'Buscando…' : 'Buscar'}>
          <span>
            <IconButton
              size="small" onClick={handleSearch} disabled={loading}
              sx={{ flexShrink: 0, bgcolor: '#003566', color: '#fff', borderRadius: 1, p: 0.7, alignSelf: 'flex-start', '&:hover': { bgcolor: '#004080' }, '&.Mui-disabled': { bgcolor: '#90a4ae', color: '#fff' } }}
            >
              {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SearchIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ mt: 1 }} />}

      {error && (
        <Alert severity="error" sx={{ fontSize: '0.73rem', py: 0.3, mt: 1 }}>{error}</Alert>
      )}
    </Box>
  );
}

