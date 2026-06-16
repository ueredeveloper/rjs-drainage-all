import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchShape } from '../services/shapes';
import {
  fetchAdministrativeRegions,
  fetchAddressByKeyword,
  fetchAddressesByPosition,
  fetchSuplySystemByPosition,
} from '../services/connection';

const LAYER_GROUPS = [
  {
    group: 'Superficial',
    layers: [
      { id: 'bacias_hidrograficas',   label: 'Bacias Hidrográficas',   color: '#1565c0' },
      { id: 'unidades_hidrograficas', label: 'Unidades Hidrográficas', color: '#0288d1' },
    ],
  },
  {
    group: 'Subterrânea',
    layers: [
      { id: 'hidrogeo_fraturado', label: 'Fraturado', color: '#6a1b9a' },
      { id: 'hidrogeo_poroso',    label: 'Poroso',    color: '#f57f17' },
    ],
  },
  {
    group: 'CAESB',
    layers: [
      { id: 'caesb_estacoes', label: 'Estações', color: '#2e7d32' },
    ],
  },
  {
    group: 'Geoportal',
    layers: [
      { id: 'enderecos',               label: 'Endereços',               color: '#e65100' },
      { id: 'regioes_administrativas', label: 'Regiões Administrativas', color: '#880e4f' },
    ],
  },
];

// Layers that receive per-feature random fill colors
const COLORED_LAYERS = new Set([
  'bacias_hidrograficas', 'unidades_hidrograficas',
  'hidrogeo_fraturado', 'hidrogeo_poroso', 'regioes_administrativas',
]);

// Layers loaded by map position + radius instead of full GeoJSON
const POSITION_LAYERS = new Set(['enderecos', 'caesb_estacoes']);

// Layers that support "Cálculo de Uso" (color by pct_utilizada)
const WATER_USE_LAYERS = new Set(['hidrogeo_fraturado', 'hidrogeo_poroso']);

const METERS_OPTIONS = [200, 500, 1000, 3000, 5000];

// Perceptually distinct palette for feature fills
const PALETTE = [
  '#1e88e5', '#e53935', '#43a047', '#fb8c00', '#8e24aa',
  '#00acc1', '#f06292', '#558b2f', '#5e35b1', '#00897b',
  '#d81b60', '#039be5', '#7cb342', '#ffb300', '#c62828',
  '#6d4c41', '#546e7a', '#0277bd', '#2e7d32', '#ad1457',
];

function getFeatureColor(idx) {
  return PALETTE[idx % PALETTE.length];
}

function colorByPercentage(pct) {
  if (pct <= 10) return '#4cc94c';
  if (pct <= 25) return '#007c00';
  if (pct <= 50) return '#004700';
  if (pct <= 75) return '#FFD32C';
  if (pct <= 90) return '#FF2C2C';
  return '#F200FF';
}

// GeoJSON geometry → { type:'polygon', points:[[lng,lat],...] }
function geoJsonGeometryToShape(geometry) {
  if (!geometry) return null;
  let ring;
  if (geometry.type === 'Polygon') ring = geometry.coordinates?.[0];
  else if (geometry.type === 'MultiPolygon') ring = geometry.coordinates?.[0]?.[0];
  else return null;
  if (!ring || ring.length < 3) return null;
  const pts = ring.map(c => [c[0], c[1]]);
  if (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) pts.push(pts[0]);
  return { type: 'polygon', points: pts };
}

// GMaps Data.Feature geometry → { type:'polygon', points }
function gmapsFeatureToShape(feature) {
  const geo = feature.getGeometry();
  if (!geo) return null;
  const t = geo.getType();
  let ring;
  if (t === 'Polygon') ring = geo.getArray()[0];
  else if (t === 'MultiPolygon') ring = geo.getArray()?.[0]?.getArray()?.[0];
  else return null;
  if (!ring) return null;
  const pts = ring.getArray().map(ll => [ll.lng(), ll.lat()]);
  if (pts.length < 3) return null;
  return { type: 'polygon', points: [...pts, pts[0]] };
}

function gmapsFeatureProps(feature) {
  const props = {};
  feature.forEachProperty((v, k) => { props[k] = v; });
  return props;
}

const SKIP_KEYS = new Set(['shape', 'SHAPE', 'Shape', 'objectid', 'OBJECTID', 'FID', 'fid', 'GlobalID', 'globalid']);

