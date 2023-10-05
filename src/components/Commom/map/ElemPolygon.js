import { useEffect, useState } from 'react';
import ElemPolygonInfoWindow from './infowindow/ElemPolygonInfoWindow';

/**
 * Elemento de renderização de polígonos no mapa.
 * @component
 * @param {*} param0
 */
const ElemPolygon = ({ shape, map }) => {

  const [polygon, setPolygon] = useState();

  useEffect(() => {

    if (!polygon) {
      setPolygon(new window.google.maps.Polygon());
    }
    // remove marker from map on unmount
    return () => {
      if (polygon) {
        polygon.setMap(null);
      }
    };
  }, [polygon, setPolygon]);



  if (polygon) {
    // cor aleatóra para o polígono
    let color = Math.floor(Math.random() * 2 ** 24).toString(16).padStart(6, '0');

    polygon.setOptions(
      {
        paths: shape.shape.coordinates,
        strokeColor: '#' + color,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#' + color,
        fillOpacity: 0.35,
        map: map
      }
    );
  }

  return <div><ElemPolygonInfoWindow polygon={polygon} shape={shape} map={map} /></div>;

};

export default ElemPolygon;