/**
 * @file LoginDialog.js
 * @description Modal de autenticação com abas "Entrar" e "Cadastrar".
 * - Persiste sessão em localStorage via AuthProvider.
 * - Salva credenciais (e-mail + senha) com dropdown de autopreenchimento.
 * - Não pode ser fechado sem sessão ativa.
 */

import React, { useRef, useState } from 'react';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Popper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import { login, register } from '../../services/auth';
import { useAuth } from '../../hooks/auth-hooks';

/* ── Painel de aba ──────────────────────────────────────────────────────── */

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
      {value === index && children}
    </Box>
  );
}

/* ── Componente principal ───────────────────────────────────────────────── */

/**
 * @component LoginDialog
 * @description Diálogo de login/cadastro. Abre automaticamente se não houver sessão.
 */
function LoginDialog() {
  const {
    session, loginOpen, setLoginOpen,
    credentials, saveSession, saveCredential,
    removeCredential, clearCredentials, logout,
  } = useAuth();

  const [tab, setTab]               = useState(0);
  const [loginEmail, setLoginEmail] = useState(() => credentials[0]?.email || '');
  const [loginPass, setLoginPass]   = useState(() => credentials[0]?.password || '');
  const [loginMsg, setLoginMsg]     = useState({ text: '', error: false });
  const [loginLoading, setLoginLoading] = useState(false);

  const [regEmail, setRegEmail]   = useState('');
  const [regPass, setRegPass]     = useState('');
  const [regMsgOk, setRegMsgOk]   = useState('');
  const [regMsgPending, setRegMsgPending] = useState('');
  const [regMsgErr, setRegMsgErr] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const emailInputRef = useRef(null);

  const canClose = !!session?.token;

  const handleClose = () => { if (canClose) setLoginOpen(false); };

  /* ── Dropdown de credenciais ──────────────────────────────────────────── */

  const filteredCreds = credentials.filter(c =>
    !loginEmail || c.email.toLowerCase().includes(loginEmail.toLowerCase())
  );

  const handleSelectCred = (cred) => {
    setLoginEmail(cred.email);
    setLoginPass(cred.password);
    setDropdownOpen(false);
  };

  const handleRemoveCred = (e, email) => {
    e.stopPropagation();
    removeCredential(email);
  };

  /* ── Login ────────────────────────────────────────────────────────────── */

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMsg({ text: '', error: false });

    if (loginPass.length < 3 || loginPass.length > 5) {
      setLoginMsg({ text: 'A senha deve ter entre 3 e 5 caracteres.', error: true });
      return;
    }

    setLoginLoading(true);
    try {
      const data = await login(loginEmail.trim(), loginPass);
      if (data?.token) {
        saveSession(data);
        saveCredential(loginEmail.trim(), loginPass);
        setLoginOpen(false);
      } else {
        setLoginMsg({ text: data?.error ?? data?.mensagem ?? 'Credenciais inválidas.', error: true });
      }
    } catch (err) {
      setLoginMsg({ text: err.message || 'Não foi possível fazer login. Verifique suas credenciais.', error: true });
    } finally {
      setLoginLoading(false);
    }
  };

  /* ── Cadastro ─────────────────────────────────────────────────────────── */

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegMsgOk(''); setRegMsgPending(''); setRegMsgErr('');

    if (regPass.length < 3 || regPass.length > 5) {
      setRegMsgErr('A senha deve ter entre 3 e 5 caracteres.');
      return;
    }

    setRegLoading(true);
    try {
      await register(regEmail.trim(), regPass);
      setRegMsgOk('Cadastro realizado com sucesso!');
      setRegMsgPending('Aprovação pendente pelo administrador.');
      setRegEmail(''); setRegPass('');
    } catch (err) {
      setRegMsgErr(err.message || 'Não foi possível cadastrar. Tente novamente.');
    } finally {
      setRegLoading(false);
    }
  };

  /* ── Limpar tudo ──────────────────────────────────────────────────────── */

  const handleClearAll = () => {
    clearCredentials();
    saveSession(null);
    setLoginEmail('');
    setLoginPass('');
    setDropdownOpen(false);
  };

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <Dialog
      open={loginOpen}
      onClose={handleClose}
      disableEscapeKeyDown={!canClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'visible' } }}
    >
      {/* Botão fechar */}
      {canClose && (
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
          aria-label="Fechar"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      <DialogContent sx={{ pt: 4, pb: 3, px: 4 }}>
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: '50%',
              bgcolor: 'primary.main', color: 'white', mb: 1.5,
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography variant="h6" fontWeight={700} letterSpacing={2}>
            SAD / DF
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de Apoio à Decisão — ADASA
          </Typography>
        </Box>

        {/* Abas */}
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setLoginMsg({ text: '', error: false }); setRegMsgOk(''); setRegMsgPending(''); setRegMsgErr(''); }}
          variant="fullWidth"
          sx={{ mb: 1 }}
        >
          <Tab label="Entrar" />
          <Tab label="Cadastrar" />
        </Tabs>

        {/* ── Painel: Entrar ─────────────────────────────────────────── */}
        <TabPanel value={tab} index={0}>
          {session?.colaborador?.email ? (
            /* Sessão ativa */
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1" fontWeight={600}>
                {session.colaborador.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sessão ativa
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={logout}
              >
                Sair
              </Button>
            </Box>
          ) : (
            /* Formulário de login */
            <Box component="form" onSubmit={handleLogin} noValidate>
              {/* Campo e-mail com dropdown */}
              <Box sx={{ position: 'relative' }}>
                <TextField
                  inputRef={emailInputRef}
                  label="E-mail"
                  type="email"
                  value={loginEmail}
                  onChange={e => { setLoginEmail(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  required
                  fullWidth
                  size="small"
                  autoComplete="off"
                  sx={{ mb: 2 }}
                />
                {dropdownOpen && filteredCreds.length > 0 && (
                  <Popper
                    open
                    anchorEl={emailInputRef.current}
                    placement="bottom-start"
                    style={{ zIndex: 1400, width: emailInputRef.current?.offsetWidth }}
                  >
                    <Paper elevation={4}>
                      <List dense disablePadding>
                        {filteredCreds.map(c => (
                          <ListItem
                            key={c.email}
                            button
                            onMouseDown={() => handleSelectCred(c)}
                            sx={{ pr: 5 }}
                          >
                            <ListItemText
                              primary={c.email}
                              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                title="Remover"
                                onMouseDown={e => handleRemoveCred(e, c.email)}
                              >
                                <CloseIcon fontSize="inherit" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Popper>
                )}
              </Box>

              <TextField
                label="Senha"
                type="password"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                required
                fullWidth
                size="small"
                autoComplete="off"
                inputProps={{ minLength: 3, maxLength: 5 }}
                helperText="Entre 3 e 5 caracteres"
                sx={{ mb: 2 }}
              />

              {loginMsg.text && (
                <Alert severity={loginMsg.error ? 'error' : 'success'} sx={{ mb: 2 }}>
                  {loginMsg.text}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loginLoading}
                startIcon={loginLoading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {loginLoading ? 'Entrando…' : 'Entrar'}
              </Button>
            </Box>
          )}

          {/* Limpar tudo */}
          {credentials.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Button
                size="small"
                color="warning"
                fullWidth
                onClick={handleClearAll}
              >
                Limpar e-mails, senhas e cache
              </Button>
            </>
          )}
        </TabPanel>

        {/* ── Painel: Cadastrar ───────────────────────────────────────── */}
        <TabPanel value={tab} index={1}>
          <Box component="form" onSubmit={handleRegister} noValidate>
            <TextField
              label="E-mail"
              type="email"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              required
              fullWidth
              size="small"
              autoComplete="off"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Senha"
              type="password"
              value={regPass}
              onChange={e => setRegPass(e.target.value)}
              required
              fullWidth
              size="small"
              autoComplete="off"
              inputProps={{ minLength: 3, maxLength: 5 }}
              helperText="Entre 3 e 5 caracteres."
              sx={{ mb: 2 }}
            />

            {regMsgOk && <Alert severity="success" sx={{ mb: 1 }}>{regMsgOk}</Alert>}
            {regMsgPending && <Alert severity="info" sx={{ mb: 1 }}>{regMsgPending}</Alert>}
            {regMsgErr && <Alert severity="error" sx={{ mb: 2 }}>{regMsgErr}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={regLoading}
              startIcon={regLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {regLoading ? 'Cadastrando…' : 'Cadastrar'}
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default LoginDialog;
