import { useEffect, useState } from "react";
import { createRiverInfoWindowContent } from "./infowindow/ElemRiverInfoWindow";

/**
 * Elemento de Polilinha para as shapes Hidrogeo_Fraturado e Hidrogeo_Poroso.
 * @component
 * @param {*} param0
 */
const ElemPolyline = ({ shape, map }) => {
  const [polyline, setPolyline] = useState();
  const [infoWindow, setInfoWindow] = useState();
  // Para controlar a largura da linha de acordo com o zoom
  const [strokeWeight, setStrokeWeight] = useState(1.5);

  const [strokeColor] = useState(
    "#" + Math.floor(Math.random() * 16777215).toString(16),
  );

  

  useEffect(() => {
    // Listener para capturar o zoom e mudar a largura da linha
    let zoomListener = map.addListener("zoom_changed", () => {
      // captura o zom
      const zoom = map.getZoom();

      // Se o usuário aproximar mais o mapa, a linha cresce a largura de aocrdo com o zoom
      const newWeight = zoom <= 12 ? 1.5 : 4;
      setStrokeWeight(newWeight);
    });

    if (!polyline) {
      setPolyline(new window.google.maps.Polyline());
    }

    if (!infoWindow) {
      setInfoWindow(new window.google.maps.InfoWindow());
    }

    // remove marker from map on unmount
    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
      if (infoWindow) {
        infoWindow.close();
      }
      window.google.maps.event.removeListener(zoomListener);
    };
  }, [polyline, setPolyline, infoWindow]);

  if (polyline && infoWindow) {
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
      clickable: true,
    });

    // Adiciona listener de click para mostrar InfoWindow
    const clickListener = polyline.addListener("click", (event) => {
      // Calcula o ponto médio da polyline para posicionar o InfoWindow
      const path = polyline.getPath();
      const midIndex = Math.floor(path.getLength() / 2);
      const position = path.getAt(midIndex);

      // Define o conteúdo do InfoWindow com as informações do rio
      const content = createRiverInfoWindowContent(shape);
      
      infoWindow.setContent(content);
      infoWindow.setPosition(position || event.latLng);
      infoWindow.open(map);
    });

    // Cleanup do listener quando o componente é desmontado
    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
    };
  }

  return null;
};

export default ElemPolyline;
