/**
 * @description Este módulo contém o componente de barra de navegação do aplicativo.
 */

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
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
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SAD/DF - Sistema de Apoio à Decisão
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
