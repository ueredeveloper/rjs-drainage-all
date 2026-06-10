/**
 * @description Este módulo contém o componente de barra de navegação do aplicativo.
 */

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useAuth } from '../../hooks/auth-hooks';

/**
 * Componente funcional que representa a barra de navegação do aplicativo.
 * @component
 * @returns {JSX.Element} O elemento JSX que representa a barra de navegação.
 */
function MenuAppBar() {
  const { session, setLoginOpen } = useAuth();
  const userLabel = session?.colaborador?.email
    ? session.colaborador.email.split('@')[0]
    : null;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: '0.02em' }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>SAD/DF - Sistema de Apoio à Decisão</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>SAD/DF</Box>
          </Typography>
          <Tooltip title={session?.colaborador?.email ?? ''}>
            <Button
              color="inherit"
              startIcon={<AccountCircleIcon />}
              onClick={() => setLoginOpen(true)}
            >
              {userLabel ?? 'Login'}
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuAppBar;
