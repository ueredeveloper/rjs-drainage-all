import packageJson from '../package.json';

import { Link, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import LoginDialog from './components/Commom/LoginDialog';
import MenuAppBar from './components/Commom/MenuAppBar';
import Analyse from './components/MainFlow/Analyse';
import Footer from './Footer';
import { AuthProvider } from './hooks/auth-hooks';
import theme from './theme';

/**
 * Componente principal da aplicação.
 * @component
 * @requires AuthProvider
 * @requires MenuAppBar
 * @requires Analyse
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
    <AuthProvider>
      <div className="App">
        <MenuAppBar />
        <Analyse />
        <Footer />
        <LoginDialog />
      </div>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
