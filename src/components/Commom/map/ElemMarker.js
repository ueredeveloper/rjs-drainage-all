import { useEffect, useState } from 'react';

/**
 * Componente que representa um marcador no mapa.
 * @param {Object} props - Propriedades do componente.
 * @param {Object} props.marker - Objeto contendo as informações do marcador.
 * @param {number} props.marker.int_latitude - Latitude do marcador.
 * @param {number} props.marker.int_longitude - Longitude do marcador.
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
  function setIcon(tp_id) {
    if (tp_id === 0) {
      return `https://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png`;
    } else if (tp_id === 1) {
      return `https://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png`;
    } else if (tp_id === 2) {
      return `https://www.google.com/intl/en_us/mapfiles/ms/micons/orange-dot.png`;
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
    let { int_latitude, int_longitude } = props.marker;
    let icon = props.icon;

    marker.setOptions({
      icon: setIcon(icon),
      position: { lat: parseFloat(int_latitude), lng: parseFloat(int_longitude) },
      map: props.map
    });

    if (icon === 0) {
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
    }
  }

  return null;
};

export default ElemMarker;
