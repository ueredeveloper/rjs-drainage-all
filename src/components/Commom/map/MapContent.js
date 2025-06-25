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
 * Formata um valor numérico para string com casas decimais seguras.
 * @param {any} val - Valor a ser convertido.
 * @param {number} [decimals=2] - Número de casas decimais.
 * @returns {string} Valor formatado.
 */
function safeNumber(val, decimals = 2) {
  const num = Number(val);
  if (isNaN(num) || typeof num !== 'number' || !isFinite(num)) return '0.00';
  return num.toFixed(decimals);
}

/**
 * Gera o conteúdo do popup de cálculo de área/comprimento para cada tipo de shape.
 * @param {Object} draw - Objeto da shape desenhada.
 * @returns {string} Texto formatado para o popup.
 */
function setContent(draw) {
  if (!draw) return '';
  if (draw.type === 'polygon' || draw.type === 'rectangle') {
    const areaM2 = safeNumber(draw.area, 2);
    const areaKm2 = safeNumber(Number(draw.area) / 1000000, 4);
    return `Área: ${areaM2} m² = ${areaKm2} km²`;
  }
  if (draw.type === 'circle') {
    const areaM2 = safeNumber(draw.area, 2);
    const areaKm2 = safeNumber(Number(draw.area) / 1000000, 4);
    const radius = safeNumber(draw.radius, 2);
    return `Área: ${areaM2} m² = ${areaKm2} km², Raio: ${radius} metros`;
  }
  if (draw.type === 'polyline') {
    const meters = safeNumber(draw.meters, 2);
    return `Comprimento: ${meters} metros`;
  }
  return '';
}

/**
 * Componente principal que renderiza o conteúdo do mapa, shapes, marcadores e popups.
 * Gerencia seleção de camadas, renderização condicional e integração com Google Maps.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.checkBoxState - Estado dos checkboxes para seleção de camadas.
 * @returns {JSX.Element}
 */
function MapContent({ checkBoxState }) {

  const [mode] = useState('light');

  // Hooks customizados para manipular estado global do mapa e shapes
  const { map, setMap, marker, overlays = { shapes: [] }, setOverlays, shapesFetched = [], selectedsCharts = {} } = useData();

  // Estado local para controlar quais tipos de shapes estão selecionados
  const [selectedsShapes, setSelectedsShapes] = useState([
    'subterranea',
    'superficial',
    'lancamento_pluviais',
    'lancamento_efluentes',
    'barragem'
  ]);

  /**
   * Converte o nome da camada para o nome interno usado nas shapes.
   * @param {string} dataName
   * @returns {string}
   */
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

  // Atualiza os tipos de shapes selecionados conforme os checkboxes
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

  /**
   * Renderiza polylines a partir dos dados de marcadores hidrogeológicos.
   * @param {Array} polylines
   * @returns {JSX.Element|null}
   */
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

  /**
   * Desativa o cálculo de área em todas as shapes desenhadas.
   */
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

  // Listener global para desmarcar cálculo de área ao abrir um InfoWindow
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

        {/* Renderização dos Popups de cálculo de área */}
        {Array.isArray(overlays.shapes) &&
          overlays.shapes.map(shape =>
            shape.calculoAreaAtivo && (
              <ElemPopupOverlay
                key={shape.id}
                map={map}
                position={shape.position}
                content={setContent(shape)}
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
