import { useEffect, useState } from "react";
import ElemPolylineInfoWindow from "./infowindow/ElemPolylineInfoWindow";

/**
 * Elemento de Polilinha para as shapes Hidrogeo_Fraturado e Hidrogeo_Poroso.
 * @component
 * @param {*} param0
 */
const ElemPolyline = ({ shape, map }) => {
  const [polyline, setPolyline] = useState();
  // Para controlar a largura da linha de acordo com o zoom
  const [strokeWeight, setStrokeWeight] = useState(1.5);

  const [strokeColor] = useState(
    "#" + Math.floor(Math.random() * 16777215).toString(16),
  );

  useEffect(() => {
    // Listener para capturar o zoom e mudar a largura da linha
    let zoomListener = map.addListener("zoom_changed", () => {
      // captura o zoom
      const zoom = map.getZoom();

      let newWeight;
      if (zoom <= 10) {
        newWeight = 1;
      } else if (zoom <= 12) {
        newWeight = 2;
      } else if (zoom <= 15) {
        newWeight = 4;
      } else if (zoom <= 17) {
        newWeight = 6;
      } else {
        newWeight = 8;
      }

      setStrokeWeight(newWeight);
    });

    if (!polyline) {
      setPolyline(new window.google.maps.Polyline());
    }
    // remove marker from map on unmount
    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
      window.google.maps.event.removeListener(zoomListener);
    };
  }, [polyline, setPolyline]);

  if (polyline) {
    /**
     * Coverter coordenada postgres para o formato gmaps
     */
    /* function convertToGmaps (coord) {
       let _coord = coord.map(_c=>{
         return { lat: parseFloat(_c[1]), lng: parseFloat(_c[0]) }
       })
       return _coord;
     }
     // converter postgres para gmaps
     let _path = convertToGmaps(coord);*/

    polyline.setOptions({
      path: shape.geometry.coordinates,
      geodesic: true,
      strokeColor: strokeColor,
      strokeWeight: strokeWeight,
      map: map,
    });
  }

  return polyline ? (
    <ReactPolylineInfoWindow polyline={polyline} shape={shape} map={map} />
  ) : null;
};

export default ElemPolyline;
