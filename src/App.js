import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import { AuthProvider } from './hooks/auth-hooks';
import theme from './theme';
import NewDesign from './new-design/NewDesign';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <NewDesign />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
