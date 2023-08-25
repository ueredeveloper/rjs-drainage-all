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

    let { id,
      us_nome, us_cpf_cnpj,
      emp_endereco,
      int_processo,
      ti_id,
      tp_id,
      int_latitude, int_longitude } = info;

    if (marker) {
      //fill="orange"
      const svgIcon = `<svg fill="orange" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 200 200" x="0px" y="0px"><title>Artboard 19</title><path d="M11.85,78.48C11.85,89.79,31,95.7,50,95.7s38.15-5.91,38.15-17.22c0-6.64-6.63-11.42-15.94-14.23-2,2.79-4,5.35-6,7.66,8.5,1.91,13,5,13,6.57,0,2.38-10.22,8.22-29.15,8.22s-29.15-5.83-29.15-8.22c0-1.58,4.47-4.66,13-6.57-2-2.31-4.05-4.88-6-7.66C18.47,67.07,11.85,71.84,11.85,78.48Z"/><path d="M45.83,73a6,6,0,0,0,8.36,0c7.48-7.36,22.38-24.25,22.38-42.16A26.57,26.57,0,0,0,50,4.3q-.85,0-1.72.05A26.78,26.78,0,0,0,23.43,31.18C23.61,49,38.39,65.72,45.83,73ZM39.37,30.86A10.63,10.63,0,1,1,50,41.49,10.63,10.63,0,0,1,39.37,30.86Z"/><text x="0" y="115" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by Gregor Cresnar</text><text x="0" y="120" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>`;

      marker.setOptions({
        icon: { url: setInfoMarkerIcon(id, ti_id, tp_id).mkr, scaledSize: new window.google.maps.Size(30, 30) },
        position: { lat: parseFloat(int_latitude), lng: parseFloat(int_longitude) },
        map: map
      });
      if (id === 0) {

        //marker.setAnimation(window.google.maps.Animation.BOUNCE);
      }


      return <div><ElemMarkerInfoWindow marker={marker} info={info} map={map} /></div>

    }


  }


  return null;
};

export default ElemMarker;
