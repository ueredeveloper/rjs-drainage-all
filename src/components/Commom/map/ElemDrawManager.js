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
  }

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

        let position = event.overlay.position

        setSystem(prev => {
          return {
            ...prev,
            point: {
              ...prev.point,
              lat: parseFloat(position.lat()),
              lng: parseFloat(position.lng())
            },
            markers: [{
              int_latitude: parseFloat(position.lat()),
              int_longitude: parseFloat(position.lng()),
              dt_demanda: { demandas: [] }
            }]
          }
        })

        // retirar o marcador do mapa depois de capturar a coordenada
        event.overlay.setMap(null);

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
          area: calculateCircleArea(radius)
        }

        console.log(shape.area)

        /*
        window.google.maps.event.addListener(shape.draw, 'click', function(ev){
         console.log('clicke ddd')
      });*/

        /* shape.draw.addListener('click', () => {
           console.log('Circle clicked!');
         });*/
        //setListener(shape, map);


        setOverlays(prev => {
          return {
            ...prev,
            shapes: [...prev.shapes, shape]
          }
        });


        /*
        setOverlays(prev => {
          return {
            ...prev,
            circles: [
              ...prev.circles, { id: id, center: center, radius: radius, draw: event.overlay }],
            markers: [
              ...prev.markers,
              { points: points }
            ]

          }
        })*/


      }

      if (event.type === 'polygon') {
        // retorna array de coordenada no formato gmaps, ex: [{lat: -15, lng: -47}, ...]   
        let polygon = [];
        event.overlay.getPath().getArray().forEach(p => {
          polygon.push([p.lng(), p.lat()])
        });

        polygon = [...polygon, polygon[0]]

        let points = await findPointsInsidePolygon(polygon);
        //let id = Date.now();

        let shape = {
          id: Date.now(),
          type: 'polygon',
          position: null,
          map: null,
          draw: event.overlay,
          markers: await findPointsInsidePolygon(polygon),
          area: calculatePolygonArea(event.overlay)
        }

        setListener(shape, map);

        setOverlays(prev => {
          return {
            ...prev,
            shapes: [...prev.shapes, shape]
          }
        });

        /*
        setOverlays(prev => {
          return {
            ...prev,
            polygons: [...prev.polygons, {
              id: id,
              rings: event.overlay.getPath().getArray().map(ll => { return { lat: ll.lat(), lng: ll.lng() } }), draw: event.overlay
            }],
            markers: [
              ...prev.markers,
              { points: points }
            ]
          }
        })*/


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
          position: null,
          map: null,
          draw: event.overlay,
          NE: NE,
          SW: SW,
          area: calculateRectangleArea(event.overlay.getBounds()),
          markers: await find_points_in_rectangle(SW.lng(), SW.lat(), NE.lng(), NE.lat())
        }

        setListener(shape, map);

        setOverlays(prev => {
          return {
            ...prev,
            shapes: [...prev.shapes, shape]
          }
        });

      }
      if (event.type === 'polyline') {

        let shape = {
          id: Date.now(),
          type: 'polyline',
          position: null,
          map: null,
          draw: event.overlay,
          meters: calculatePolylineLength(event.overlay)

        }

        setListener(shape, map);

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

