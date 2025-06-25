/**
 * Componente ElemDrawManager
 * Gerencia a criação de formas desenhadas no mapa do Google Maps, escuta eventos de desenho
 * e interage com InfoWindows para personalização visual das formas.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {google.maps.Map} props.map - Instância do mapa Google Maps onde os desenhos ocorrerão.
 * @returns {null} Componente não renderiza elementos visuais diretamente.
 */

import { useEffect } from "react";
import {
  findAllPointsInRectangle,
  findAllPointsInPolygon,
  findAllPointsInCircle,
} from "../../../services/geolocation";
import {
  calculateCircleArea,
  calculatePolygonArea,
  calculatePolylineLength,
  calculateRectangleArea,
} from "../../../tools";
import { useData } from "../../../hooks/analyse-hooks";
import HTMLDrawInfoContent from "./infowindow/html-draw-infowindow-content";
import { ElemDrawInfoWindow } from "./infowindow/ElemDrawInfoWindow";

/**
 * Gerencia o desenho de formas no mapa e a interação com InfoWindows.
 *
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {google.maps.Map} props.map - Instância do Google Maps.
 * @returns {null}
 */
const ElemDrawManager = ({ map }) => {
  // Hooks customizados para manipular marcadores e shapes
  const { setMarker, setOverlays, overlays } = useData();

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    /**
     * Inicializa o DrawingManager do Google Maps.
     * Permite desenhar marcadores, círculos, polígonos, retângulos e linhas.
     * @type {google.maps.drawing.DrawingManager}
     */
    const draw = new window.google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          window.google.maps.drawing.OverlayType.MARKER,
          window.google.maps.drawing.OverlayType.CIRCLE,
          window.google.maps.drawing.OverlayType.POLYGON,
          window.google.maps.drawing.OverlayType.RECTANGLE,
          window.google.maps.drawing.OverlayType.POLYLINE,
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
        clickable: true,
      },
      rectangleOptions: {
        strokeColor: "#ff0000",
        editable: true,
        clickable: true,
      },
      polylineOptions: {
        strokeColor: "#ff0000",
        editable: true,
        clickable: true,
      },
    });

    /** @type {google.maps.Marker | undefined} */
    let marker;
    /** @type {google.maps.InfoWindow | null} */
    let currentInfoWindow = null;

    /**
     * Abre o InfoWindow customizado para uma shape.
     * @param {Object} shape - Objeto da shape desenhada.
     * @param {google.maps.LatLng | Object} position - Posição para abrir o InfoWindow.
     */
    const openInfoWindow = (shape, position) => {
      // Fecha todos os InfoWindows abertos
      window.dispatchEvent(new Event("close-all-infowindows"));

      if (currentInfoWindow) currentInfoWindow.close();

      // Cria o conteúdo customizado
      const content = HTMLDrawInfoContent(shape);
      const infoWindow = new window.google.maps.InfoWindow({
        content,
        position,
      });
      infoWindow.open(map);

      // Conecta os controles do InfoWindow à shape
      setTimeout(() => {
        ElemDrawInfoWindow(shape, setOverlays, content);
      }, 0);

      shape.infoWindow = infoWindow;
      currentInfoWindow = infoWindow;
    };

    /**
     * Adiciona listener de clique à shape desenhada para abrir o InfoWindow.
     * @param {Object} shapeObj - Objeto da shape.
     */
    const addClickListenerToShape = (shapeObj) => {
      const overlay = shapeObj.draw;
      if (!overlay) return;

      // Remove listener antigo, se existir
      if (shapeObj.listenerClick) {
        window.google.maps.event.removeListener(shapeObj.listenerClick);
      }

      // Adiciona novo listener
      shapeObj.listenerClick = window.google.maps.event.addListener(
        overlay,
        "click",
        (event) => {
          openInfoWindow(shapeObj, event.latLng);
        }
      );
    };

    /**
     * Handler para evento de desenho completo no mapa.
     * Cria objeto shape, calcula área/posição e adiciona ao estado global.
     */
    window.google.maps.event.addListener(
      draw,
      "overlaycomplete",
      async function (event) {
        const overlay = event.overlay;
        const type = event.type;

        // Se for marcador, salva coordenadas e remove do mapa (controle externo)
        if (type === "marker") {
          if (marker) marker.setMap(null);
          marker = overlay;
          const position = marker.position;
          marker.setMap(null);
          setMarker((prev) => ({
            ...prev,
            int_latitude: position.lat(),
            int_longitude: position.lng(),
          }));
          return;
        }

        /**
         * Objeto base da shape desenhada.
         * @type {Object}
         */
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
        if (type === "circle") {
          const center = overlay.getCenter();
          const radius = overlay.getRadius();
          shape.position = center.toJSON();
          shape.radius = radius;
          shape.area = calculateCircleArea(radius);
          shape.markers = await findAllPointsInCircle({
            center: shape.position,
            radius: parseInt(radius),
          });
        }

        // === Polígono ===
        if (type === "polygon") {
          const serverPolygon = overlay
            .getPath()
            .getArray()
            .map((p) => [p.lng(), p.lat()]);
          const paths = overlay.getPaths();
          let lat = null,
            lng = null;

          // Encontra o ponto mais ao norte do polígono
          paths.forEach((path) => {
            path.forEach((point) => {
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
          shape.markers = await findAllPointsInPolygon([
            ...serverPolygon,
            serverPolygon[0],
          ]);
        }

        // === Retângulo ===
        if (type === "rectangle") {
          const bounds = overlay.getBounds();
          const NE = bounds.getNorthEast();
          const SW = bounds.getSouthWest();
          shape.NE = NE;
          shape.SW = SW;
          shape.position = NE.toJSON();
          shape.area = calculateRectangleArea(bounds);
          shape.markers = await findAllPointsInRectangle(
            SW.lng(),
            SW.lat(),
            NE.lng(),
            NE.lat()
          );
        }

        // === Linha (Polyline) ===
        if (type === "polyline") {
          const path = overlay.getPath();
          const lastPoint = path.getAt(path.getLength() - 1);
          shape.position = lastPoint.toJSON();
          shape.meters = calculatePolylineLength(overlay);
          shape.markers = {
            subterranea: [],
            superficial: [],
            barragem: [],
            lancamento_efluentes: [],
            lancamento_pluviais: [],
          };
        }

        // Adiciona listener de clique para abrir InfoWindow
        addClickListenerToShape(shape);

        // Adiciona shape ao estado global
        setOverlays((prev) => ({
          ...prev,
          shapes: [...prev.shapes, shape],
        }));
      }
    );

    // Adiciona DrawingManager ao mapa
    draw.setMap(map);

    // Cleanup: remove barra de ferramentas e listeners ao desmontar
    return () => {
      draw.setMap(null);
      window.google.maps.event.clearInstanceListeners(draw);
    };
  }, [map]); // Apenas map como dependência

  return null;
};

export default ElemDrawManager;