function formatProps(props) {
  return Object.entries(props || {})
    .filter(([k, v]) =>
      !SKIP_KEYS.has(k) &&
      typeof v !== 'object' &&
      v !== null &&
      v !== undefined &&
      String(v).trim() !== ''
    )
    .slice(0, 8);
}

function buildFeatureHtml(props, layerLabel, color, showSearch) {
  const rows = formatProps(props);
  const searchBtn = showSearch ? `
    <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e0e0e0;text-align:center;">
      <button
        onclick="window.__layerPanelSearch()"
        style="display:inline-flex;align-items:center;gap:5px;padding:5px 14px;
               background:${color};color:#fff;border:none;border-radius:4px;cursor:pointer;
               font-size:11px;font-weight:600;font-family:Roboto,Arial,sans-serif;"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        Pesquisar Outorgas
      </button>
    </div>` : '';

  return `
    <div style="font-family:Roboto,Arial,sans-serif;min-width:190px;max-width:260px;">
      <div style="font-weight:700;font-size:12px;color:#1a237e;
                  border-bottom:2px solid ${color};padding-bottom:4px;margin-bottom:5px;">
        ${layerLabel}
      </div>
      ${rows.length > 0
        ? `<table style="width:100%;font-size:11px;border-collapse:collapse;line-height:1.7;">
            ${rows.map(([k, v]) => `<tr>
              <td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;font-weight:500;">${k}</td>
              <td style="color:#263238;">${v}</td>
            </tr>`).join('')}
          </table>`
        : '<div style="font-size:11px;color:#78909c;padding:2px 0;">Sem propriedades</div>'
      }
      ${searchBtn}
    </div>`;
}

// ESRI FeatureCollection (features[].{attributes, geometry:{x,y}}) → GeoJSON points
function esriToGeoJSONPoints(esriResult) {
  return {
    type: 'FeatureCollection',
    features: (esriResult?.features || []).map((f, i) => ({
      type: 'Feature',
      id: i,
      properties: f.attributes || {},
      geometry: { type: 'Point', coordinates: [f.geometry?.x, f.geometry?.y] },
    })),
  };
}

// fetchAddressByKeyword result → GeoJSON points
function keywordResultsToGeoJSON(results) {
  return {
    type: 'FeatureCollection',
    features: (results || []).map((r, i) => {
      const { geometry, ...props } = r;
      return {
        type: 'Feature',
        id: i,
        properties: props,
        geometry: { type: 'Point', coordinates: [geometry?.x, geometry?.y] },
      };
    }),
  };
}

async function fetchLayerGeoJSON(id) {
  if (id === 'regioes_administrativas') {
    const raw = await fetchAdministrativeRegions();
    return {
      type: 'FeatureCollection',
      features: (raw.features || []).map((f, i) => ({
        type: 'Feature',
        id: i,
        properties: f.attributes || {},
        geometry: { type: 'Polygon', coordinates: f.geometry?.rings ?? [] },
      })),
    };
  }
  if (POSITION_LAYERS.has(id)) {
    return { type: 'FeatureCollection', features: [] };
  }
  const raw = await fetchShape(id);
  return {
    type: 'FeatureCollection',
    features: (raw || []).map((sh, i) => ({
      type: 'Feature',
      id: i,
      properties: sh,
      geometry: sh.shape,
    })),
  };
}

const ALL_LAYERS = LAYER_GROUPS.flatMap(g => g.layers);

