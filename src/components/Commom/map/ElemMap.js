import React, { useEffect, useRef } from 'react';
import { darkMap } from './mode/dark-map';


/**
  * Elemento de renderização do mapa
  * @component
  */
function ElemMap({ mode, map, setMap, zoom }) {

  const ref = useRef();
  const center = { lat: -15.764514558482336, lng: -47.76491209127806 }

  useEffect(() => {

    if (ref.current && !map) {
      setMap(
        new window.google.maps.Map(ref.current, {
          center,
          zoom,
          mapTypeId: 'hybrid'
        })
      );
    }

    if (map) {
      ["click"].forEach((e) =>
        window.google.maps.event.clearListeners(map, e)
      );
      // mode light dark
      mode === "dark" ? map.setOptions({ styles: darkMap }) : map.setOptions({ styles: [] });
      // click no mapa
      // map.addListener("click", onClick);
      // centralizar
      //map.setCenter({ lat: parseFloat(center.lat), lng: parseFloat(center.lng) })
    }
  }, [ref, map, mode]);

  return (
    <div ref={ref} id="map" style={{ width: '100%', height: '100%', minHeight: '25rem', }} />
  );

}

export default ElemMap;

