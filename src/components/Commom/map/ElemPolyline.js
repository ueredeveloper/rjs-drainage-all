import { useEffect, useState } from 'react';

/**
* Elemento de Polígono gmaps api.
*
*
*/
const ElemPolyline = ({ coord, map }) => {

  const [polyline, setPolyline] = useState();

  useEffect(() => {

    if (!polyline) {
      setPolyline(new window.google.maps.Polyline());
    }
    // remove marker from map on unmount
    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
    };
  }, [polyline, setPolyline]);

  if (polyline) {
    /**
    * Coverter coordenada postgres para o formato gmaps
    */
    function convertToGmaps (coord) {
      let _coord = coord.map(_c=>{
        return { lat: parseFloat(_c[1]), lng: parseFloat(_c[0]) }
      })
      return _coord;
    }
    // converter postgres para gmaps
    let _path = convertToGmaps(coord);

    polyline.setOptions(
      {
        path:_path,
        geodesic: true,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 1,
        map: map
      }
    );
  }

  return null;

};

export default ElemPolyline;