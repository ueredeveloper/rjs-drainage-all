import React, { useEffect, useState, useRef, useCallback } from 'react';
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

function ElemMap({ mode, map, setMap, zoom, setZoom, setIsFullscreen }) {
  const ref = useRef();
  const center = { lat: -15.78567469569133, lng: -47.83988126733556 };

  const [streetViewLocation, setStreetViewLocation] = useState(streeViewLocations[getRandomArbitrary(0, streeViewLocations.length)]);


  // Inicializa o mapa uma vez
  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'satellite',
        mapTypeControlOptions: {
          mapTypeIds: ['hybrid', 'roadmap', 'satellite', 'terrain'],
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        },
      });
      setMap(newMap);
    }
  }, [map, setMap, center, zoom]);


  useEffect(() => {

    console.log(streeViewLocations)

  }, [streeViewLocations])

  // Configura listeners e modo do mapa
  useEffect(() => {
    if (!map) return;

    const zoomListener = map.addListener('zoom_changed', () => setZoom(map.getZoom()));
    const boundsListener = map.addListener('bounds_changed', () => {
      setIsFullscreen(!!document.fullscreenElement);
    });

    // Aplica modo dark/light
    map.setOptions({ styles: mode === "dark" ? darkMap : [] });

    return () => {
      window.google.maps.event.removeListener(zoomListener);
      window.google.maps.event.removeListener(boundsListener);
    };
  }, [map, mode, setZoom, setIsFullscreen]);

  return (
    <>
      {!streetViewLocation && (
        <div ref={ref} id="map" style={{ width: '100%', height: '100%', minHeight: '25rem' }} />
      )}
      {
        streeViewLocations && <ElemStreeView streetViewLocation={streetViewLocation} setStreetViewLocation={setStreetViewLocation} />
      }
    </>
  );
}

export default ElemMap;
