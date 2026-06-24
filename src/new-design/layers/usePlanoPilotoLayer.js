import { useEffect } from 'react';
import geoJson from './plano-piloto-geometrias.json';
import selecao from '../../assets/geojson/plano-piloto-selecao.json';
import { classifyWing, splitWingN, splitByLng, splitByLat, toPoints } from './geoUtils';

const ZONE_COLORS = ['#00E5FF', '#69F0AE', '#FFD740', '#FF6E40', '#EA80FC', '#40C4FF'];

const GROUPS = (() => {
  const g = { eixo: { label: 'Eixo Monumental', color: '#FFD600', delay: 0 } };
  for (let z = 1; z <= 6; z++) {
    const color = ZONE_COLORS[z - 1];
    for (let sz = 1; sz <= 2; sz++)
      for (let ssz = 1; ssz <= 2; ssz++) {
        const delay = 1800 + (z - 1) * 400 + (sz - 1) * 100 + (ssz - 1) * 50;
        for (let sssz = 1; sssz <= 2; sssz++)
          g[`norte_${z}_${sz}_${ssz}_${sssz}`] = { label: `${z}.${sz}.${ssz}.${sssz}`, color, delay: delay + (sssz - 1) * 25 };
        g[`sul_${z}_${sz}_${ssz}`] = { label: `${z}.${sz}.${ssz}`, color, delay };
      }
  }
  return g;
})();

const DEFAULT_VISIBLE = new Set(selecao.selectedKeys);

export function usePlanoPilotoLayer(mapInstance, pilotLayersRef) {
  useEffect(() => {
    if (!mapInstance) return;
    const DRAW_MS = 4000, TICK_MS = 16;
    const raw = { eixo: [], norte: [], sul: [] };
    (geoJson.features || []).forEach(f => { const w = classifyWing(f.properties || {}); if (w in raw) raw[w].push(f); });
    const nZones = splitWingN(raw.norte, 'norte', 6), sZones = splitWingN(raw.sul, 'sul', 6);
    const featureMap = { eixo: raw.eixo };
    nZones.forEach((zone, i) => {
      const [w, e] = splitByLng(zone);
      [[w, 1], [e, 2]].forEach(([szFeats, sz]) => {
        const [inner, outer] = splitByLat(szFeats, 'norte');
        [[inner, 1], [outer, 2]].forEach(([sszFeats, ssz]) => {
          const [a, b] = splitByLng(sszFeats);
          featureMap[`norte_${i + 1}_${sz}_${ssz}_1`] = a;
          featureMap[`norte_${i + 1}_${sz}_${ssz}_2`] = b;
        });
      });
    });
    sZones.forEach((zone, i) => {
      const [w, e] = splitByLng(zone);
      const [wIn, wOut] = splitByLat(w, 'sul'); const [eIn, eOut] = splitByLat(e, 'sul');
      featureMap[`sul_${i + 1}_1_1`] = wIn; featureMap[`sul_${i + 1}_1_2`] = wOut;
      featureMap[`sul_${i + 1}_2_1`] = eIn; featureMap[`sul_${i + 1}_2_2`] = eOut;
    });
    const polylines = [], timers = [], intervals = [];
    Object.keys(GROUPS).forEach(key => {
      if (!DEFAULT_VISIBLE.has(key)) return;
      const { color, delay } = GROUPS[key];
      const points = toPoints(featureMap[key] || []);
      if (!points.length) return;
      timers.push(setTimeout(() => {
        const line = new window.google.maps.Polyline({ path: [], map: mapInstance, strokeColor: color, strokeWeight: 1.8, strokeOpacity: 0.9, clickable: false });
        polylines.push(line);
        const path = line.getPath();
        const batchSize = Math.max(1, Math.ceil(points.length / (DRAW_MS / TICK_MS)));
        let idx = 0;
        const iv = setInterval(() => {
          const end = Math.min(idx + batchSize, points.length);
          for (; idx < end; idx++) path.push(new window.google.maps.LatLng(points[idx].lat, points[idx].lng));
          if (idx >= points.length) {
            clearInterval(iv); line.setMap(null);
            const layer = new window.google.maps.Data({ map: mapInstance });
            layer.addGeoJson({ type: 'FeatureCollection', features: featureMap[key] });
            layer.setStyle({ fillColor: color, fillOpacity: 0.22, strokeColor: color, strokeWeight: 1.5, strokeOpacity: 0.85 });
            pilotLayersRef.current[key] = layer;
          }
        }, TICK_MS);
        intervals.push(iv);
      }, delay));
    });
    return () => {
      timers.forEach(clearTimeout); intervals.forEach(clearInterval);
      polylines.forEach(l => { try { l.setMap(null); } catch (_) {} });
      Object.values(pilotLayersRef.current).forEach(l => { try { l.setMap(null); } catch (_) {} });
      pilotLayersRef.current = {};
    };
  }, [mapInstance]);
}
