import { useContext, useEffect } from 'react';
//import { createCircleRings } from '../tools';
import { findPointsInsidePolygon, findPointsInsideRectangle, findPointsInsideCircle, find_points_in_rectangle } from '../../../services/shapes';
import { SystemContext } from '../../MainFlow/Analyse';
import { my_object } from '../../MainFlow/initial-state-grants';
/**
* Adiciona marcador, círculo, polígono, poliline e retângulo ao mapa.
  * @param {Object} map Map inicializado gmaps api.
  * @param {function} setData Função de adição de objectos geométricos à variável `data`.
  */
const ElemDrawManager = ({ map }) => {

  const [system, setSystem, overlays, setOverlays] = useContext(SystemContext)

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
        let { center, radius } = event.overlay;
        let points = await findPointsInsideCircle(
          {
            center: { lng: center.lng(), lat: center.lat() },
            radius: parseInt(radius)
          }
        );
        let id = Date.now();

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
        })

      }
      if (event.type === 'polygon') {
        // retorna array de coordenada no formato gmaps, ex: [{lat: -15, lng: -47}, ...]   
        let polygon = [];
        event.overlay.getPath().getArray().forEach(p => {
          polygon.push([p.lng(), p.lat()])
        });

        polygon = [...polygon, polygon[0]]

        let points = await findPointsInsidePolygon(polygon);
        let id = Date.now();

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
        })


      }
      /* Criação de um polígono a partir de um retângulo gmaps api
      */
      if (event.type === 'rectangle') {
        let bounds = event.overlay.getBounds();
        let NE = bounds.getNorthEast();
        let SW = bounds.getSouthWest();
        /** SUPABASE
         * Buscar pontos em um retângulo
         * @param nex {float} Noroeste longitude
         * @param ney {float} Noroeste latitude
         * @param swx {float} Sudoeste longitude
         * @param swy {float} Sudoeste longitude
         * @returns {array[]} Interferencias outorgadas.
       */
        //let rectangle = { nex: NE.lng(), ney: NE.lat(), swx: SW.lng(), swy: SW.lat() }
        
        let markers = await find_points_in_rectangle(SW.lng(), SW.lat(), NE.lng(), NE.lat());

        console.log(markers)

        let id = Date.now();

        setOverlays(prev => {
          return {
            ...prev,
            rectangles: [...prev.rectangles, { id: id, ne: NE, sw: SW, draw: event.overlay }],
            markers: [...prev.markers, markers[0]]
          }
        })

      }
    })

    _draw.setMap(map);

  }, [map]);


  return null;

};

export default ElemDrawManager;