/**
 * Componente ElemDrawManager
 * Gerencia a criação de formas desenhadas no mapa do Google Maps, escuta eventos de desenho
 * e interage com InfoWindows para personalização visual das formas.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {google.maps.Map} props.map - Instância do mapa Google Maps onde os desenhos ocorrerão.
 * @returns {null} Componente não renderiza elementos visuais diretamente.
 */

import { useEffect } from 'react';
import {
  findAllPointsInRectangle,
  findAllPointsInPolygon,
  findAllPointsInCircle
} from '../../../services/geolocation';
import {
  calculateCircleArea,
  calculatePolygonArea,
  calculatePolylineLength,
  calculateRectangleArea
} from '../../../tools';
import { useData } from '../../../hooks/analyse-hooks';
import {
  getDrawInfoWindowHtmlWithState,
  attachDrawInfoListeners
} from './infowindow/ElemDrawInfoWindow';

const ElemDrawManager = ({ map }) => {
  const { setMarker, setOverlays, overlays } = useData();

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    // === Inicializa o DrawingManager com opções de estilo e modos de desenho disponíveis ===
    const draw = new window.google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          window.google.maps.drawing.OverlayType.MARKER,
          window.google.maps.drawing.OverlayType.CIRCLE,
          window.google.maps.drawing.OverlayType.POLYGON,
          window.google.maps.drawing.OverlayType.RECTANGLE,
          window.google.maps.drawing.OverlayType.POLYLINE
        ],
      },
      circleOptions: {
        fillColor: "#ffff00",
        fillOpacity: 0.2,
        strokeColor: "#ff0000",
        strokeWeight: 1,
        clickable: true,
        editable: true,
        zIndex: 1,
      },
      polygonOptions: {
        strokeColor: "#ff0000",
        editable: true,
        clickable: true
      },
      rectangleOptions: {
        strokeColor: "#ff0000",
        editable: true,
        clickable: true
      },
      polylineOptions: {
        strokeColor: "#ff0000",
        editable: true,
        clickable: true
      }
    });

    let marker;
    let currentInfoWindow = null;

    /**
     * Abre o InfoWindow customizado para a shape clicada ou recém-criada
     * @param {Object} shape - Objeto shape do estado, contendo .draw (overlay do Google Maps)
     * @param {google.maps.LatLng|Object} position - A posição onde o InfoWindow será exibido.
     */
    const openInfoWindow = (shape, position) => {
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }

      // Busca o shape atualizado do estado global, se existir
      let shapeAtual = shape;
      if (overlays && overlays.shapes) {
        const found = overlays.shapes.find(s => s.id === shape.id);
        if (found) shapeAtual = found;
      }

      const content = getDrawInfoWindowHtmlWithState(shapeAtual);
      const infoWindow = new window.google.maps.InfoWindow({
        content,
        position,
      });

      // Espera o DOM estar pronto para adicionar listeners nos botões e sliders do InfoWindow
      window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        attachDrawInfoListeners(shapeAtual, setOverlays);
      });

      infoWindow.open(map);
      shape.infoWindow = infoWindow;
      currentInfoWindow = infoWindow;
    };

    /**
     * Adiciona listener de clique a uma shape para abrir o InfoWindow personalizado
     * @param {Object} shapeObj - Objeto contendo dados da shape, incluindo a instância desenhada.
     */
    const addClickListenerToShape = (shapeObj) => {
      const overlay = shapeObj.draw;
      if (!overlay) return;

      // Remove listener anterior, se houver
      if (shapeObj.listenerClick) {
        window.google.maps.event.removeListener(shapeObj.listenerClick);
      }

      shapeObj.listenerClick = window.google.maps.event.addListener(overlay, 'click', (event) => {
        openInfoWindow(shapeObj, event.latLng);
      });
    };

    /**
     * Handler para quando uma forma é desenhada no mapa
     */
    window.google.maps.event.addListener(draw, 'overlaycomplete', async function (event) {
      const overlay = event.overlay;
      const type = event.type;

      // Se for marcador, salva coordenadas e remove do mapa (controle externo)
      if (type === 'marker') {
        if (marker) marker.setMap(null);
        marker = overlay;
        const position = marker.position;
        marker.setMap(null);
        setMarker(prev => ({
          ...prev,
          int_latitude: position.lat(),
          int_longitude: position.lng()
        }));
        return;
      }

      // Define objeto shape base
      let shape = {
        id: Date.now(),
        type,
        map,
        draw: overlay,
        position: null,
        area: null,
        meters: null,
        markers: [],
        calculoAreaAtivo: true,
      };

      // === Círculo ===
      if (type === 'circle') {
        const center = overlay.getCenter();
        const radius = overlay.getRadius();
        shape.position = center.toJSON();
        shape.radius = radius;
        shape.area = calculateCircleArea(radius);
        shape.markers = await findAllPointsInCircle({
          center: shape.position,
          radius: parseInt(radius)
        });
      }

      // === Polígono ===
      if (type === 'polygon') {
        const serverPolygon = overlay.getPath().getArray().map(p => [p.lng(), p.lat()]);
        const paths = overlay.getPaths();
        let lat = null, lng = null;

        // Busca a coordenada mais ao norte para posicionar o InfoWindow
        paths.forEach(path => {
          path.forEach(point => {
            const latitude = point.lat();
            const longitude = point.lng();
            if (lat === null || latitude > lat) {
              lat = latitude;
              lng = longitude;
            }
          });
        });

        shape.position = { lat, lng };
        shape.area = calculatePolygonArea(overlay);
        shape.markers = await findAllPointsInPolygon([...serverPolygon, serverPolygon[0]]);
      }

      // === Retângulo ===
      if (type === 'rectangle') {
        const bounds = overlay.getBounds();
        const NE = bounds.getNorthEast();
        const SW = bounds.getSouthWest();
        shape.NE = NE;
        shape.SW = SW;
        shape.position = NE.toJSON();
        shape.area = calculateRectangleArea(bounds);
        shape.markers = await findAllPointsInRectangle(SW.lng(), SW.lat(), NE.lng(), NE.lat());
      }

      // === Linha (Polyline) ===
      if (type === 'polyline') {
        const path = overlay.getPath();
        const lastPoint = path.getAt(path.getLength() - 1);
        shape.position = lastPoint.toJSON();
        shape.meters = calculatePolylineLength(overlay);
        shape.markers = {
          subterranea: [],
          superficial: [],
          barragem: [],
          lancamento_efluentes: [],
          lancamento_pluviais: []
        };
      }

      // Adiciona clique para abrir InfoWindow no futuro
      addClickListenerToShape(shape);

      // Armazena nova shape no estado global
      setOverlays(prev => ({
        ...prev,
        shapes: [...prev.shapes, shape]
      }));

      // Abre o InfoWindow imediatamente após desenhar
      openInfoWindow(shape, shape.position);
    });

    draw.setMap(map);

    return () => {
      // Remove todos os listeners ao desmontar componente
      window.google.maps.event.clearInstanceListeners(draw);
    };
  }, [map, setMarker, setOverlays, overlays]);

  return null;
};

export default ElemDrawManager;