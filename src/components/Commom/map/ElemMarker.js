import { useEffect, useState } from 'react';
import redIcon from '../../../assets/red-icon.png';
import greenIcon from '../../../assets/green-icon.png';
import orangeIcon from '../../../assets/orange-icon.png';
import blueIcon from '../../../assets/blue-icon.png';
import purpleIcon from '../../../assets/purple-icon.png';
import pinkIcon from '../../../assets/pink-icon.png';
import yellowIcon from '../../../assets/yellow-icon.png';
import brownIcon from '../../../assets/brown-icon.png';
import ElemInfoWindow from './ElemInfoWindow';

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

  /**
   * Sets the icon for the marker based on the provided parameters.
   * @param {number} id - Marker ID.
   * @param {number} ti_id - Type of interference ID.
   * @param {number} tp_id - Type of pipeline ID.
   * @returns {string} URL of the marker icon image.
   */
  function setIcon(id, ti_id, tp_id) {

    if (id === 0) {
      return redIcon;
    }
    else if (ti_id === 1) {
      return greenIcon;
    }
    else if (ti_id === 2) {
      if (tp_id === 1) {
        return brownIcon;
      }
      else {
        return blueIcon;
      }
    }
    else if (ti_id === 3) {
      return purpleIcon;
    }
    else if (ti_id === 4) {
      return pinkIcon;
    }
    else if (ti_id === 5) {
      return yellowIcon;
    }
    else if (ti_id === 6) {
      return orangeIcon;
    }

  }

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

      marker.setOptions({
        icon: { url: setIcon(id, ti_id, tp_id), scaledSize: new window.google.maps.Size(30, 30) },
        position: { lat: parseFloat(int_latitude), lng: parseFloat(int_longitude) },
        map: map
      });
      if (id === 0) {

        //marker.setAnimation(window.google.maps.Animation.BOUNCE);
      }


      return <div><ElemInfoWindow marker={marker} info={info} map={map} /></div>

    }


  }


  return null;
};

export default ElemMarker;
