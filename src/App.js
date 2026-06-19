import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import './notebook.css';
import LoginDialog from './components/Commom/LoginDialog';
import MenuAppBar from './components/Commom/MenuAppBar';
import Analyse from './components/MainFlow/Analyse';
import Footer from './Footer';
import { AuthProvider } from './hooks/auth-hooks';
import theme from './theme';
import NewDesign from './new-design/NewDesign';

const isNewDesign = window.location.pathname.startsWith('/new-design');

/**
 * Componente principal da aplicação.
 * @component
 * @requires AuthProvider
 * @requires MenuAppBar
 * @requires Analyse
 */
function App() {
  if (isNewDesign) return <ThemeProvider theme={theme}><NewDesign /></ThemeProvider>;

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
