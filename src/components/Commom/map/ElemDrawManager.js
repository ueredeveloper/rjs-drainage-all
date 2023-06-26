import { useContext, useEffect } from 'react';
//import { createCircleRings } from '../tools';
import { findPointsInsidePolygon, findPointsInsideRectangle, findPointsInsideCircle, find_points_in_rectangle } from '../../../services/shapes';
import { SystemContext } from '../../MainFlow/Analyse';
import { my_object } from '../../MainFlow/initial-state-grants';
import { calculateCircleArea, calculatePolygonArea, calculatePolylineLength, calculateRectangleArea } from '../../../tools';
import ElemInfoWindow from './ElemInfoWindow';
/**
* Adiciona marcador, círculo, polígono, poliline e retângulo ao mapa.
  * @param {Object} map Map inicializado gmaps api.
  * @param {function} setData Função de adição de objectos geométricos à variável `data`.
  */
const ElemDrawManager = ({ map }) => {

  const [system, setSystem, overlays, setOverlays] = useContext(SystemContext);

  // O listener não está funcionando no círculo, como não é prioridade, buscar depois.

  /*
  function setListener(shape, map) {

    shape.draw.addListener("click", function (event) {

      console.log('shape clicked event draw manager')

      setOverlays(prev => {
        const updateShape = prev.shapes.map(_shape => {
          if (_shape.id === shape.id) {
            return { ..._shape, position: event.latLng, map: map };
          }
          return _shape;
        });

        return { ...prev, shapes: updateShape };
      });

    });
  }*/

  useEffect(() => {

    let _draw = new window.google.maps.drawing.DrawingManager({
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

    window.google.maps.event.addListener(_draw, 'overlaycomplete', async function (event) {

      if (event.type === 'marker') {

        let marker = event.overlay;
        let position = event.overlay.position

        

        setSystem(prev => {
          return {
            ...prev,
            markers: [{
              type: 'marker',
              tp_id: 1,
              int_latitude: parseFloat(position.lat()),
              int_longitude: parseFloat(position.lng()),
              dt_demanda: { demandas: [] }
            }]
          }
        });

        // retirar o marcador do mapa depois de capturar a coordenada
        marker.setMap(null);

      }
      if (event.type === 'circle') {

        let circle = event.overlay;
        const { center, radius } = circle;
        // adicionar o infowindow na lateral direita
        const { lat: centerLat } = center;
        const { lng: northEastLng } = circle.getBounds().getNorthEast();

        let markers = await findPointsInsideCircle(
          {
            center: { lng: center.lng(), lat: center.lat() },
            radius: parseInt(radius)
          }
        );
        let id = Date.now();

        let shape = {
          id: Date.now(),
          type: 'circle',
          position: { lat: centerLat(), lng: northEastLng() },
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

        const pathArray = polygon.getPath().getArray();
        // localização da infowindow, no começo do polígono
        let minLat = pathArray[0].lat();
        let minLng = pathArray[0].lng();

        let shape = {
          id: Date.now(),
          type: 'polygon',
          position: { lat: minLat, lng: minLng },
          map: map,
          draw: event.overlay,
          markers: await findPointsInsidePolygon(serverPolygon),
          area: calculatePolygonArea(event.overlay)
        }

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

        let shape = {
          id: Date.now(),
          type: 'rectangle',
          position: { lat: NE.lat(), lng: NE.lng() },
          map: map,
          draw: event.overlay,
          NE: NE,
          SW: SW,
          area: calculateRectangleArea(event.overlay.getBounds()),
          markers: await find_points_in_rectangle(SW.lng(), SW.lat(), NE.lng(), NE.lat())
        }

        //setListener(shape, map);

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
        let lastCoordinate = path.getAt(path.getLength() - 1);

        let shape = {
          id: Date.now(),
          type: 'polyline',
          position: lastCoordinate,
          map: map,
          draw: polyline,
          meters: calculatePolylineLength(polyline)

        }

        //setListener(shape, map);

        setOverlays(prev => {
          return {
            ...prev,
            shapes: [...prev.shapes, shape]
          }
        });

      }
    })



    _draw.setMap(map);

  }, [map]);


  return null;

};



export default ElemDrawManager;

