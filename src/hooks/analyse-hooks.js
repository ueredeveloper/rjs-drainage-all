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
 * @function DataProvider
 * @description
 * Componente responsável por fornecer variáveis de contexto global da análise (Analyse.js).
 * Ele encapsula os filhos com `DataContext.Provider`, tornando
 * o estado compartilhado acessível por toda a árvore de componentes.
 * 
 * @param {Object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Componentes filhos que terão acesso ao contexto.
 * @returns {JSX.Element} O componente provider encapsulando os filhos.
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

  // Estado das bacias otto
  const [ottoBasins, setOttoBasins] = useState(initialsStates.ottoBasins);

  const [surfaceAnalyse, setSurfaceAnalyse] = useState(initialsStates.surfaceAnalyse)

  // Especifica o tipo de poço (TpId), onde 1 representa Poço Manual/Tubular Raso e 2 representa Poço Tubular Profundo.
  const [tpId, setTpId] = useState(1);


  /*Shapes (polígonos) buscados no servidor (Bacias Hidrográficas, Unidades Hidrográficas...) e que ficarão guardados
  em um hooks para utilização sem precisar buscar novamente.
  */
  const [overlaysFetched, setOverlaysFetched] = useState(new Set());

  const [radius, setRadius] = useState(600);

  const [hgAnalyse, setHgAnalyse] = useState({
    "uh": "",
    "sistema": "",
    "cod_plan": "",
    "q_ex": 0,
    "n_points": 0,
    "q_points": 0,
    "q_points_per": 0,
    "vol_avaiable": 0
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
      overlaysFetched, setOverlaysFetched,
      radius, setRadius,
      hgAnalyse, setHgAnalyse,
      tpId, setTpId,
      ottoBasins, setOttoBasins,
      surfaceAnalyse, setSurfaceAnalyse
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

