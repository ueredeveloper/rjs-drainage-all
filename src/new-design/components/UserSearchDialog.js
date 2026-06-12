import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box,
  TextField, Button, Typography, Stack, LinearProgress, Alert, Divider,
  Table, TableHead, TableBody, TableRow, TableCell, Paper, Chip,
  Collapse,
} from '@mui/material';
import CloseIcon         from '@mui/icons-material/Close';
import SearchIcon        from '@mui/icons-material/Search';
import PersonIcon        from '@mui/icons-material/Person';
import WaterDropIcon     from '@mui/icons-material/WaterDrop';
import ExpandMoreIcon    from '@mui/icons-material/ExpandMore';
import ExpandLessIcon    from '@mui/icons-material/ExpandLess';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';

import { getUsers, findDemands } from '../../services/connection';
import { numberWithCommas } from '../../tools';

const USER_HEADERS = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço'];

// Cabeçalhos das interferências
const INTERF_HEADERS = [
  'Endereço', 'Latitude', 'Longitude', 'Vol. Anual (m³/ano)',
];

// Linha de usuário com expansão inline das interferências
function UserRow({ user, onSelect }) {
  const [open, setOpen]           = useState(false);
  const [demands, setDemands]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const handleToggle = useCallback(async () => {
    if (!open && demands === null) {
      setLoading(true);
      setError(null);
      try {
        const res = await findDemands(user.end_id);
        console.log('[UserSearchDialog] demands for end_id', user.end_id, res);
        setDemands(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('[UserSearchDialog] findDemands error', err);
        setError('Erro ao buscar interferências.');
      } finally {
        setLoading(false);
      }
    }
    setOpen(v => !v);
  }, [open, demands, user.end_id]);

  return (
    <>
      {/* ── linha do usuário ── */}
      <TableRow
        hover
        onClick={handleToggle}
        sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f4ff' } }}
      >
        <TableCell sx={{ fontSize: '0.72rem', py: 0.7, px: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {open ? <ExpandLessIcon sx={{ fontSize: 14, color: '#1565c0' }} /> : <ExpandMoreIcon sx={{ fontSize: 14, color: '#90a4ae' }} />}
            <span>{user.us_nome ?? '—'}</span>
          </Stack>
        </TableCell>
        <TableCell sx={{ fontSize: '0.72rem', py: 0.7, px: 1 }}>{user.us_cpf_cnpj ?? '—'}</TableCell>
        <TableCell sx={{ fontSize: '0.72rem', py: 0.7, px: 1 }}>{user.proc_sei ?? user.doc_sei ?? '—'}</TableCell>
        <TableCell sx={{ fontSize: '0.72rem', py: 0.7, px: 1, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.end_log ?? user.end_logradouro ?? '—'}
        </TableCell>
      </TableRow>

      {/* ── interferências expandidas ── */}
      <TableRow>
        <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ bgcolor: '#f8faff', px: 2, py: 1, borderBottom: '1px solid #e8eaf0' }}>

              {loading && <LinearProgress sx={{ mb: 1 }} />}
              {error   && <Alert severity="error" sx={{ py: 0.3, fontSize: '0.7rem', mb: 1 }}>{error}</Alert>}

              {demands !== null && demands.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Nenhuma interferência encontrada.
                </Typography>
              )}

              {demands !== null && demands.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem', color: '#0277bd', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 0.6 }}>
                    Finalidades autorizadas — clique para usar no cálculo
                  </Typography>
                  <Paper variant="outlined" sx={{ overflow: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                          {INTERF_HEADERS.map(h => (
                            <TableCell key={h} align="center" sx={{ fontSize: '0.6rem', fontWeight: 700, py: 0.6, px: 0.8, whiteSpace: 'nowrap' }}>
                              {h}
                            </TableCell>
                          ))}
                          <TableCell sx={{ width: 32 }} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {demands.map((d, i) => {
                          const vol = parseFloat(d.vol_anual_ma ?? d.dt_demanda?.vol_anual_ma ?? 0);
                          return (
                            <TableRow
                              key={i} hover
                              onClick={() => onSelect({ qUsuario: isNaN(vol) ? 0 : vol, user, interference: d })}
                              sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#e8f5e9' } }}
                            >
                              <TableCell sx={{ fontSize: '0.7rem', py: 0.6, px: 0.8, maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {d.end_logradouro ?? '—'}
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: '0.7rem', py: 0.6, px: 0.8, fontFamily: 'monospace' }}>
                                {d.int_latitude  ?? '—'}
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: '0.7rem', py: 0.6, px: 0.8, fontFamily: 'monospace' }}>
                                {d.int_longitude ?? '—'}
                              </TableCell>
                              <TableCell align="center" sx={{ fontSize: '0.7rem', py: 0.6, px: 0.8 }}>
                                {isNaN(vol) ? '—' : numberWithCommas(vol)}
                              </TableCell>
                              <TableCell align="center" sx={{ py: 0.6, px: 0.5 }}>
                                <CheckCircleIcon sx={{ fontSize: 14, color: '#43a047', opacity: 0.7 }} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function UserSearchDialog({ open, onClose, onSelect }) {
  const [query, setQuery]         = useState('');
  const [users, setUsers]         = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchErr(null);
    setUsers(null);
    try {
      const res = await getUsers(query.trim());
      console.log('[UserSearchDialog] getUsers result', res);
      setUsers(Array.isArray(res) ? res : []);
    } catch {
      setSearchErr('Erro ao buscar usuários. Verifique a conexão.');
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleSelect = useCallback((payload) => {
    onSelect(payload);
    onClose();
  }, [onSelect, onClose]);

  return (
    <Dialog
      open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 2, height: 560 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PersonIcon sx={{ color: '#0277bd', fontSize: 18 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
            Busca de Usuário — Interferências Subterrâneas
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        {/* ── barra de busca ── */}
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 0.8 }}>
            Nome, CPF/CNPJ, Processo, Doc. SEI
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small" fullWidth
              placeholder="Nome, CPF/CNPJ, processo..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              sx={{ '& input': { fontSize: '0.78rem' } }}
            />
            <Button
              variant="contained" size="small"
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              startIcon={<SearchIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{ flexShrink: 0, textTransform: 'none', fontSize: '0.72rem', px: 1.5, bgcolor: '#003566', '&:hover': { bgcolor: '#004080' } }}
            >
              Buscar
            </Button>
          </Stack>
          {searching && <LinearProgress sx={{ mt: 1 }} />}
          {searchErr  && <Alert severity="error" sx={{ mt: 1, py: 0.3, fontSize: '0.72rem' }}>{searchErr}</Alert>}
        </Box>

        {/* ── tabela de usuários + interferências inline ── */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {users === null && !searching && (
            <Box sx={{ py: 7, textAlign: 'center', color: 'text.disabled' }}>
              <PersonIcon sx={{ fontSize: 32, mb: 0.5 }} />
              <Typography variant="caption" display="block" sx={{ fontSize: '0.72rem' }}>
                Pesquise para listar usuários.
              </Typography>
            </Box>
          )}

          {users !== null && users.length === 0 && (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                Nenhum usuário encontrado.
              </Typography>
            </Box>
          )}

          {users !== null && users.length > 0 && (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {USER_HEADERS.map(h => (
                    <TableCell key={h} sx={{ fontSize: '0.63rem', fontWeight: 700, py: 0.8, px: 1, bgcolor: '#f0f4ff', whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u, i) => (
                  <UserRow key={u.us_id ?? i} user={u} onSelect={handleSelect} />
                ))}
              </TableBody>
            </Table>
          )}
        </Box>

        {/* ── rodapé informativo ── */}
        {users !== null && users.length > 0 && (
          <Box sx={{ px: 2, py: 0.8, borderTop: '1px solid #e8eaf0', bgcolor: '#fafafa', flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.6}>
              <WaterDropIcon sx={{ fontSize: 11, color: '#0277bd' }} />
              <Typography variant="caption" sx={{ fontSize: '0.62rem', color: '#78909c' }}>
                Clique em um usuário para expandir as interferências. Clique em uma interferência para incluí-la no cálculo.
              </Typography>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
