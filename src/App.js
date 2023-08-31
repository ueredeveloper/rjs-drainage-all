import logo from './logo.svg';
import './App.css';
import MenuAppBar from './components/Commom/MenuAppBar';
import Analyse from './components/MainFlow/Analyse'
import { useEffect, useState } from 'react';
import NumberOfGrantsChart from './components/Commom/e-chart.js/Number-Of-Grants-Chart';
import GeneralAnalysePanel from './components/MainFlow/General/GeneralAnalysePanel';

function App() {


  return (
    <div className="App">
      <MenuAppBar />
      <Analyse/>
    </div>
  );
}

export default App;
