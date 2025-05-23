import './App.css';
import MenuAppBar from './components/Commom/MenuAppBar';
import Analyse from './components/MainFlow/Analyse';

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
    </div>
  );
}

export default App;
