import { useEffect } from 'react';

const BRASILIA    = { lat: -15.7948528, lng: -47.8831189 };
const CIRCLE_RADIUS = 10000; // 10km

const TEXT_COLOR = '#E1F5FE';
const CIRCLE_OPTIONS = [
  { circle: '#29B6F6', glow: 'rgba(41,182,246,0.55)' },
  { circle: '#EC407A', glow: 'rgba(236,64,122,0.55)' },
  { circle: '#66BB6A', glow: 'rgba(102,187,106,0.55)' },
  { circle: '#FFA726', glow: 'rgba(255,167,38,0.55)' },
  { circle: '#AB47BC', glow: 'rgba(171,71,188,0.55)' },
  { circle: '#26C6DA', glow: 'rgba(38,198,218,0.55)' },
  { circle: '#EF5350', glow: 'rgba(239,83,80,0.55)' },
  { circle: '#FFCA28', glow: 'rgba(255,202,40,0.55)' },
  { circle: '#42A5F5', glow: 'rgba(66,165,245,0.55)' },
  { circle: '#26A69A', glow: 'rgba(38,166,154,0.55)' },
];


function destinationPoint(lat, lng, bearingDeg, distM) {
  const R = 6371000;
  const d = distM / R;
  const b = (bearingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(b));
  const λ2 = λ1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(φ1), Math.cos(d) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: (φ2 * 180) / Math.PI, lng: (λ2 * 180) / Math.PI };
}

function makeCirclePath(center, radiusM, steps = 128) {
  return Array.from({ length: steps + 1 }, (_, i) =>
    destinationPoint(center.lat, center.lng, (i / steps) * 360, radiusM)
  );
}

function makeLetterSvg(char) {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="26" viewBox="-2 -2 24 30">` +
    `<text x="10" y="24"` +
    ` text-anchor="middle"` +
    ` font-family="Impact,'Arial Black',sans-serif"` +
    ` font-size="26"` +
    ` font-style="italic"` +
    ` font-weight="900"` +
    ` fill="${TEXT_COLOR}"` +
    ` stroke="#063A5E"` +
    ` stroke-width="3"` +
    ` stroke-linejoin="round"` +
    ` paint-order="stroke fill">${char}</text>` +
    `</svg>`
  );
}

export function useInitialCircle(mapInstance, introLayersRef) {
  useEffect(() => {
    if (!mapInstance) return;
    const { circle: CIRCLE_COLOR, glow: CIRCLE_GLOW } =
      CIRCLE_OPTIONS[Math.floor(Math.random() * CIRCLE_OPTIONS.length)];

    const dashSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 3,
      strokeColor: CIRCLE_COLOR,
    };

    const circleLine = new window.google.maps.Polyline({
      path: makeCirclePath(BRASILIA, CIRCLE_RADIUS),
      map: mapInstance,
      strokeOpacity: 0, // linha base invisível; só os ícones (dashes) aparecem
      icons: [{ icon: dashSymbol, offset: '0', repeat: '18px' }],
      clickable: false,
    });

    // "SAD/DF" — letras orbitando ao redor do círculo
    const TEXT = 'SAD/DF';
    const ARC_SPAN   = 58;            // graus de arco que o grupo ocupa
    const TEXT_RADIUS = CIRCLE_RADIUS + 900; // 900 m além do círculo

    const letterData = TEXT.split('').map((char, i) => {
      const frac = TEXT.length > 1 ? i / (TEXT.length - 1) : 0.5;
      const initBearing = -ARC_SPAN / 2 + frac * ARC_SPAN;
      const pos = destinationPoint(BRASILIA.lat, BRASILIA.lng, initBearing, TEXT_RADIUS);

      const img = document.createElement('img');
      img.src = makeLetterSvg(char);
      img.style.cssText =
        `width:20px;height:26px;display:block;` +
        `transform:rotate(${initBearing}deg);` +
        `pointer-events:none;user-select:none;` +
        `filter:drop-shadow(0 0 5px ${CIRCLE_GLOW});`;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: pos,
        map: mapInstance,
        content: img,
        zIndex: 50,
      });

      return { marker, img, frac };
    });

    // Loop de animação: ~0.055 grau por frame → órbita completa ≈ 108 s
    let angleOffset = 0;
    const SPEED = 0.055;

    const animateIv = setInterval(() => {
      angleOffset = (angleOffset + SPEED) % 360;

      // Gira o padrão de traços do círculo
      const pct = ((angleOffset / 360) * 100).toFixed(2);
      circleLine.set('icons', [{ icon: dashSymbol, offset: `${pct}%`, repeat: '18px' }]);

      // Reposiciona e rotaciona cada letra
      letterData.forEach(({ marker, img, frac }) => {
        const bearing = angleOffset - ARC_SPAN / 2 + frac * ARC_SPAN;
        marker.position = destinationPoint(BRASILIA.lat, BRASILIA.lng, bearing, TEXT_RADIUS);
        img.style.transform = `rotate(${bearing}deg)`;
      });
    }, 16);

    introLayersRef.current = {
      circleLine,
      markers: letterData.map(l => l.marker),
      animateIv,
    };

    return () => {
      clearInterval(animateIv);
      try { circleLine.setMap(null); } catch (_) {}
      letterData.forEach(({ marker }) => { try { marker.map = null; } catch (_) {} });
      introLayersRef.current = null;
    };
  }, [mapInstance]);
}

