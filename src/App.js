import packageJson from '../package.json';

import { Link, Typography } from '@mui/material';
import './App.css';
import MenuAppBar from './components/Commom/MenuAppBar';
import Analyse from './components/MainFlow/Analyse';
import Footer from './Footer';

/**
 * Componente principal da aplicação.
 * @component
 * @requires MenuAppBar
 * @requires Analyse
 * 
 */
function App() {
  return (
    <div className="App">
      <MenuAppBar />
      <Analyse />
      <Footer/>
    </div>
  );
}

export default App;
