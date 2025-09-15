import { useEffect, useState } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import { Box } from '@mui/material';
import ElemMap from './ElemMap';
import ElemDrawManager from './ElemDrawManager';
import ElemMarker from './ElemMarker';
import ElemPopupOverlay from './ElemPopupOverlay';
import ElemPolygon from './ElemPolygon';
import { useData } from '../../../hooks/analyse-hooks';
import ElemPolyline from './ElemPolyline';
import ElemOttoPolyline from './ElemOthoPolyline';
import ElemMapOverlayControls from './ElemMapOverlayControls';
import ElemSupplyPolyline from './ElemSupplyPolyline';

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
 * Componente que representa o conteúdo do mapa.
 * Gerencia a renderização de marcadores, polígonos, polilinhas, popups e overlays
 * de acordo com o estado global e as opções selecionadas pelo usuário.
 *
 * @component
 * @param {Object} props - As propriedades do componente.
 * @param {Object} props.checkboxes - O estado das caixas de seleção agrupadas.
 * @param {Function} props.setCheckboxes - Função para atualizar o estado dos checkboxes.
 * @returns {JSX.Element} O componente de conteúdo do mapa.
 */
function MapContent({ checkboxes, setCheckboxes }) {
  /** @type {string} Modo do mapa (ex: 'light') */
  const [mode] = useState('light');
  /** @type {Array} Estado dos popups ativos */
  const [popups, setPopups] = useState([]);

  // Obtém os estados do contexto de análise
  const { map, setMap, marker, overlays, setOverlays, overlaysFetched } = useData();

  const [zoom, setZoom] = useState(11);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isWaterAvailable, setIsWaterAvailable] = useState(false)

  useEffect(() => {

    // Busca nos checkboxes se foi solicitado disponibilidade de água nos subsistemas
    setIsWaterAvailable(Object.values(checkboxes).flatMap(group =>
      Object.values(group).map(item => ({
        name: item.name,
        alias: item.alias,
        checked: item.checked,
        isWaterAvailable: item.isWaterAvailable
      }))
    ).some(item => item.isWaterAvailable === true))

  }, [checkboxes])



  /**
   * Converte o nome de um dado para o nome da shape correspondente.
   * @param {string} dataName - Nome do dado.
   * @returns {string} Nome da shape.
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

  // Estados do contexto para seleção de gráficos
  const { selectedsCharts } = useData();

  /**
   * Estado das shapes selecionadas para renderização de marcadores.
   * Inicialmente inclui todas as opções.
   * @type {Array<string>}
   */
  const [selectedsShapes, setSelectedsShapes] = useState([
    'subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'
  ]);

  /**
   * Atualiza as shapes selecionadas conforme o estado dos gráficos selecionados.
   */
  useEffect(() => {
    let keys = Object.keys(selectedsCharts);
    keys.forEach((key) => {
      let tableName = convertToShapeName(key);
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
   * Renderiza polilinhas a partir de uma estrutura de dados de polilinhas.
   * Suporta MultiPolygon e LineString.
   * @param {Array} polylines - Array de polilinhas.
   * @returns {JSX.Element|null} Elementos de polilinha ou null.
   */
  const RenderPolylines = (polylines) => {
    if (!Array.isArray(polylines) || polylines.length === 0) return null;
    if (polylines[0].shape.type === 'MultiPolygon') {
      return polylines[0].shape.coordinates.map((coord, i) =>
        coord.map((coord, index) => (
          <ElemPolyline key={index} coord={coord} map={map} zoom={zoom} />
        ))
      );
    } else {
      return polylines[0].shape.coordinates.map((coord, i) => (
        <ElemPolyline key={i} coord={coord} map={map} zoom={zoom} />
      ));
    }
  };

  return (
    <Box id="map-box" sx={{ height: '100%', width: '100%' }}>

      <Wrapper apiKey={"AIzaSyDELUXEV5kZ2MNn47NVRgCcDX-96Vtyj0w"} libraries={["drawing", "geometry"]}>
        {/* Componentes relacionados ao mapa */}
        <ElemMap mode={mode} map={map} setMap={setMap} zoom={zoom} setZoom={setZoom} setIsFullscreen={setIsFullscreen} />
        {/* Gerenciador de desenho de shapes */}
        <ElemDrawManager map={map} />
        {/* Marcador principal (ex: marcador de busca) */}
        <ElemMarker info={marker} map={map} />

        <ElemMapOverlayControls map={map} position={"BOTTOM_CENTER"} isFullscreen={isFullscreen} isWaterAvailable={isWaterAvailable} checkboxes={checkboxes} setCheckboxes={setCheckboxes} />

        {/* Renderização dos marcadores de acordo com as shapes selecionadas */}
        {Array.isArray(overlays.shapes) && overlays.shapes.map(shape =>
          selectedsShapes.map(type =>
            shape.markers?.[type]?.map((marker, i) => (
              <ElemMarker key={'marker-' + i} info={marker} map={map} />
            ))
          )
        )}

        {/* Popups de cálculo de área/comprimento para shapes desenhadas */}
        {Array.isArray(overlays.shapes) &&
          overlays.shapes.map((shape, i) =>
            shape.calculoAreaAtivo && (
              <ElemPopupOverlay
                key={shape.id || `popup-${i}`}
                map={map}
                position={shape.position}
                content={setContent(shape)}
                draw={shape}
                setPopups={setPopups}
              />
            )
          )
        }

        {/* Renderização de shapes (polígonos e linhas) conforme checkboxes marcados */}
        {Array.isArray(Array.from(overlaysFetched)) && Array.from(overlaysFetched).map((shape) => {
          // Transforma os checkboxes agrupados em uma lista simples
          let listCheckBoxes = Object.values(checkboxes).flatMap(group =>
            Object.values(group).map(item => ({
              name: item.name,
              alias: item.alias,
              checked: item.checked,
              isWaterAvailable: item.isWaterAvailable
            }))
          );

          // Para cada checkbox marcado, verifica se o nome bate com o shape
          return listCheckBoxes.map(cbState => {
            if ((cbState.checked === true && cbState.name === shape.name) || (cbState.checked === true && shape.name.startsWith(cbState.name))) {
              // Para cada geometria, renderiza polígono ou linha
              return shape.geometry.map((sh, ii) => {
                if (sh.geometry.type === 'LineString' && sh.shapeName.startsWith('caesb_df_')) {
                  return <ElemSupplyPolyline key={'elem-supply-polyline-' + ii} shape={sh} map={map} zoom={zoom} index={ii} />;
                }
                else if (sh.geometry.type === 'LineString') {
                  return <ElemPolyline key={'elem-polyline-' + ii} shape={sh} map={map} zoom={zoom} />;
                } else {
                  return <ElemPolygon key={'elem-polygon-' + ii} shape={sh} map={map} isWaterAvailable={cbState.isWaterAvailable} zoom={zoom} />;
                }
              });
            }
            return null;
          });
        })}

        {/* Renderização de polilinhas Otto e shapes hidrogeo */}
        {Array.isArray(overlays.shapes) && overlays.shapes.map(sh => {
          if (sh.name != undefined && sh.name === 'otto-bacias') {
            return sh.map((_sh, index) => (
              <ElemOttoPolyline key={`elem-otto-${index}`} geometry={_sh.geometry} map={map} zoom={zoom} />
            ));
          }
          if (sh.markers?.hidrogeo) {
            return RenderPolylines(sh.markers.hidrogeo);
          }
          return null;
        })}
      </Wrapper>
    </Box>
  );
}

export default MapContent;
