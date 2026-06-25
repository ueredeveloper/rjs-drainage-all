import { useEffect } from 'react';
import geoJson from './plano-piloto-geometrias.json';
import selecao from '../../assets/geojson/plano-piloto-selecao.json';
import { classifyWing, splitWingN, splitWingByLng, splitByLng, splitByLat, toPoints } from './geoUtils';

const ZONE_COLORS = ['#E53935', '#FB8C00', '#F9A825', '#43A047', '#7B1FA2', '#EC407A'];

const E_COLOR = '#FFD600';
const E_ZONES = 2;


export const PILOT_GROUPS = (() => {
  const g = {};
  for (let z = 1; z <= E_ZONES; z++)
    for (let sz = 1; sz <= 2; sz++)
      for (let ssz = 1; ssz <= 2; ssz++)
        for (let sssz = 1; sssz <= 2; sssz++) {
          const delay = (z - 1) * 200 + (sz - 1) * 100 + (ssz - 1) * 50 + (sssz - 1) * 25;
          g[`eixo_${z}_${sz}_${ssz}_${sssz}`] = { label: `${z}.${sz}.${ssz}.${sssz}`, color: E_COLOR, delay };
        }
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

export const PILOT_DEFAULT_KEYS = selecao.selectedKeys;

// visibleKeys: Set<string> opcional — se omitido usa a seleção do JSON
export function usePlanoPilotoLayer(mapInstance, pilotLayersRef, visibleKeys) {
  const vSer = visibleKeys ? Array.from(visibleKeys).sort().join(',') : null;

  useEffect(() => {
    if (!mapInstance) return;
    const visible = visibleKeys ?? new Set(selecao.selectedKeys);
    const DRAW_MS = 4000, TICK_MS = 16;
    const raw = { eixo: [], norte: [], sul: [] };
    (geoJson.features || []).forEach(f => { const w = classifyWing(f.properties || {}); if (w in raw) raw[w].push(f); });
    const nZones = splitWingN(raw.norte, 'norte', 6), sZones = splitWingN(raw.sul, 'sul', 6);
    const eZones = splitWingByLng(raw.eixo, E_ZONES);
    const featureMap = {};
    eZones.forEach((zone, i) => {
      const [sHalf, nHalf] = splitByLat(zone, 'norte');
      [[sHalf, 1], [nHalf, 2]].forEach(([szFeats, sz]) => {
        const [wHalf, eHalf] = splitByLng(szFeats);
        [[wHalf, 1], [eHalf, 2]].forEach(([sszFeats, ssz]) => {
          const [a, b] = splitByLat(sszFeats, 'norte');
          featureMap[`eixo_${i + 1}_${sz}_${ssz}_1`] = a;
          featureMap[`eixo_${i + 1}_${sz}_${ssz}_2`] = b;
        });
      });
    });
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
    Object.keys(PILOT_GROUPS).forEach(key => {
      if (!visible.has(key)) return;
      const { color, delay } = PILOT_GROUPS[key];
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, vSer]);
}
