import logo from './logo.svg';
import './App.css';
import MenuAppBar from './components/Commom/MenuAppBar';
import Analyse from './components/MainFlow/Analyse';

function App() {
  return (
    <div className="App">
      <MenuAppBar />
      <Analyse />
    </div>
  );
}

export default App;
