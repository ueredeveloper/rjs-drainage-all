/**
 * @description Este módulo contém o componente de barra de navegação do aplicativo.
 */



import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

/**
 * Componente funcional que representa a barra de navegação do aplicativo.
 * @component
 * 
 * @returns {JSX.Element} O elemento JSX que representa a barra de navegação.
 */
function MenuAppBar() {
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
          <Button color="inherit">Login</Button>
          
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuAppBar;
