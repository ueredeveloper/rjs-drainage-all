/**
 * Módulo analyse-hooks.js
 * 
 * Este módulo define o contexto de dados compartilhados para gerenciar o estado de hooks como 'selectedsCharts'.
 * Ele fornece o DataProvider para envolver a aplicação e o hook useData para acessar o estado.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialsStates } from '../initials-states';

// Criação de um contexto para o estado compartilhado
const DataContext = createContext();

/**
 * Módulo que fornece o estados utilizados no component Analyse.js.
 * @module
 * @param {Object} props - Propriedades do componente.
 * @param {ReactNode} props.children - Os componentes filhos que terão acesso ao estado compartilhado.
 */
export const DataProvider = ({ children }) => {
  // Inicializa o estado 'selectedsCharts' com valores padrão
  const [selectedsCharts, setSelectedsCharts] = useState(initialsStates.selectedsCharts);
  // inicialização do mapa
  const [map, setMap] = useState();

  // Estado para o marcador inicial
  const [marker, setMarker] = useState(initialsStates.marker);

  // Estado para sobreposições (polígonos, círculos etc).
  const [overlays, setOverlays] = useState(initialsStates.overlays);

  // Estado para o sistema fraturado e poroso
  const [subsystem, setSubsystem] = useState(initialsStates.subsystem);

  /*Shapes (polígonos) buscados no servidor (Bacias Hidrográficas, Unidades Hidrográficas...) e que ficarão guardados
  em um hooks para utilização sem precisar buscar novamente.
  */
  const [shapesFetched, setShapesFetched] = useState([]);

  const [radius, setRadius] = useState(600);

  const [hgAnalyse, setHgAnalyse] = useState({
    "basinName": "",
    "uhNameLabel": "",
    "uhName": "",
    "subsystem": "",
    "codPlan": "",
    "qExploitable": 10,
    "numberOfPoints": 15,
    "qTotalAnnual": 20,
    "qPointsPercentage": 30,
    "volAvaiable": 40
})


  // atualiza a posição do marcador no mapa
  useEffect(() => {
    if (map) {
      let latLng = { lat: parseFloat(marker.int_latitude), lng: parseFloat(marker.int_longitude) }
      map.setCenter(latLng)
    }
  }, [marker])

  return (
    // Fornece o estado 'selectedsCharts' para os componentes filhos
    <DataContext.Provider value={{
      selectedsCharts, setSelectedsCharts,
      map, setMap,
      marker, setMarker,
      subsystem, setSubsystem,
      overlays, setOverlays,
      shapesFetched, setShapesFetched,
      radius, setRadius,
      hgAnalyse, setHgAnalyse
    }}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * Hook useData
 * 
 * Um hook personalizado para acessar o estado 'selectedsCharts' a partir do contexto.
 * 
 * @returns {Object} Um objeto que contém o estado 'selectedsCharts' e a função 'setSelectedsCharts'.
 */
export const useData = () => useContext(DataContext);

