import { useEffect, useState } from 'react';
import iconRed from '../../../assets/red.png';
import iconGreen from '../../../assets/green.png';
import iconOrange from '../../../assets/orange.png';
import iconBlue from '../../../assets/blue.png';
import iconPurple from '../../../assets/purple.png';
import iconPink from '../../../assets/pink.png';
import iconYellow from '../../../assets/yellow.png';
import iconBrown from '../../../assets/brown.png';


/**
 * Componente que representa um marcador no mapa.
 * @param {Object} props - Propriedades do componente.
 * @param {Object} props.info - Objeto contendo as informações do marcador.
 * @param {number} props.info.int_latitude - Latitude do marcador.
 * @param {number} props.info.int_longitude - Longitude do marcador.
 * @param {number} props.icon - Ícone do marcador.
 * @param {Object} props.map - Objeto do mapa onde o marcador será exibido.
 * @returns {null}
 */
const ElemMarker = (props) => {

  const [marker, setMarker] = useState();

  /**
   * Retorna o caminho do ícone com base no tipo de identificação.
   * @param {number} tp_id - Tipo de identificação.
   * @returns {string} - Caminho do ícone.
   */
  function setIcon(id, ti_id, tp_id) {

    if (id === 0) {
      return iconRed;
    }
    // 1 - superficial
    else if (ti_id === 1) {
      return iconGreen;
    }
    // 2 - subterrâneo
    else if (ti_id === 2) {
      // manual
      if (tp_id === 1) {
        return iconBrown;
      }
      // tubular
      else {
        return iconBlue;
      }
      // 3 - lançamento de águas pluviais
    } else if (ti_id === 3) {
      return iconPurple;
    }
    // 4 - lançamento de efluentes
    else if (ti_id === 4) {
      return iconPink;
    }
    // 5 - barragem
    else if (ti_id === 5) {
      return iconYellow;
    }
    // 6 - caminhão pipa
    else if (ti_id === 6) {
      return iconOrange;
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

  if (marker) {
    let { id, ti_id, tp_id, int_latitude, int_longitude } = props.info;

    marker.setOptions({
      
      icon: { url: setIcon(id, ti_id, tp_id), scaledSize: new window.google.maps.Size(30, 30) },
      position: { lat: parseFloat(int_latitude), lng: parseFloat(int_longitude) },
      map: props.map
    });

    if (id === 0) {
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
    }
  }

  return null;
};

export default ElemMarker;
