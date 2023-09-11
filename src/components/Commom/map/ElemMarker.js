import { useEffect, useState } from 'react';
import { setInfoMarkerIcon } from '../../../tools';
import ElemMarkerInfoWindow from './infowindow/ElemMarkerInfoWindow';

/**
 * @typedef {import('react').PropsWithChildren} Props
 */

/**
 * @typedef {Object} MarkerOptions
 * @property {string} url - URL of the marker icon image.
 * @property {Object} scaledSize - Scaled size of the marker icon.
 */

/**
 * @typedef {Object} MarkerInfo
 * @property {number} id - Marker ID.
 * @property {number} ti_id - Type of interference ID.
 * @property {number} tp_id - Type of pipeline ID.
 * @property {string} int_latitude - Marker latitude.
 * @property {string} int_longitude - Marker longitude.
 */

/**
 * React component for displaying a marker on a map.
 * @param {Props & { info: MarkerInfo, map: object }} props - Component props containing marker information and map object.
 * @returns {null} Null component.
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
