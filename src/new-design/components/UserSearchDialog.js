import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box,
  TextField, Button, Typography, Stack, LinearProgress, Alert, Divider,
} from '@mui/material';
import CloseIcon      from '@mui/icons-material/Close';
import SearchIcon     from '@mui/icons-material/Search';
import PersonIcon     from '@mui/icons-material/Person';
import WaterDropIcon  from '@mui/icons-material/WaterDrop';

import CompactTable from './CompactTable';
import { getUsers, findDemands } from '../../services/connection';
import { numberWithCommas } from '../../tools';

const USER_HEADERS  = ['Nome', 'CPF/CNPJ', 'Processo', 'Endereço'];
const INTERF_HEADERS = ['Processo', 'Vol. Anual (m³/ano)', 'Tipo'];

export default function UserSearchDialog({ open, onClose, onSelect }) {
  const [query, setQuery]         = useState('');
  const [users, setUsers]         = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState(null);

  const [selUser, setSelUser]         = useState(null);
  const [interfs, setInterfs]         = useState(null);
  const [loadInterf, setLoadInterf]   = useState(false);
  const [interfErr, setInterfErr]     = useState(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true); setSearchErr(null);
    setUsers(null); setSelUser(null); setInterfs(null);
    try {
      const res = await getUsers(query.trim());
      setUsers(Array.isArray(res) ? res : []);
    } catch {
      setSearchErr('Erro ao buscar usuários. Verifique a conexão.');
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleUserClick = useCallback(async (user) => {
    setSelUser(user); setInterfs(null); setInterfErr(null);
    const addId = user.end_id ?? user.add_id ?? user.us_id;
    if (!addId) { setInterfErr('ID de endereço não encontrado para este usuário.'); return; }
    setLoadInterf(true);
    try {
      const res = await findDemands(addId);
      setInterfs(Array.isArray(res) ? res : []);
    } catch {
      setInterfErr('Erro ao buscar interferências.');
    } finally {
      setLoadInterf(false);
    }
  }, []);

  const handleInterfClick = useCallback((interf) => {
    const raw = interf.dt_demanda?.vol_anual_ma ?? interf.vol_anual_ma ?? 0;
    const vol = parseFloat(raw);
    onSelect({ qUsuario: isNaN(vol) ? 0 : vol, user: selUser, interference: interf });
  }, [selUser, onSelect]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 2, height: 520 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PersonIcon sx={{ color: '#0277bd', fontSize: 18 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Busca de Usuário — Interferências Subterrâneas</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ p: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Painel esquerdo: busca + lista de usuários ─────────────────── */}
        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0' }}>

          <Box sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 0.9, display: 'block', mb: 1 }}>
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
                onClick={handleSearch} disabled={searching || !query.trim()}
                startIcon={<SearchIcon sx={{ fontSize: '0.9rem !important' }} />}
                sx={{ flexShrink: 0, textTransform: 'none', fontSize: '0.72rem', px: 1.5, bgcolor: '#003566', '&:hover': { bgcolor: '#004080' } }}
              >
                Buscar
              </Button>
            </Stack>
            {searching && <LinearProgress sx={{ mt: 1 }} />}
            {searchErr && <Alert severity="error" sx={{ mt: 1, py: 0.3, fontSize: '0.72rem' }}>{searchErr}</Alert>}
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {users === null ? (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled' }}>
                <PersonIcon sx={{ fontSize: 28, mb: 0.5 }} />
                <Typography variant="caption" display="block" sx={{ fontSize: '0.72rem' }}>
                  Pesquise para listar usuários.
                </Typography>
              </Box>
            ) : users.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  Nenhum usuário encontrado.
                </Typography>
              </Box>
            ) : (
              <CompactTable
                headers={USER_HEADERS}
                rows={users.map(u => [
                  u.us_nome     ?? '—',
                  u.us_cpf_cnpj ?? '—',
                  u.proc_sei    ?? u.doc_sei ?? '—',
                  u.end_log     ?? '—',
                ])}
                onRowClick={i => handleUserClick(users[i])}
              />
            )}
          </Box>
        </Box>

        {/* ── Painel direito: interferências do usuário selecionado ──────── */}
        <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>

          <Box sx={{ px: 2, py: 1, flexShrink: 0, bgcolor: '#f8faff', borderBottom: '1px solid #e8eaf0' }}>
            <Stack direction="row" alignItems="center" spacing={0.6}>
              <WaterDropIcon sx={{ fontSize: 13, color: '#0277bd' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#0277bd', textTransform: 'uppercase', letterSpacing: 0.9 }}>
                Interferências
              </Typography>
            </Stack>
            {selUser && (
              <Typography variant="caption" sx={{ fontSize: '0.67rem', color: '#546e7a', mt: 0.3, display: 'block' }}>
                {selUser.us_nome}
              </Typography>
            )}
            {loadInterf && <LinearProgress sx={{ mt: 0.5 }} />}
            {interfErr && <Alert severity="error" sx={{ mt: 0.5, py: 0.2, fontSize: '0.7rem' }}>{interfErr}</Alert>}
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {!selUser ? (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled' }}>
                <WaterDropIcon sx={{ fontSize: 28, mb: 0.5 }} />
                <Typography variant="caption" display="block" sx={{ fontSize: '0.72rem' }}>
                  Selecione um usuário ao lado.
                </Typography>
              </Box>
            ) : interfs !== null && interfs.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  Nenhuma interferência encontrada.
                </Typography>
              </Box>
            ) : interfs !== null ? (
              <>
                <Typography variant="caption" sx={{ display: 'block', px: 2, pt: 1, pb: 0.5, fontSize: '0.65rem', color: '#78909c' }}>
                  Clique em uma interferência para incluí-la na análise de disponibilidade.
                </Typography>
                <CompactTable
                  headers={INTERF_HEADERS}
                  rows={interfs.map(f => [
                    f.int_processo ?? '—',
                    numberWithCommas(parseFloat(f.dt_demanda?.vol_anual_ma ?? 0)),
                    f.tp_descricao ?? f._catLabel ?? '—',
                  ])}
                  onRowClick={i => handleInterfClick(interfs[i])}
                />
              </>
            ) : null}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
