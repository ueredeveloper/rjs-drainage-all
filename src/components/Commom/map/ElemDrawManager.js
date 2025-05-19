import { useEffect } from 'react';
import { findAllPointsInRectangle, findAllPointsInPolygon, findAllPointsInCircle } from '../../../services/geolocation';
import { calculateCircleArea, calculatePolygonArea, calculatePolylineLength, calculateRectangleArea } from '../../../tools';

import { useData } from '../../../hooks/analyse-hooks';


/**
 * Componente para gerenciar a adição de formas geométricas no mapa (marcadores, círculos, polígonos, retângulos, polilinhas).
 * 
 * @component
 * @param {Object} map - Instância do mapa do Google Maps onde as formas serão desenhadas.
 * @param {function} setData - Função para adicionar objetos geométricos à variável `data`.
 */
const ElemDrawManager = ({ map }) => {

  const { setMarker, setOverlays } = useData();


  useEffect(() => {
    

    // Inicializa o DrawingManager do Google Maps para permitir o desenho de várias formas geométricas no mapa.
    let draw = new window.google.maps.drawing.DrawingManager({
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
        clickable: false,
        editable: true,
        zIndex: 1,
      },

      polygonOptions: {
        strokeColor: "#ff0000",
      },

      rectangleOptions: {
        strokeColor: "#ff0000",
      },

      polylineOptions: {
        strokeColor: "#ff0000",
      },

    });

    let marker;

    /**
     * Função de callback que é chamada quando o evento de desenho de uma forma é completado.
     * Dependendo do tipo de forma desenhada (marcador, círculo, polígono, retângulo, polilinha), 
     * as respectivas ações são realizadas, como cálculo da área ou comprimento e adição de formas no mapa.
     * 
     * @param {Object} event - O evento que contém a informação sobre o tipo de forma desenhada e as coordenadas.
     */
    window.google.maps.event.addListener(draw, 'overlaycomplete', async function (event) {

      if (event.type === 'marker') {
        // Caso seja um marcador, a posição do marcador é obtida e atualizada no estado global
        if (marker) {
          marker.setMap(null); // Remove o marcador anterior
        }
        marker = event.overlay;
        let position = marker.position;
        marker.setMap(null); // Remove o marcador do mapa temporariamente
        setMarker(prev => ({
          ...prev,
          int_latitude: position.lat(),
          int_longitude: position.lng()
        }));



      }

      if (event.type === 'circle') {
        // Caso seja um círculo, obtém a área e os pontos dentro do círculo
        let circle = event.overlay;
        
        const { center, radius } = circle;
        let bounds = circle.getBounds();
        var lat = bounds.getNorthEast().lat();
        var lng = circle.getCenter().lng();

        let markers = await findAllPointsInCircle({
          center: { lng: center.lng(), lat: center.lat() },
          radius: parseInt(radius)
        });

        let shape = {
          id: Date.now(),
          type: 'circle',
          position: { lat: lat, lng: lng },
          map: map,
          draw: event.overlay,
          markers: markers,
          radius: radius,
          area: calculateCircleArea(radius)
        };

        setOverlays(prev => ({
          ...prev,
          shapes: [...prev.shapes, shape]
        }));
        
      }

      if (event.type === 'polygon') {
        // Caso seja um polígono, obtém as coordenadas do polígono e busca os pontos dentro dele
        let polygon = event.overlay;
        let serverPolygon = [];
        polygon.getPath().getArray().forEach(p => {
          serverPolygon.push([p.lng(), p.lat()])
        });
        serverPolygon = [...serverPolygon, serverPolygon[0]];

        let paths = polygon.getPaths();
        let lat = null;
        let lng = null;

        // Itera para buscar a coordenada mais alta no polígono para que o infowindow fique sempre acima do polígono.
        paths.forEach(function (path) {
          path.forEach(function (point) {
            var latitude = point.lat();
            var longitude = point.lng();
            if (lat === null || latitude > lat) {
              lat = latitude;
              lng = longitude;
            }
          });
        });

        let shape = {
          id: Date.now(),
          type: 'polygon',
          position: { lat: lat, lng: lng },
          map: map,
          draw: event.overlay,
          markers: await findAllPointsInPolygon(serverPolygon),
          area: calculatePolygonArea(event.overlay)
        };

        console.log(shape)

        setOverlays(prev => ({
          ...prev,
          shapes: [...prev.shapes, shape]
        }));
      }

      if (event.type === 'rectangle') {
        // Caso seja um retângulo, obtém as coordenadas das extremidades e calcula a área
        let bounds = event.overlay.getBounds();
        let NE = bounds.getNorthEast();
        let SW = bounds.getSouthWest();
        let lat = NE.lat();
        let lng = NE.lng();

        let shape = {
          id: Date.now(),
          type: 'rectangle',
          position: { lat: lat, lng: lng },
          map: map,
          draw: event.overlay,
          NE: NE,
          SW: SW,
          area: calculateRectangleArea(event.overlay.getBounds()),
          markers: await findAllPointsInRectangle(SW.lng(), SW.lat(), NE.lng(), NE.lat())
        };

        setOverlays(prev => ({
          ...prev,
          shapes: [...prev.shapes, shape]
        }));
      }

      if (event.type === 'polyline') {
        // Caso seja uma polilinha, obtém o comprimento da linha desenhada
        let polyline = event.overlay;
        let path = polyline.getPath();
        var lastPointIndex = path.getLength() - 1;
        let lat = path.getAt(lastPointIndex).lat();
        let lng = path.getAt(lastPointIndex).lng();

        let shape = {
          id: Date.now(),
          type: 'polyline',
          position: { lat: lat, lng: lng },
          map: map,
          markers: {
            "subterranea": [],
            "superficial": [],
            "barragem": [],
            "lancamento_efluentes": [],
            "lancamento_pluviais": []
          },
          draw: polyline,
          meters: calculatePolylineLength(polyline)
        };

        setOverlays(prev => ({
          ...prev,
          shapes: [...prev.shapes, shape]
        }));
      }
    });

    draw.setMap(map); // Inicializa o DrawingManager no mapa

  }, [map]);

  return null;
};

export default ElemDrawManager;
