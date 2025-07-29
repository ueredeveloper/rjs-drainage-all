import ReactDOM from "react-dom/client";
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
import InfoWindowContent from "./infowindow/InfoWindowContent";

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

    let marker;
    let currentInfoWindow = null;

    /**
     * Abre o InfoWindow customizado para uma shape.
     */
    const openInfoWindow = (shape, position) => {
      window.dispatchEvent(new Event("close-all-infowindows"));
      if (currentInfoWindow) currentInfoWindow.close();

      setOverlays((prev) => ({
        ...prev,
        shapes: prev.shapes.map((s) =>
          s.id === shape.id ? { ...s, calculoAreaAtivo: false } : s
        ),
      }));

      const container = document.createElement("div");
      const root = ReactDOM.createRoot(container);
      root.render(
        <InfoWindowContent
          shape={{ ...shape, calculoAreaAtivo: false }}
          setOverlays={setOverlays}
        />
      );

      const infoWindow = new window.google.maps.InfoWindow({
        content: container,
        position,
      });

      infoWindow.open(map);
      shape.infoWindow = infoWindow;
      currentInfoWindow = infoWindow;
    };

    /**
     * Adiciona listener de clique à shape desenhada para abrir o InfoWindow.
     */
    const addClickListenerToShape = (shapeObj) => {
      const overlay = shapeObj.draw;
      if (!overlay) return;

      if (shapeObj.listenerClick) {
        window.google.maps.event.removeListener(shapeObj.listenerClick);
      }

      shapeObj.listenerClick = window.google.maps.event.addListener(
        overlay,
        "click",
        () => {
          // Sempre usar shapeObj.position (ponto norte do círculo, topo do retângulo, latitude máxima do polígono)
          openInfoWindow(shapeObj, shapeObj.position);
        }
      );
    };

    // Handler de desenho completo
    window.google.maps.event.addListener(
      draw,
      "overlaycomplete",
      async function (event) {
        const overlay = event.overlay;
        const type = event.type;

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

        // --- Aqui está o ajuste para o círculo! ---
        if (type === "circle") {
          const center = overlay.getCenter();
          const radius = overlay.getRadius();
          const bounds = overlay.getBounds();
          const latNorth = bounds.getNorthEast().lat(); // topo do círculo
          const lngCenter = center.lng();

          // Para popup, use o ponto norte (não altera o centro do círculo real!)
          shape.position = { lat: latNorth, lng: lngCenter };

          shape.radius = radius;
          shape.area = calculateCircleArea(radius);
          // Para encontrar marcadores, use o centro real do círculo!
          shape.markers = await findAllPointsInCircle({
            center: { lat: center.lat(), lng: center.lng() }, // não use shape.position aqui!
            radius: parseInt(radius),
          });
        }

        // Polígono: ponto latitude máxima
        if (type === "polygon") {
          const serverPolygon = overlay
            .getPath()
            .getArray()
            .map((p) => [p.lng(), p.lat()]);
          const paths = overlay.getPaths();
          let lat = null,
            lng = null;
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

        // Retângulo: use canto NE (topo direito)
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

        // Polyline
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

        setOverlays((prev) => ({
          ...prev,
          shapes: [...prev.shapes, shape],
        }));
      }
    );

    draw.setMap(map);

    // Cleanup
    return () => {
      draw.setMap(null);
      window.google.maps.event.clearInstanceListeners(draw);
    };
  }, [map]);

  return null;
};

export default ElemDrawManager;
