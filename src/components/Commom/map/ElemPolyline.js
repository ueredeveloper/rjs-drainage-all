import { useEffect, useState } from "react";
import ElemPolylineInfoWindow from "./infowindow/ElemPolylineInfoWindow";

/**
 * Elemento de Polilinha para as shapes Hidrogeo_Fraturado e Hidrogeo_Poroso.
 * @component
 * @param {*} param0
 */
const ElemPolyline = ({ shape, map, zoom }) => {

  const [polyline, setPolyline] = useState();
  // Para controlar a largura da linha de acordo com o zoom
  const [strokeWeight, setStrokeWeight] = useState(1.5);

  const [strokeColor] = useState(
    "#" + Math.floor(Math.random() * 16777215).toString(16),
  );

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

  useEffect(() => {

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

  }, [zoom])

  if (polyline) {

    polyline.setOptions({
      path: shape.geometry.coordinates,
      geodesic: true,
      strokeColor: strokeColor,
      strokeWeight: strokeWeight,
      map: map,
    });
  }

  return polyline ? (
    <ElemPolylineInfoWindow polyline={polyline} shape={shape} map={map} />
  ) : null;
};

export default ElemPolyline;
