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

function MapContent({ checkBoxState }) {

  const [mode] = useState('light');

  const { map, setMap, marker, overlays = { shapes: [] }, setOverlays, shapesFetched = [], selectedsCharts = {} } = useData();

  const [selectedsShapes, setSelectedsShapes] = useState([
    'subterranea',
    'superficial',
    'lancamento_pluviais',
    'lancamento_efluentes',
    'barragem'
  ]);

  function convertToShapeName(dataName) {
    switch (dataName) {
      case 'Subterrâneas': return 'subterranea';
      case 'Superficiais': return 'superficial';
      case 'Pluviais': return 'lancamento_pluviais';
      case 'Efluentes': return 'lancamento_efluentes';
      case 'Barragens': return 'barragem';
      default: return 'Desconhecido';
    }
  }

  useEffect(() => {
    const keys = Object.keys(selectedsCharts);
    keys.forEach((key) => {
      const tableName = convertToShapeName(key);
      if (selectedsCharts[key] === true) {
        setSelectedsShapes(prev => {
          const selecteds = prev.filter(s => s !== tableName);
          return [...selecteds, tableName];
        });
      } else {
        setSelectedsShapes(prev => prev.filter(prev => prev !== tableName));
      }
    });
  }, [selectedsCharts]);

  const RenderPolylines = (polylines) => {
    if (!Array.isArray(polylines) || polylines.length === 0) return null;
    const poly = polylines[0];
    if (!poly?.shape?.coordinates) return null;

    if (poly.shape.type === 'MultiPolygon') {
      return poly.shape.coordinates.map((coord, i) =>
        coord.map((_coord, ii) => (
          <ElemPolyline key={`poly-${i}-${ii}`} coord={_coord} map={map} />
        ))
      );
    } else {
      return poly.shape.coordinates.map((coord, i) => (
        <ElemPolyline key={`poly-${i}`} coord={coord} map={map} />
      ));
    }
  };

  function desmarcarCalculoArea() {
    setOverlays(prev => ({
      ...prev,
      shapes: Array.isArray(prev.shapes)
        ? prev.shapes.map(s =>
          s.calculoAreaAtivo ? { ...s, calculoAreaAtivo: false } : s
        )
        : []
    }));
  }

  useEffect(() => {
    const handleInfoWindowOpen = () => {
      desmarcarCalculoArea();
    };
    window.addEventListener('infowindow-open', handleInfoWindowOpen);
    return () => {
      window.removeEventListener('infowindow-open', handleInfoWindowOpen);
    };
  }, []);

  return (
    <Box id="map-box" sx={{ height: '100%', width: '100%' }}>
      <Wrapper apiKey={"AIzaSyDELUXEV5kZ2MNn47NVRgCcDX-96Vtyj0w"} libraries={["drawing"]}>
        <ElemMap mode={mode} map={map} setMap={setMap} zoom={10} />
        <ElemDrawManager map={map} />
        <ElemMarker info={marker} map={map} />

        {/* Renderização dos Marcadores */}
        {Array.isArray(overlays.shapes) &&
          overlays.shapes.map(shape =>
            selectedsShapes.map(type =>
              Array.isArray(shape?.markers?.[type]) &&
              shape.markers[type].map((marker, i) => (
                <ElemMarker
                  key={`marker-${type}-${i}`}
                  info={marker}
                  map={map}
                />
              ))
            )
          )
        }

        {/* Renderização dos Popups */}
        {Array.isArray(overlays.shapes) &&
          overlays.shapes.map(shape =>
            shape.calculoAreaAtivo && (
              <ElemPopupOverlay
                key={shape.id}
                map={map}
                position={shape.position}
                content={'conteudo'}
                draw={shape}
              />
            )
          )
        }

        {/* Renderização das Shapes */}
        {Array.isArray(shapesFetched) &&
          shapesFetched.map(shape =>
            checkBoxState.map(cbState => {
              if (cbState.checked && cbState.name === shape.name) {
                return Array.isArray(shape.shape) &&
                  shape.shape.map((sh, ii) => (
                    <ElemPolygon
                      key={`elem-polygon-${shape.name}-${ii}`}
                      shape={sh}
                      map={map}
                      setOverlays={setOverlays}
                    />
                  ));
              }
              return null;
            })
          )
        }

        {/* Renderização das Polylines */}
        {Array.isArray(overlays.shapes) &&
          overlays.shapes.map(sh =>
            sh?.markers?.hidrogeo ? RenderPolylines(sh.markers.hidrogeo) : null
          )
        }
      </Wrapper>
    </Box>
  );
}

export default MapContent;
