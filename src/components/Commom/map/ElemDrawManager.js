import { useContext, useEffect } from 'react';
//import { createCircleRings } from '../tools';
import { findPointsInsidePolygon, findPointsInsideRectangle, findPointsInsideCircle, find_points_in_rectangle } from '../../../services/shapes';
import { SystemContext } from '../../MainFlow/Analyse';
import { calculateCircleArea, calculatePolygonArea, calculatePolylineLength, calculateRectangleArea } from '../../../tools';
import ElemInfoWindow from './ElemInfoWindow';
/**
* Adiciona marcador, círculo, polígono, poliline e retângulo ao mapa.
  * @param {Object} map Map inicializado gmaps api.
  * @param {function} setData Função de adição de objectos geométricos à variável `data`.
  */
const ElemDrawManager = ({ map }) => {

  const [marker, setMarker, system, setSystem, overlays, setOverlays] = useContext(SystemContext);

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
    console.log(marker)
  }, [marker])

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
        let position = marker.position

        setMarker(prev => {
          return {
            ...prev,
            int_latitude: parseFloat(position.lat()),
            int_longitude: parseFloat(position.lng()),
          }
        })
        /*
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
                });*/

        // retirar o marcador do mapa depois de capturar a coordenada
        map.setCenter({ lat: parseFloat(position.lat()), lng: parseFloat(position.lng()) })
        marker.setMap(null);

      }
      if (event.type === 'circle') {

        let circle = event.overlay;
        const { center, radius } = circle;
        // adicionar o infowindow na parte superior do cículo
        let bounds = circle.getBounds();
        var lat = bounds.getNorthEast().lat();
        var lng = circle.getCenter().lng();

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
        let topLatitude = null;
        let topLongitude = null;

        // Itera para buscar a coordenada mais alta no polígono para que o infowindow fique sempre acima do polígono.
        paths.forEach(function (path) {
          path.forEach(function (point) {
            var latitude = point.lat();
            var longitude = point.lng();

            // Checar a coordenada mais alta
            if (topLatitude === null || latitude > topLatitude) {
              topLatitude = latitude;
              topLongitude = longitude;
            }
          });
        });

        let shape = {
          id: Date.now(),
          type: 'polygon',
          position: { lat: topLatitude, lng: topLongitude },
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

        // Obtenha o índice do último ponto
        var lastPointIndex = path.getLength() - 1;

        // Obtenha as coordenadas do último ponto
        var lastLatitude = path.getAt(lastPointIndex).lat();
        var lastLongitude = path.getAt(lastPointIndex).lng();

        let shape = {
          id: Date.now(),
          type: 'polyline',
          position: { lat: lastLatitude, lng: lastLongitude },
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