export default function LayerPanel({ map, mapType = 'gmaps', onFeatureSearch, onWaterUseChange }) {
  const [open, setOpen]               = useState(false);
  const [active, setActive]           = useState(new Set());
  const [loading, setLoading]         = useState(new Set());
  const [addressKeyword, setAddressKeyword] = useState('');
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [metersMap, setMetersMap]     = useState({ enderecos: 500, caesb_estacoes: 500 });
  const [waterUseMap, setWaterUseMap] = useState({ hidrogeo_fraturado: false, hidrogeo_poroso: false });
  const [openGroups, setOpenGroups]   = useState(new Set());

  const panelRef        = useRef(null);
  const dataLayersRef   = useRef(new Map());
  const cacheRef        = useRef(new Map());
  const colorCacheRef   = useRef(new Map());
  const infoWinRef      = useRef(null);
  const pendingShapeRef = useRef(null);
  const keywordLayerRef = useRef(null);
  const styleFnsRef     = useRef(new Map()); // Map<id, {gmaps, leaflet}>
  const onSearchRef        = useRef(onFeatureSearch);
  onSearchRef.current      = onFeatureSearch;
  const onWaterUseRef      = useRef(onWaterUseChange);
  onWaterUseRef.current    = onWaterUseChange;
  const waterUseMapRef     = useRef(waterUseMap);
  waterUseMapRef.current   = waterUseMap;

  useEffect(() => {
    window.__layerPanelSearch = () => {
      if (pendingShapeRef.current) onSearchRef.current?.(pendingShapeRef.current);
    };
    return () => { delete window.__layerPanelSearch; };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    return () => {
      dataLayersRef.current.forEach(dl => {
        if (mapType === 'gmaps') { try { dl.setMap(null); } catch (_) {} }
        else { try { if (map && map.hasLayer(dl)) map.removeLayer(dl); } catch (_) {} }
      });
      if (keywordLayerRef.current) {
        if (mapType === 'gmaps') { try { keywordLayerRef.current.setMap(null); } catch (_) {} }
        else { try { if (map && map.hasLayer(keywordLayerRef.current)) map.removeLayer(keywordLayerRef.current); } catch (_) {} }
      }
    };
  }, [map, mapType]);

  // Re-applies styles when waterUseMap changes for already-loaded layers
  useEffect(() => {
    WATER_USE_LAYERS.forEach(id => {
      const dl  = dataLayersRef.current.get(id);
      const fns = styleFnsRef.current.get(id);
      if (!dl || !fns) return;
      if (mapType === 'gmaps') dl.setStyle(fns.gmaps);
      else { try { dl.setStyle(fns.leaflet); } catch (_) {} }
    });
  }, [waterUseMap, mapType]);

  const handleWaterUseToggle = useCallback((id) => {
    setWaterUseMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      onWaterUseRef.current?.(Object.values(next).some(Boolean));
      return next;
    });
  }, []);

  const getMapCenter = useCallback(() => {
    if (!map) return null;
    if (mapType === 'gmaps') {
      const c = map.getCenter();
      return { lat: c.lat(), lng: c.lng() };
    }
    const c = map.getCenter();
    return { lat: c.lat, lng: c.lng };
  }, [map, mapType]);

  // Creates and registers a point-style Data layer on the map
  const loadPositionLayer = useCallback(async (id, color, meters) => {
    const layerDef = ALL_LAYERS.find(l => l.id === id);
    const center = getMapCenter();
    if (!center) return;

    // Remove previous layer for this id
    const existing = dataLayersRef.current.get(id);
    if (existing) {
      if (mapType === 'gmaps') { try { existing.setMap(null); } catch (_) {} }
      else { try { if (map && map.hasLayer(existing)) map.removeLayer(existing); } catch (_) {} }
    }

    const gmapsPointStyle = () => ({
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 5, fillColor: color, fillOpacity: 0.85,
        strokeColor: '#fff', strokeWeight: 1.5,
      },
    });

    let dl;
    if (mapType === 'gmaps') {
      dl = new window.google.maps.Data({ map });
      dl.setStyle(gmapsPointStyle);
      dl.addListener('click', (event) => {
        const props = gmapsFeatureProps(event.feature);
        pendingShapeRef.current = null;
        if (!infoWinRef.current) infoWinRef.current = new window.google.maps.InfoWindow();
        infoWinRef.current.setContent(buildFeatureHtml(props, layerDef?.label ?? id, color, false));
        infoWinRef.current.setPosition(event.latLng);
        infoWinRef.current.open(map);
      });
    } else {
      const L = (await import('leaflet')).default;
      dl = L.geoJSON(null, {
        pointToLayer: (_feature, latlng) => L.circleMarker(latlng, {
          radius: 5, fillColor: color, fillOpacity: 0.85,
          color: '#fff', weight: 1.5, opacity: 1,
        }),
        onEachFeature: (feature, layer) => {
          layer.on('click', (e) => {
            pendingShapeRef.current = null;
            L.DomEvent.stopPropagation(e);
            L.popup({ maxWidth: 300, closeButton: true })
              .setLatLng(e.latlng)
              .setContent(buildFeatureHtml(feature.properties, layerDef?.label ?? id, color, false))
              .openOn(map);
          });
        },
      });
      if (map) dl.addTo(map);
    }
    dataLayersRef.current.set(id, dl);

    setLoading(prev => new Set([...prev, id]));
    try {
      const position = { ...center, meters };
      let esriResult;
      if (id === 'enderecos')       esriResult = await fetchAddressesByPosition(position);
      else if (id === 'caesb_estacoes') esriResult = await fetchSuplySystemByPosition(position);

      const gj = esriToGeoJSONPoints(esriResult);
      if (mapType === 'gmaps') { dl.addGeoJson(gj); dl.setStyle(gmapsPointStyle); }
      else { dl.addData(gj); }
    } catch (err) {
      console.error('[LayerPanel] erro ao carregar posição', id, err);
    } finally {
      setLoading(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [map, mapType, getMapCenter]);

  const toggle = useCallback(async (id, color) => {
    const layerDef = ALL_LAYERS.find(l => l.id === id);

    if (active.has(id)) {
      setActive(prev => { const s = new Set(prev); s.delete(id); return s; });
      const dl = dataLayersRef.current.get(id);
      if (dl) {
        if (mapType === 'gmaps') { try { dl.setMap(null); } catch (_) {} }
        else { try { if (map) map.removeLayer(dl); } catch (_) {} }
      }
      if (WATER_USE_LAYERS.has(id)) {
        setWaterUseMap(prev => {
          const next = { ...prev, [id]: false };
          onWaterUseRef.current?.(Object.values(next).some(Boolean));
          return next;
        });
      }
      return;
    }

    setActive(prev => new Set([...prev, id]));

    // Position layers always fetch fresh by map center
    if (POSITION_LAYERS.has(id)) {
      await loadPositionLayer(id, color, metersMap[id]);
      return;
    }

    const existing = dataLayersRef.current.get(id);
    if (existing) {
      if (mapType === 'gmaps') { try { existing.setMap(map); } catch (_) {} }
      else { try { if (map && !map.hasLayer(existing)) existing.addTo(map); } catch (_) {} }
      return;
    }

    const gmapsStyleFn = (feature) => {
      if (WATER_USE_LAYERS.has(id) && waterUseMapRef.current[id]) {
        const pct = feature.getProperty('pct_utilizada') ?? 0;
        const fColor = colorByPercentage(pct);
        return { strokeColor: '#fff', strokeWeight: 2, strokeOpacity: 0.8, fillColor: fColor, fillOpacity: 0.45 };
      }
      const fIdx   = typeof feature.getId() === 'number' ? feature.getId() : 0;
      const colors = colorCacheRef.current.get(id);
      const fColor = COLORED_LAYERS.has(id) ? (colors?.[fIdx] ?? getFeatureColor(fIdx)) : color;
      return { strokeColor: fColor, strokeWeight: 1.5, strokeOpacity: 0.85, fillColor: fColor, fillOpacity: 0.18 };
    };

    const leafletStyleFn = (feature) => {
      if (WATER_USE_LAYERS.has(id) && waterUseMapRef.current[id]) {
        const pct = feature?.properties?.pct_utilizada ?? 0;
        const fColor = colorByPercentage(pct);
        return { color: '#fff', weight: 2, opacity: 0.8, fillColor: fColor, fillOpacity: 0.45 };
      }
      const fIdx   = feature?.id ?? 0;
      const colors = colorCacheRef.current.get(id);
      const fColor = COLORED_LAYERS.has(id) ? (colors?.[fIdx] ?? getFeatureColor(fIdx)) : color;
      return { color: fColor, weight: 1.5, opacity: 0.85, fillColor: fColor, fillOpacity: 0.18 };
    };

    styleFnsRef.current.set(id, { gmaps: gmapsStyleFn, leaflet: leafletStyleFn });

    let dl;
    if (mapType === 'gmaps') {
      dl = new window.google.maps.Data({ map });
      dl.setStyle(gmapsStyleFn);

      dl.addListener('click', (event) => {
        const feature = event.feature;
        const props   = gmapsFeatureProps(feature);
        const shape   = gmapsFeatureToShape(feature);
        const fIdx    = typeof feature.getId() === 'number' ? feature.getId() : 0;
        const colors  = colorCacheRef.current.get(id);
        const fColor  = COLORED_LAYERS.has(id) ? (colors?.[fIdx] ?? getFeatureColor(fIdx)) : color;

        pendingShapeRef.current = shape;

        if (!infoWinRef.current) {
          infoWinRef.current = new window.google.maps.InfoWindow();
        }
        infoWinRef.current.setContent(
          buildFeatureHtml(props, layerDef?.label ?? id, fColor, !!shape && !!onSearchRef.current)
        );
        infoWinRef.current.setPosition(event.latLng);
        infoWinRef.current.open(map);
      });

    } else {
      const L = (await import('leaflet')).default;
      dl = L.geoJSON(null, {
        style: leafletStyleFn,
        onEachFeature: (feature, layer) => {
          layer.on('click', (e) => {
            const shape  = geoJsonGeometryToShape(feature.geometry);
            const fIdx   = feature.id ?? 0;
            const colors = colorCacheRef.current.get(id);
            const fColor = COLORED_LAYERS.has(id) ? (colors?.[fIdx] ?? getFeatureColor(fIdx)) : color;

            pendingShapeRef.current = shape;

            L.DomEvent.stopPropagation(e);
            L.popup({ maxWidth: 300, closeButton: true })
              .setLatLng(e.latlng)
              .setContent(buildFeatureHtml(feature.properties, layerDef?.label ?? id, fColor, !!shape && !!onSearchRef.current))
              .openOn(map);
          });
        },
      });
      if (map) dl.addTo(map);
    }
    dataLayersRef.current.set(id, dl);

    if (cacheRef.current.has(id)) {
      const cached = cacheRef.current.get(id);
      if (mapType === 'gmaps') { dl.addGeoJson(cached); dl.setStyle(gmapsStyleFn); }
      else { dl.addData(cached); dl.setStyle(leafletStyleFn); }
      return;
    }

    setLoading(prev => new Set([...prev, id]));
    try {
      const gj = await fetchLayerGeoJSON(id);

      if (COLORED_LAYERS.has(id) && gj.features.length > 0) {
        colorCacheRef.current.set(id, gj.features.map((_, i) => getFeatureColor(i)));
      }

      cacheRef.current.set(id, gj);
      if (mapType === 'gmaps') {
        dl.addGeoJson(gj);
        dl.setStyle(gmapsStyleFn);
      } else {
        dl.addData(gj);
        dl.setStyle(leafletStyleFn);
      }
    } catch (err) {
      console.error('[LayerPanel] erro ao carregar', id, err);
    } finally {
      setLoading(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [active, map, mapType, metersMap, loadPositionLayer]);

  const handleMetersChange = useCallback(async (id, color, newMeters) => {
    setMetersMap(prev => ({ ...prev, [id]: newMeters }));
    if (active.has(id)) {
      await loadPositionLayer(id, color, newMeters);
    }
  }, [active, loadPositionLayer]);

  const handleKeywordSearch = useCallback(async (color) => {
    const kw = addressKeyword.trim();
    if (!kw) return;

    if (keywordLayerRef.current) {
      if (mapType === 'gmaps') { try { keywordLayerRef.current.setMap(null); } catch (_) {} }
      else { try { if (map && map.hasLayer(keywordLayerRef.current)) map.removeLayer(keywordLayerRef.current); } catch (_) {} }
      keywordLayerRef.current = null;
    }

    setKeywordLoading(true);
    try {
      const results = await fetchAddressByKeyword(kw);
      const gj = keywordResultsToGeoJSON(results);

      if (mapType === 'gmaps') {
        const dl = new window.google.maps.Data({ map });
        const styleFn = () => ({
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 5, fillColor: color, fillOpacity: 0.9,
            strokeColor: '#fff', strokeWeight: 1.5,
          },
        });
        dl.setStyle(styleFn);
        dl.addListener('click', (event) => {
          const props = gmapsFeatureProps(event.feature);
          pendingShapeRef.current = null;
          if (!infoWinRef.current) infoWinRef.current = new window.google.maps.InfoWindow();
          infoWinRef.current.setContent(buildFeatureHtml(props, 'Endereços', color, false));
          infoWinRef.current.setPosition(event.latLng);
          infoWinRef.current.open(map);
        });
        dl.addGeoJson(gj);
        keywordLayerRef.current = dl;
      } else {
        const L = (await import('leaflet')).default;
        const dl = L.geoJSON(gj, {
          pointToLayer: (_feature, latlng) => L.circleMarker(latlng, {
            radius: 5, fillColor: color, fillOpacity: 0.9,
            color: '#fff', weight: 1.5, opacity: 1,
          }),
          onEachFeature: (feature, layer) => {
            layer.on('click', (e) => {
              pendingShapeRef.current = null;
              L.DomEvent.stopPropagation(e);
              L.popup({ maxWidth: 300, closeButton: true })
                .setLatLng(e.latlng)
                .setContent(buildFeatureHtml(feature.properties, 'Endereços', color, false))
                .openOn(map);
            });
          },
        });
        if (map) dl.addTo(map);
        keywordLayerRef.current = dl;
      }
    } catch (err) {
      console.error('[LayerPanel] erro na busca por keyword', err);
    } finally {
      setKeywordLoading(false);
    }
  }, [addressKeyword, map, mapType]);

  return (
    <div
      ref={panelRef}
      style={{ position: 'relative', margin: '0', fontFamily: 'Roboto, Arial, sans-serif', zIndex: 9999 }}
    >
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
          padding: '0', background: '#fff', border: '1px solid #ccc',
          borderRadius: 2, boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
          cursor: 'pointer', fontSize: 12, color: '#333', fontWeight: 600,
          whiteSpace: 'nowrap', width: 30, height: 30,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#555">
          <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
        </svg>
        {active.size > 0 && (
          <span style={{
            background: '#1565c0', color: '#fff', borderRadius: '50%',
            width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>
            {active.size}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)', right: 0,
          background: '#fff', borderRadius: 6,
          boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
          minWidth: 230, overflow: 'hidden',
          zIndex: 1000,
        }}>
          {LAYER_GROUPS.map(({ group, layers }) => {
            const isGroupOpen  = openGroups.has(group);
            const groupActive  = layers.filter(l => active.has(l.id)).length;
            return (
            <div key={group} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {/* Accordion header */}
              <div
                onClick={() => setOpenGroups(prev => {
                  const next = new Set(prev);
                  if (next.has(group)) next.delete(group); else next.add(group);
                  return next;
                })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px', cursor: 'pointer',
                  userSelect: 'none',
                  background: isGroupOpen ? '#f5f7ff' : '#fff',
                  transition: 'background 0.15s',
                }}
              >
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="#78909c"
                  style={{ flexShrink: 0, transform: isGroupOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
                <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: '#546e7a', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  {group}
                </span>
                {groupActive > 0 && (
                  <span style={{
                    background: '#1565c0', color: '#fff', borderRadius: '50%',
                    width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, flexShrink: 0,
                  }}>
                    {groupActive}
                  </span>
                )}
              </div>

              {/* Accordion body */}
              {isGroupOpen && layers.map(({ id, label, color }) => {
                const isActive   = active.has(id);
                const isLoading  = loading.has(id);
                const isPosition = POSITION_LAYERS.has(id);

                return (
                  <div key={id}>
                    {/* Keyword text search — only for enderecos */}
                    {id === 'enderecos' && (
                      <div style={{ padding: '5px 12px 2px', display: 'flex', gap: 4 }}>
                        <input
                          type="text"
                          placeholder="Buscar endereço..."
                          value={addressKeyword}
                          onChange={e => setAddressKeyword(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleKeywordSearch(color)}
                          style={{
                            flex: 1, fontSize: 11, padding: '3px 6px',
                            border: '1px solid #ccc', borderRadius: 3, outline: 'none',
                            fontFamily: 'Roboto, Arial, sans-serif',
                          }}
                        />
                        <button
                          onClick={() => handleKeywordSearch(color)}
                          disabled={keywordLoading || !addressKeyword.trim()}
                          title="Pesquisar endereço por nome"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '3px 7px', background: color, color: '#fff',
                            border: 'none', borderRadius: 3,
                            cursor: keywordLoading || !addressKeyword.trim() ? 'default' : 'pointer',
                            opacity: keywordLoading || !addressKeyword.trim() ? 0.5 : 1,
                            flexShrink: 0,
                          }}
                        >
                          {keywordLoading
                            ? <span className="lp-spin" style={{
                                width: 10, height: 10, display: 'block',
                                border: '2px solid #fff', borderTopColor: 'transparent',
                                borderRadius: '50%',
                              }} />
                            : <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                              </svg>
                          }
                        </button>
                      </div>
                    )}

                    {/* Checkbox row */}
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px', cursor: 'pointer',
                        fontSize: 12.5, color: '#263238',
                        background: isActive ? `${color}18` : 'transparent',
                      }}
                      onClick={() => toggle(id, color)}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        disabled={isLoading}
                        onChange={() => {}}
                        onClick={e => { e.stopPropagation(); if (!isLoading) toggle(id, color); }}
                        style={{ accentColor: color, width: 13, height: 13, flexShrink: 0, cursor: 'pointer' }}
                      />
                      <span style={{ flex: 1 }}>{label}</span>

                      {/* Meters selector for position-based layers */}
                      {isPosition && (
                        <select
                          value={metersMap[id]}
                          onChange={e => handleMetersChange(id, color, Number(e.target.value))}
                          onClick={e => e.stopPropagation()}
                          style={{
                            fontSize: 10, padding: '1px 2px',
                            border: '1px solid #ccc', borderRadius: 2,
                            background: '#fff', cursor: 'pointer',
                            fontFamily: 'Roboto, Arial, sans-serif', flexShrink: 0,
                          }}
                        >
                          {METERS_OPTIONS.map(m => (
                            <option key={m} value={m}>{m}m</option>
                          ))}
                        </select>
                      )}

                      {isLoading
                        ? <span className="lp-spin" style={{
                            width: 12, height: 12, flexShrink: 0,
                            border: `2px solid ${color}`, borderTopColor: 'transparent',
                            borderRadius: '50%',
                          }} />
                        : <span style={{
                            width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                            background: color, opacity: isActive ? 0.9 : 0.25,
                          }} />
                      }
                    </div>

                    {/* Cálculo de Uso — only for hidrogeo layers */}
                    {WATER_USE_LAYERS.has(id) && (
                      <div style={{ paddingLeft: 33, paddingRight: 12, paddingBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          role="switch"
                          aria-checked={waterUseMap[id]}
                          onClick={() => handleWaterUseToggle(id)}
                          style={{
                            position: 'relative', width: 28, height: 15, borderRadius: 8,
                            cursor: 'pointer', flexShrink: 0,
                            background: waterUseMap[id] ? '#4caf50' : '#bdbdbd',
                            transition: 'background 0.2s',
                          }}
                        >
                          <div style={{
                            position: 'absolute', top: 1.5,
                            left: waterUseMap[id] ? 14 : 1.5,
                            width: 12, height: 12, borderRadius: '50%', background: '#fff',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#546e7a', fontStyle: 'italic' }}>Cálculo de Uso</span>
                        {waterUseMap[id] && (
                          <div style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
                            {[['≤10%','#4cc94c'],['≤25%','#007c00'],['≤50%','#004700'],['≤75%','#FFD32C'],['≤90%','#FF2C2C'],['>90%','#F200FF']].map(([lbl, col]) => (
                              <span key={lbl} title={lbl} style={{ width: 8, height: 8, borderRadius: 2, background: col, display: 'inline-block', flexShrink: 0 }} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
          })}
        </div>
      )}
      <style>{`@keyframes lp-spin{to{transform:rotate(360deg)}}.lp-spin{animation:lp-spin .8s linear infinite}`}</style>

      {mapType === 'gmaps' && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          padding: '6px 0',
        }}>
          <button
            onClick={() => map.setZoom(map.getZoom() + 1)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, padding: 0,
              background: '#fff', border: '1px solid #ccc', borderRadius: 2,
              boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
              cursor: 'pointer', color: '#555', fontWeight: 600,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.target.style.background = '#f5f5f5'; }}
            onMouseLeave={(e) => { e.target.style.background = '#fff'; }}
            title="Aumentar zoom"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          <button
            onClick={() => map.setZoom(map.getZoom() - 1)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, padding: 0,
              background: '#fff', border: '1px solid #ccc', borderRadius: 2,
              boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
              cursor: 'pointer', color: '#555', fontWeight: 600,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.target.style.background = '#f5f5f5'; }}
            onMouseLeave={(e) => { e.target.style.background = '#fff'; }}
            title="Diminuir zoom"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
