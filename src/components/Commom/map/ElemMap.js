import React, { useEffect, useState, useRef, useCallback } from 'react';
import { darkMap } from './mode/dark-map';
import ElemStreeView from './ElemStreetView';

const streeViewLocations = [
  { lat: -15.8325514, lng: -47.8476695, descricao: "Lago Paranoá" },
  { lat: -15.8209913, lng: -47.8279401, descricao: "3ª Ponte de Brasília" },
  { lat: -15.7603064, lng: -48.0818471, descricao: "Floresta Nacional de Brasília" },
  { lat: -15.777931, lng: -47.857934, descricao: "Iate Clube de Brasília" },
  { lat: -15.777467, lng: -47.8575272, descricao: "Iate Clube de Brasília" },
  { lat: -15.7331605, lng: -47.886387, descricao: "Park Deck Norte" },
  { lat: -15.6985107, lng: -47.8297711, descricao: "Torre de TV Digital" },
  { lat: -15.7858201, lng: -47.8332237, descricao: "Orla do Lago Paranoá" },
  { lat: -15.7856923, lng: -47.8291058, descricao: "Royal Tulip Brasília" },
  { lat: -15.9647741, lng: -47.743557, descricao: "Núcleo Rural Aguilhada" },
  { lat: -15.74754, lng: -47.8716051, descricao: "Crespom" },

  // Novos pontos
  { lat: -15.795877, lng: -47.78459, descricao: "Lago Paranoá - Barragem" },
  { lat: -15.7927769, lng: -47.806879, descricao: "Centro de Convenções Israel Pinheiro" },
  { lat: -15.7974116, lng: -47.812143, descricao: "Parque Dom Bosco" },
  { lat: -15.8244509, lng: -47.8254215, descricao: "3ª Ponte (Lago Sul)" },
  { lat: -15.8512752, lng: -47.862365, descricao: "Embaixada do Qatar" },
  { lat: -15.828312, lng: -47.870282, descricao: "Pontão do Lago Sul" },
  { lat: -15.8243773, lng: -47.8722113, descricao: "Pontão do Lago Sul (2)" },
  { lat: -15.8237419, lng: -47.8827199, descricao: "Náutica BBS" },
  { lat: -15.8325507, lng: -47.8896286, descricao: "Okinawa Dojo Clube" }
];


function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function ElemMap({ mode, map, setMap, zoom, setZoom, setIsFullscreen }) {
  const ref = useRef();
  const center = { lat: -15.78567469569133, lng: -47.83988126733556 };
  //Escolha randomizada da imagem do streetview
  const [streetViewLocation, setStreetViewLocation] = useState(streeViewLocations[getRandomArbitrary(0, streeViewLocations.length)]);
  //const [streetViewLocation, setStreetViewLocation] = useState(null);

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
      {
        !streetViewLocation && (
          <div ref={ref} id="map" className="swing" style={{ width: '100%', height: '100%', minHeight: '25rem' }} />)
      }
      {
        streeViewLocations && (
          <ElemStreeView streetViewLocation={streetViewLocation} setStreetViewLocation={setStreetViewLocation} />)
      }
    </>
  );
}

export default ElemMap;
