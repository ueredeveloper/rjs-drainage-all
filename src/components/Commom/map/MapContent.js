import React, { useEffect, useState } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import { Box } from '@mui/material';
import ElemMap from './ElemMap';
import ElemDrawManager from './ElemDrawManager';
import ElemMarker from './ElemMarker';
import ElemPopupOverlay from './ElemPopupOverlay';
import ElemPolygon from './ElemPolygon';
import { useData } from '../../../hooks/analyse-hooks';
import ElemPolyline from './ElemPolyline';

/**
 * Componente que representa o conteúdo do mapa.
 * @component
 * @param {Object} props - As propriedades do componente.
 * @param {boolean} props.checkBoxState - O estado das caixas de seleção.
 * @returns {JSX.Element} O componente de conteúdo do mapa.
 */
function MapContent({ checkBoxState }) {
  // Estados do componente
  const [mode] = useState('light');

  // Obtém os estados do contexto de análise
  const { map, setMap, marker, overlays, setOverlays, shapesFetched } = useData();

  /**
     * Função para converter um nome de dado em um nome de forma.
     * @param {string} dataName - O nome do dado.
     * @returns {string} O nome da forma correspondente.
     */
  function convertToShapeName(dataName) {
    switch (dataName) {
      case 'Subterrâneas':
        return 'subterranea';
      case 'Superficiais':
        return 'superficial';
      case 'Pluviais':
        return 'lancamento_pluviais';
      case 'Efluentes':
        return 'lancamento_efluentes';
      case 'Barragens':
        return 'barragem';
      default:
        return 'Desconhecido'
    }
  }

  const { selectedsCharts } = useData();

  // Estado para formas selecionadas. Renderizar marcadores de acordo com o que o usuário escolho no chart.
  const [selectedsShapes, setSelectedsShapes] = useState(['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem']);


  useEffect(() => {

    let keys = Object.keys(selectedsCharts)
    keys.forEach((key) => {
      let tableName = convertToShapeName(key);
      if (selectedsCharts[key] === true) {
        setSelectedsShapes(prev => {
          // Verifica se existe o nome selecionado, se existir retira
          const selecteds = prev.filter(s => s !== tableName)
          // Inclui o nome selecionado
          return [...selecteds, tableName]
        })
      } else {
        setSelectedsShapes(prev => {
          // Filtra para retirar nome não selecionado
          return [...prev.filter(prev => prev !== tableName)]
        })
      }
    });
  }, [selectedsCharts]);

  const RenderPolylines = (polylines) => {
    if (polylines[0].shape.type === 'MultiPolygon') {
      return polylines[0].shape.coordinates.map((coord, i) => {
        return coord.map((_coord, ii) => {
          return (<ElemPolyline key={ii} coord={_coord} map={map} />)
        })
      })
    }
    else {
      return polylines[0].shape.coordinates.map((coord, i) => {
        return (<ElemPolyline key={i} coord={coord} map={map} />)
      })
    }
  }


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
            } else { return null }
          });
        })}

        {/* Renderização das sobreposições */}
        {overlays.shapes.map((shape, i) => {
          return <ElemPopupOverlay key={'popup-' + i} map={shape.map} position={shape.position} content={'conteudo'} draw={shape} />;
        })}

        {/* Renderização das shapes (Bacias Hidrográficas, Unidades Hidrográficas...) */}
        {shapesFetched.map((shape) => {
          return checkBoxState.map(cbState => {
            if (cbState.checked === true && cbState.name === shape.name) {
              return shape.shape.map((sh, ii) => {

                return <ElemPolygon key={'elem-polygon-' + ii} shape={sh} map={map} setOverlays={setOverlays} />;
              });
            }
          });
        })}
        {overlays.shapes.map(sh => {
          if (sh.markers.hidrogeo !== undefined) {
            return RenderPolylines(sh.markers.hidrogeo)
          }
        })}

      </Wrapper>
    </Box>
  );
}

export default MapContent;
