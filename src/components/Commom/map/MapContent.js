import React, { useContext, useEffect, useState } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import { Box } from '@mui/material';
import ElemMap from './ElemMap';
import ElemDrawManager from './ElemDrawManager';
import { AnalyseContext } from '../../MainFlow/Analyse';
import ElemMarker from './ElemMarker';
import ElemPopupOverlay from './ElemPopupOverlay';
import ElemPolygon from './ElemPolygon';

/**
 * Componente que representa o conteúdo do mapa.
 *
 * @param {Object} props - As propriedades do componente.
 * @param {boolean} props.checkBoxState - O estado das caixas de seleção.
 * @returns {JSX.Element} O componente de conteúdo do mapa.
 */
function MapContent({ checkBoxState }) {
  // Estados do componente
  const [mode, setMode] = useState('light');
  const [map, setMap] = useState();

  // Obtém os estados do contexto de análise
  const [marker, setMarker, system, setSystem, overlays, setOverlays, shapesState, setShapesState, selectedsShapes] = useContext(AnalyseContext);
  
  /**
   * Manipulador para o fechamento da janela de informações do marcador.
   *
   * @param {Object} marker - O marcador associado à janela de informações.
   * @returns {void}
   */
  const handleInfoWindowClose = (marker) => {
    console.log('on close');
  };

  return (
    <Box id="map-box" sx={{ height: '100%', width: '100%' }}>
      <Wrapper apiKey={"AIzaSyDELUXEV5kZ2MNn47NVRgCcDX-96Vtyj0w"} libraries={["drawing"]}>
        {/* Componentes relacionados ao mapa */}
        <ElemMap mode={mode} map={map} setMap={setMap} zoom={10} />
        <ElemDrawManager map={map} />
        <ElemMarker
          info={marker}
          map={map}
        />

        {/* Renderização dos marcadores */}
        {overlays.shapes.map(shape => {
          return selectedsShapes.map(type => {
            if (shape.markers[type] !== null) {
              return shape.markers[type].map((marker, i) => {
                return <ElemMarker
                  key={'marker-' + i}
                  info={marker}
                  map={map}
                />;
              });
            } else {return null}
          });
        })}

        {/* Renderização das sobreposições */}
        {overlays.shapes.map((shape, i) => {
          return <ElemPopupOverlay key={'popup-' + i} map={shape.map} position={shape.position} content={'conteudo'} draw={shape} />;
        })}

        {/* Renderização dos polígonos */}
        {shapesState.map((shape) => {
          return checkBoxState.map(cbState => {
            if (cbState.checked === true && cbState.name === shape.name) {
              return shape.shape.map((sh, ii) => {

                return <ElemPolygon key={'elem-polygon-' + ii} shape={sh} map={map} setOverlays={setOverlays} />;
              });
            }
          });
        })}
      </Wrapper>
    </Box>
  );
}

export default MapContent;
