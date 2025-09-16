import { useEffect, useRef, useState } from 'react';
import ElemPolygonInfoWindow from './infowindow/ElemPolygonInfoWindow';

function getPolygonCenter(coords) {
  const latSum = coords.reduce((sum, p) => sum + p.lat, 0);
  const lngSum = coords.reduce((sum, p) => sum + p.lng, 0);
  return {
    lat: latSum / coords.length,
    lng: lngSum / coords.length,
  };
}

function setColorByPercentage(shape) {

  const percentage = shape.pct_utilizada;
  if (percentage <= 10) {
    // verde
    return "#4cc94c";
  } else if (percentage > 10 && percentage <= 25) {
    return "#007c00";
  } else if (percentage > 25 && percentage <= 50) {
    return "#004700"
  } else if (percentage > 50 && percentage <= 75) {
    // amarelo
    return "#FFD32C"
  } else if (percentage > 75 && percentage <= 90) {
    // vermelho
    return "#FF2C2C"
  } else {
    // roxo
    return "#F200FF"
  }
}

/**
 * Elemento de renderização de polígonos no mapa.
 * @component
 * @param {*} param0
 */
const ElemPolygon = ({ shape, map, isWaterAvailable, zoom }) => {

  const [polygon, setPolygon] = useState();

  // Captura popups para remover depois todos do mapa
  let overlays = []

  useEffect(() => {

    if (!polygon) {
      setPolygon(new window.google.maps.Polygon());
    }

    return () => {

      if (polygon) {
        polygon.setMap(null);
        overlays.forEach(overlay => overlay.setMap(null));

      }
    };

  }, [polygon, setPolygon]);

  if (polygon) {

    let color;

    // Cor de acordo com a porcentagem de utilização
    if (isWaterAvailable) {
      color = setColorByPercentage(shape)
    } else {
      // cor aleatóra para o polígono
      color = '#' + Math.floor(Math.random() * 2 ** 24).toString(16).padStart(6, '0');
    }

    polygon.setOptions(
      {
        paths: shape.geometry.coordinates,
        strokeColor: isWaterAvailable ? "#FFFFFF" : color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.45,
        map: map
      }
    );


  }

  /*
  useEffect(() => {

    if (zoom > 13) {

      shape.geometry.coordinates.forEach((coords) => {

        const center = getPolygonCenter(coords);

        // Criar um popup customizado
        const popupDiv = document.createElement("div");
        popupDiv.style.background = "white";
        popupDiv.style.padding = "5px";
        popupDiv.style.borderRadius = "8px";
        popupDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        popupDiv.innerHTML = `
              <strong>${shape.qtd_pocos} Poços</strong> <br/>
              <strong>Porcentagem de utilização: ${shape.pct_utilizada}%</strong> <br/>
              <strong>Código: ${shape.cod_plan}</strong>
          `;

        const overlay = new window.google.maps.OverlayView();

        overlay.onAdd = function () {
          this.getPanes().floatPane.appendChild(popupDiv);
        };

        overlay.draw = function () {
          const projection = this.getProjection();
          const pos = projection.fromLatLngToDivPixel(
            new window.google.maps.LatLng(center)
          );
          popupDiv.style.position = "absolute";
          popupDiv.style.left = pos.x + "px";
          popupDiv.style.top = pos.y + "px";
        };

        overlay.onRemove = function () {
          popupDiv.remove();
        };

        overlay.setMap(map);
        overlays.push(overlay)

      });

      return () => {
        overlays.forEach(overlay => overlay.setMap(null));
      };

    } else {
      overlays.forEach(overlay => overlay.setMap(null));
    }
  }, [zoom])
  */

  return <div><ElemPolygonInfoWindow polygon={polygon} shape={shape} map={map} /></div>;

};

export default ElemPolygon;