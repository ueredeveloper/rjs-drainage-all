import React, { useEffect, useState, useRef } from 'react';
import { darkMap } from './mode/dark-map';
import ElemStreeView from './ElemStreetView';

const streeViewLocations = [
  { lat: -15.7856923, lng: -47.8291058, descricao: "Royal Tulip Brasília" },
  { lat: -15.7802595, lng: -47.8592174 },
  { lat: -15.7858201, lng: -47.8332237 },
  { lat: -15.6985107, lng: -47.8297711 },
  { lat: -15.7802595, lng: -47.9242975 },
  { lat: -15.777467, lng: -47.8575272 },
];

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
  * Elemento de renderização do mapa
  * @component
  */
function ElemMap({ mode, map, setMap, zoom, setZoom, setIsFullscreen }) {

  const ref = useRef();
  const center = { lat: -15.78567469569133, lng: -47.83988126733556 }

  const [streetViewLocation, setStreetViewLocation] = useState(streeViewLocations[getRandomArbitrary(0, 6)]);

  useEffect(() => {

    if (ref.current && !map) {
      setMap(
        new window.google.maps.Map(ref.current, {
          center,
          zoom,
          mapTypeId: 'satellite',

          mapTypeControlOptions: {
            mapTypeIds: ['hybrid', 'roadmap', 'satellite', 'terrain'],
            style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          },
        })
      );
    }

    if (map) {

      // Adiciona listener para capturar o zoom do mapa.
      map.addListener('zoom_changed', function () {
        setZoom(map.getZoom())
      });

      map.addListener('bounds_changed', () => {
        // Verifica se o documento tem um elemento em tela cheia.
        // Quando o mapa está em tela cheia, o elemento será o container do mapa.
        setIsFullscreen(!!document.fullscreenElement);
      });

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

    console.log('Elem Map', ref, map, mode, streetViewLocation)
  }, [ref, map, mode, streetViewLocation]);

  return (
    <>
      {!streetViewLocation &&
        <div ref={ref} id="map" style={{ width: '100%', height: '100%', minHeight: '25rem', }} />

      }

      {streetViewLocation && <ElemStreeView location={streetViewLocation} onClose={() => setStreetViewLocation(null)} />}

    </>
  );

}

export default ElemMap;

/*

 {!streetViewLocation && 
    <div ref={ref} id="map" style={{ width: '100%', height: '100%', minHeight: '25rem', }} />

    }

    */

