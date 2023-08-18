import { useContext, useEffect } from 'react';
//import { createCircleRings } from '../tools';
import { findPointsInsidePolygon, findPointsInsideRectangle, findPointsInsideCircle, findAllPointsInRectangle, findAllPointsInPolygon, findAllPointsInCircle } from '../../../services/geolocation';
import { AnalyseContext } from '../../MainFlow/Analyse';
import { calculateCircleArea, calculatePolygonArea, calculatePolylineLength, calculateRectangleArea, numberWithCommas } from '../../../tools';

import redIcon from '../../../assets/png/red-icon.png';
/**
* Adiciona marcador, círculo, polígono, poliline e retângulo ao mapa.
  * @param {Object} map Map inicializado gmaps api.
  * @param {function} setData Função de adição de objectos geométricos à variável `data`.
  */
const ElemDrawManager = ({ map }) => {

  const [marker, setMarker, system, setSystem, overlays, setOverlays] = useContext(AnalyseContext);

  useEffect(() => {

    let draw = new window.google.maps.drawing.DrawingManager({
      //drawingMode: window.google.maps.drawing.OverlayType.MARKER,
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
      markerOptions: {
        // icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
      },
      circleOptions: {
        fillColor: "#ffff00",
        fillOpacity: 0.2,
        strokeWeight: 1,
        clickable: false,
        editable: true,
        zIndex: 1,
      },
    });

    let marker;

    window.google.maps.event.addListener(draw, 'overlaycomplete', async function (event) {

      if (event.type === 'marker') {

        if (marker) {
          marker.setMap(null);
        }
        marker = event.overlay;
        marker.setOptions({
          icon: { url: redIcon, scaledSize: new window.google.maps.Size(30, 30) }
        });
        let position = marker.position;

        setMarker(prev => {
          return {
            ...prev,
            position: {lat: position.lat(), lng:position.lng()},
            int_latitude: position.lat(),
            int_longitude: position.lng()
          }
        })

      }
      if (event.type === 'circle') {

        let circle = event.overlay;
        const { center, radius } = circle;
        // adicionar o infowindow na parte superior do cículo
        let bounds = circle.getBounds();
        var lat = bounds.getNorthEast().lat();
        var lng = circle.getCenter().lng();

        let markers = await findAllPointsInCircle(
          {
            center: { lng: center.lng(), lat: center.lat() },
            radius: parseInt(radius)
          }
        );
        let id = Date.now();

        let shape = {
          id: Date.now(),
          type: 'circle',
          position: { lat: lat, lng: lng },
          map: map,
          draw: event.overlay,
          markers: markers,
          radius: radius,
          area: calculateCircleArea(radius)

        }
   
        setOverlays(prev => {
          return {
            ...prev,
            shapes: [...prev.shapes, shape]
          }
        });
      }

      if (event.type === 'polygon') {

        let polygon = event.overlay;
        // retorna array de coordenada no formato gmaps para busca no servidor. Ex: [{lat: -15, lng: -47}, ...]   
        let serverPolygon = [];
        polygon.getPath().getArray().forEach(p => {
          serverPolygon.push([p.lng(), p.lat()])
        });
        serverPolygon = [...serverPolygon, serverPolygon[0]];

        // Pega as coordenadas do polígono
        let paths = polygon.getPaths();

        // Inicialização das variáveis
        let lat = null;
        let lng = null;

        // Itera para buscar a coordenada mais alta no polígono para que o infowindow fique sempre acima do polígono.
        paths.forEach(function (path) {
          path.forEach(function (point) {
            var latitude = point.lat();
            var longitude = point.lng();

            // Checar a coordenada mais alta
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
        }
        /*
        let infowindow = new window.google.maps.InfoWindow({
          content: setContent(shape),
          map
        });
        infowindow.setPosition({ lat: lat, lng: lng });
        infowindow.setMap(map);*/

        setOverlays(prev => {
          return {
            ...prev,
            shapes: [...prev.shapes, shape]
          }
        });

      }
      /* Criação de um polígono a partir de um retângulo gmaps api
      */
      if (event.type === 'rectangle') {

        let bounds = event.overlay.getBounds();
        let NE = bounds.getNorthEast();
        let SW = bounds.getSouthWest();
        // adicionar infowindow na parte superior direita do retângulo
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
        }

        setOverlays(prev => {
          return {
            ...prev,
            shapes: [...prev.shapes, shape]
          }
        });

      }
      if (event.type === 'polyline') {

        let polyline = event.overlay;
        let path = polyline.getPath();

        // Obtenha o índice do último ponto
        var lastPointIndex = path.getLength() - 1;

        // Obtenha as coordenadas do último ponto
        var lat = path.getAt(lastPointIndex).lat();
        var lng = path.getAt(lastPointIndex).lng();

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

        }

        setOverlays(prev => {
          return {
            ...prev,
            shapes: [...prev.shapes, shape]
          }
        });
      }
    })

    draw.setMap(map);

  }, [map]);

  return null;

};

export default ElemDrawManager;

