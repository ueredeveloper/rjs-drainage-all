/**
 * Módulo responsável pelo componente ElemMarker.
 * @module ElemMarker
 * @requires useEffect
 * @requires useState
 * @requires setInfoMarkerIcon
 * @requires ElemMarkerInfoWindow
 */

import { useEffect, useState } from 'react';
import { setInfoMarkerIcon } from '../../../tools';
import ElemMarkerInfoWindow from './infowindow/ElemMarkerInfoWindow';

/**
 * Componente ElemMarker que representa um marcador no mapa.
 * @function
 * @param {object} props - As propriedades do componente.
 * @param {object} props.info - As informações do marcador.
 * @param {object} props.map - O objeto de mapa do Google Maps.
 * @returns {JSX.Element|null} O elemento JSX representando o marcador ou null se não houver informações.
 */
const ElemMarker = ({ info, map }) => {

  const [marker, setMarker] = useState();

  useEffect(() => {

    if (!marker) {
      setMarker(new window.google.maps.Marker());
    }

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  if (info) {

    let { id, ti_id, tp_id, int_latitude, int_longitude } = info;

    if (marker) {
      marker.setOptions({
        icon: { url: setInfoMarkerIcon(id, ti_id, tp_id).mkr, scaledSize: new window.google.maps.Size(30, 30) },
        position: { lat: parseFloat(int_latitude), lng: parseFloat(int_longitude) },
        map: map
      });
      if (id === 0) {

        marker.setAnimation(window.google.maps.Animation.BOUNCE);

        // Parar animação do marcador com 3 segundos (3000 milliseconds)
        setTimeout(function () {
          marker.setAnimation(null); // Set animation to null to stop it
        }, 3000);
      }
      return <div><ElemMarkerInfoWindow marker={marker} info={info} map={map} /></div>

    }
  }

  return null;
};

export default ElemMarker;
