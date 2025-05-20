import { useEffect } from 'react';
import { findAllPointsInRectangle, findAllPointsInPolygon, findAllPointsInCircle } from '../../../services/geolocation';
import { calculateCircleArea, calculatePolygonArea, calculatePolylineLength, calculateRectangleArea } from '../../../tools';
import { useData } from '../../../hooks/analyse-hooks';
import { getDrawInfoWindowHtmlWithState, attachDrawInfoListeners } from './infowindow/ElemDrawInfoWindow';

const ElemDrawManager = ({ map }) => {
  const { setMarker, setOverlays } = useData();

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
      polygonOptions: { strokeColor: "#ff0000", editable: true, clickable: true },
      rectangleOptions: { strokeColor: "#ff0000", editable: true, clickable: true },
      polylineOptions: { strokeColor: "#ff0000", editable: true, clickable: true }
    });

    let marker;
    let currentInfoWindow = null;

    const openInfoWindow = (shape, position) => {
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }

      const content = getDrawInfoWindowHtmlWithState(shape);

      const infoWindow = new window.google.maps.InfoWindow({
        content,
        position,
      });

      window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        attachDrawInfoListeners(shape);
      });

      infoWindow.open(map);

      shape.infoWindow = infoWindow;
      currentInfoWindow = infoWindow;
    };

    const addClickListenerToShape = (shapeObj) => {
      const overlay = shapeObj.draw;
      if (!overlay) return;

      if (shapeObj.listenerClick) {
        window.google.maps.event.removeListener(shapeObj.listenerClick);
      }

      shapeObj.listenerClick = window.google.maps.event.addListener(overlay, 'click', (event) => {
        console.log('Shape clicada, abrindo InfoWindow em', event.latLng.toString());
        openInfoWindow(overlay, event.latLng);
      });
    };

    window.google.maps.event.addListener(draw, 'overlaycomplete', async function (event) {
      const overlay = event.overlay;
      const type = event.type;

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

      let shape = {
        id: Date.now(),
        type,
        map,
        draw: overlay,
        position: null,
        area: null,
        meters: null,
        markers: [],
      };

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

      if (type === 'polygon') {
        const serverPolygon = overlay.getPath().getArray().map(p => [p.lng(), p.lat()]);
        const paths = overlay.getPaths();
        let lat = null, lng = null;

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

      addClickListenerToShape(shape);

      openInfoWindow(overlay, shape.position);

      setOverlays(prev => ({
        ...prev,
        shapes: [...prev.shapes, shape]
      }));
    });

    draw.setMap(map);

    return () => {
      window.google.maps.event.clearInstanceListeners(draw);
    };
  }, [map, setMarker, setOverlays]);

  return null;
};

export default ElemDrawManager;
