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
 *
 * @function safeNumber
 * @param {any} val - Valor a ser convertido para número.
 * @param {number} [decimals=2] - Número de casas decimais desejadas.
 * @returns {string} Valor formatado como string (ou '0.00' caso inválido).
 */
function safeNumber(val, decimals = 2) {
  const num = Number(val);
  if (isNaN(num) || typeof num !== 'number' || !isFinite(num)) return '0.00';
  return num.toFixed(decimals);
}

/**
 * Gera o conteúdo textual do popup de cálculo de área/comprimento
 * para cada tipo de shape desenhada.
 *
 * @function setContent
 * @param {Object} draw - Objeto da shape desenhada (polygon, circle, polyline, etc).
 * @returns {string} Texto formatado para exibir no popup.
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
 * Componente principal do conteúdo do mapa.
 *
 * Responsável por:
 * - Inicializar e renderizar o mapa do Google.
 * - Gerenciar marcadores, polígonos, polilinhas e overlays.
 * - Exibir popups de área e comprimento.
 * - Controlar renderização com base em checkboxes e gráficos selecionados.
 *
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Object} props.checkboxes - Estado das caixas de seleção agrupadas.
 * @param {Function} props.setCheckboxes - Função para atualizar estado dos checkboxes.
 * @returns {JSX.Element} O conteúdo renderizado do mapa.
 */
function MapContent({ checkboxes, setCheckboxes }) {
  /** @type {string} Modo do mapa (light/dark). */
  const [mode] = useState('light');

  /** @type {Array} Lista de popups ativos no mapa. */
  const [popups, setPopups] = useState([]);

  // Hook global que provê estados e setters relacionados ao mapa
  const { map, setMap, marker, setMarker, overlays, overlaysFetched } = useData();

  /** @type {number} Zoom atual do mapa. */
  const [zoom, setZoom] = useState(11);

  /** @type {boolean} Estado fullscreen do mapa. */
  const [isFullscreen, setIsFullscreen] = useState(false);

  /** @type {boolean} Indica se há disponibilidade de água marcada nos checkboxes. */
  const [isWaterAvailable, setIsWaterAvailable] = useState(false);

  /**
   * Efeito que reage às mudanças de checkboxes.
   * - Atualiza disponibilidade de água.
   * - Centraliza e dá zoom quando o usuário busca um endereço.
   */
  useEffect(() => {
    // Verifica checkboxes de disponibilidade de água
    setIsWaterAvailable(Object.values(checkboxes).flatMap(group =>
      Object.values(group).map(item => ({
        name: item.name,
        alias: item.alias,
        checked: item.checked,
        isWaterAvailable: item.isWaterAvailable
      }))
    ).some(item => item.isWaterAvailable === true));

    // Busca checkbox de endereços e centraliza o mapa
    let addressByPointCheckbox =
      Object.values(checkboxes)
        .flatMap(group => Object.values(group))
        .find(item => item.name === "enderecos_por_logradouro" && item.checked === true) || null;

    if (addressByPointCheckbox && map) {
      let center = addressByPointCheckbox.point;
      if (center) {
        map.setCenter(center);
        map.setZoom(19);

        // Atualiza marcador global
        setMarker(prev => ({
          ...prev,
          int_latitude: center.lat,
          int_longitude: center.lng
        }));
      }
    }
  }, [checkboxes]);

  /**
   * Converte um nome de dado (do backend) para nome interno de shape.
   *
   * @function convertToShapeName
   * @param {string} dataName - Nome do dado original.
   * @returns {string} Nome padronizado da shape.
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

  // Seleção de gráficos (estado global)
  const { selectedsCharts } = useData();

  /**
   * Lista de shapes selecionadas para renderização.
   * Inicialmente contém todas as opções.
   * @type {Array<string>}
   */
  const [selectedsShapes, setSelectedsShapes] = useState([
    'subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'
  ]);

  /**
   * Efeito que sincroniza as shapes com os gráficos selecionados.
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
   * Renderiza polilinhas genéricas (hidrogeo ou multipolygon).
   *
   * @function RenderPolylines
   * @param {Array} polylines - Estrutura de polilinhas.
   * @returns {JSX.Element|null} Elementos renderizados ou null.
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
      <Wrapper apiKey={""} libraries={["drawing", "geometry"]}>
        {/* Mapa principal */}
        <ElemMap mode={mode} map={map} setMap={setMap} zoom={zoom} setZoom={setZoom} setIsFullscreen={setIsFullscreen} />

        {/* Ferramentas de desenho de shapes */}
        <ElemDrawManager map={map} />

        {/* Marcador principal (ex: busca de endereço) */}
        <ElemMarker info={marker} map={map} />

        {/* Controles de overlay no mapa */}
        <ElemMapOverlayControls
          map={map}
          position={"BOTTOM_CENTER"}
          isFullscreen={isFullscreen}
          isWaterAvailable={isWaterAvailable}
          checkboxes={checkboxes}
          setCheckboxes={setCheckboxes}
        />

        {/* Marcadores de acordo com shapes selecionadas */}
        {Array.isArray(overlays.shapes) && overlays.shapes.map(shape =>
          selectedsShapes.map(type =>
            shape.markers?.[type]?.map((marker, i) => (
              <ElemMarker key={'marker-' + i} info={marker} map={map} />
            ))
          )
        )}

        {/* Popups de área/comprimento em shapes desenhadas */}
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

        {/* Renderização de shapes a partir de checkboxes */}
        {Array.isArray(Array.from(overlaysFetched)) && Array.from(overlaysFetched).map((shape) => {
          let listCheckBoxes = Object.values(checkboxes).flatMap(group =>
            Object.values(group).map(item => ({
              name: item.name,
              alias: item.alias,
              checked: item.checked,
              isWaterAvailable: item.isWaterAvailable
            }))
          );

          return listCheckBoxes.map(cbState => {
            if ((cbState.checked === true && cbState.name === shape.name) ||
                (cbState.checked === true && shape.name.startsWith(cbState.name))) {
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
          if (sh.name !== undefined && sh.name === 'otto-bacias') {
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
