import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchShape, fetchRiversByCoordinates } from '../services/shapes';
import { useFontSize } from './FontSizeProvider';
import {
  fetchAdministrativeRegions,
  fetchAddressByKeyword,
  fetchAddressesByPosition,
  fetchSuplySystemByPosition,
} from '../services/connection';
import { convertGeometryToGmaps, getPolygonEsriCentroid } from '../tools';


const LAYER_GROUPS = [
  {
    group: 'Superficial',
    layers: [
      { id: 'bacias_hidrograficas',   label: 'Bacias Hidrográficas',   color: '#1565c0' },
      { id: 'unidades_hidrograficas', label: 'Unidades Hidrográficas', color: '#0288d1' },
      { id: 'rios_df',                label: 'Rios do DF',              color: '#29b6f6' },
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
      { id: 'enderecos',               label: 'Endereços',               color: '#e53935' },
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
const MARKER_POSITION_LAYERS = new Set(['rios_df']);

// Layers that support "Cálculo de Uso" (color by pct_utilizada)
const WATER_USE_LAYERS = new Set(['hidrogeo_fraturado', 'hidrogeo_poroso']);

// Fields that should appear first and in bold in the infowindow, per layer id
const LAYER_FIELD_CONFIG = {
  unidades_hidrograficas: { bold: new Set(['uh_nome', 'uh_label']) },
  bacias_hidrograficas:   { bold: new Set(['bacia_nome', 'bacia_cod']) },
  hidrogeo_fraturado:     { bold: new Set(['sistema', 'subsistema', 'cod_plan']) },
  hidrogeo_poroso:        { bold: new Set(['sistema', 'cod_plan']) },
  rios_df:                { bold: new Set(['nome', 'noriocor', 'norioprinci', 'nome_rio']) },
};

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

function formatProps(props, priorityKeys = []) {
  const entries = Object.entries(props || {})
    .filter(([k, v]) =>
      !SKIP_KEYS.has(k) &&
      typeof v !== 'object' &&
      v !== null &&
      v !== undefined &&
      String(v).trim() !== ''
    );
  if (!priorityKeys.length) return entries.slice(0, 8);
  const prioritySet = new Set(priorityKeys);
  const priorityEntries = priorityKeys
    .map(k => [k, props?.[k]])
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');
  const rest = entries.filter(([k]) => !prioritySet.has(k));
  return [...priorityEntries, ...rest].slice(0, 8);
}

function buildFeatureHtml(props, layerLabel, color, showSearch, pctUtilizada = null, boldKeys = null) {
  const priorityKeys = boldKeys ? [...boldKeys] : [];
  const rows = formatProps(props, priorityKeys).filter(([k]) => pctUtilizada !== null ? k !== 'pct_utilizada' : true);

  const usageBar = pctUtilizada !== null ? (() => {
    const pct = pctUtilizada;
    const barColor = colorByPercentage(pct);
    const pctFmt = pct.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `
      <div style="margin-bottom:7px;padding-bottom:6px;border-bottom:1px solid #e0e0e0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <span style="font-size:10px;color:#78909c;font-weight:500;text-transform:uppercase;letter-spacing:.5px;">% de uso</span>
          <span style="font-size:13px;font-weight:700;color:${barColor};">${pctFmt}%</span>
        </div>
        <div style="height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${Math.min(pct, 100)}%;background:${barColor};border-radius:3px;"></div>
        </div>
      </div>`;
  })() : '';

  const searchBtn = showSearch ? `
    <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e0e0e0;text-align:center;">
      <style>.lp-feat-btn{transition:filter .15s,transform .1s}.lp-feat-btn:hover{filter:brightness(.84)}.lp-feat-btn:active{filter:brightness(.7);transform:scale(.97)}</style>
      <button
        onclick="window.__layerPanelSearch()"
        class="lp-feat-btn"
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
      ${usageBar}
      ${rows.length > 0
        ? `<table style="width:100%;font-size:11px;border-collapse:collapse;line-height:1.7;">
            ${rows.map(([k, v]) => {
              const b = boldKeys?.has(k);
              return `<tr>
                <td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;font-weight:${b ? '700' : '500'};">${k}</td>
                <td style="color:#263238;font-weight:${b ? '700' : '400'};">${v}</td>
              </tr>`;
            }).join('')}
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

// ESRI Polygon FeatureCollection (features[].{attributes, geometry:{rings:[[[lng,lat]...]]}}) → GeoJSON polygons
function esriToGeoJSONPolygons(esriResult) {
  return {
    type: 'FeatureCollection',
    features: (esriResult?.features || []).map((f, i) => ({
      type: 'Feature',
      id: i,
      properties: f.attributes || {},
      geometry: { type: 'Polygon', coordinates: f.geometry?.rings ?? [] },
    })),
  };
}

// ESRI Polyline FeatureCollection (features[].{attributes, geometry:{paths:[[[lng,lat]...]]}}) → GeoJSON LineString
function esriToGeoJSONPolylines(esriResult) {
  return {
    type: 'FeatureCollection',
    features: (esriResult?.features || [])
      .map((f, i) => ({
        type: 'Feature',
        id: i,
        properties: f.attributes || {},
        geometry: { type: 'LineString', coordinates: f.geometry?.paths?.[0] || [] },
      }))
      .filter(f => f.geometry.coordinates.length >= 2),
  };
}

// Normaliza resposta de fetchRiversByCoordinates (GeoJSON ou ESRI) → GeoJSON FeatureCollection de LineStrings
function normalizeRiversGeoJSON(raw) {
  if (!raw) return { type: 'FeatureCollection', features: [] };
  if (raw.type === 'FeatureCollection') return raw;
  if (Array.isArray(raw?.features) && raw.features[0]?.geometry?.paths !== undefined) {
    return esriToGeoJSONPolylines(raw);
  }
  if (Array.isArray(raw)) {
    return {
      type: 'FeatureCollection',
      features: raw.map((f, i) => {
        const geom = f.geometry?.paths
          ? { type: 'LineString', coordinates: f.geometry.paths[0] ?? [] }
          : f.geometry;
        return { type: 'Feature', id: i, properties: f.attributes ?? f.properties ?? {}, geometry: geom };
      }).filter(f => Array.isArray(f.geometry?.coordinates) && f.geometry.coordinates.length >= 2),
    };
  }
  return { type: 'FeatureCollection', features: [] };
}

const CAESB_ICON_PATH = `M100.577,223.936c14.221,0,25.754,11.533,25.754,25.754s-11.533,25.754-25.754,25.754c-14.221,0-25.754-11.533-25.754-25.754S86.356,223.936,100.577,223.936L100.577,223.936zM103.605,179.88c39.309,0,71.157,31.848,71.157,71.157c0,6.335-0.833,12.474-2.386,18.32c0.017-0.551,0.028-1.101,0.028-1.656c0-29.758-24.109-53.867-53.867-53.867c-7.695,0-15.01,1.616-21.631,4.524l-0.001-0.003c-8.681,3.609-18.896,0.294-23.7-8.069c-5.22-9.087-2.086-20.679,6.996-25.892C86.888,180.548,95.966,179.88,103.605,179.88L103.605,179.88zM38.549,281.614c-19.655-34.043-7.998-77.547,26.045-97.202c5.487-3.168,11.219-5.516,17.059-7.093c-0.485,0.261-0.968,0.527-1.448,0.804c-25.771,14.879-34.596,47.812-19.717,73.584c3.848,6.664,8.905,12.191,14.733,16.471l-0.002,0.002c7.466,5.713,9.702,16.217,4.862,24.559c-5.259,9.064-16.866,12.146-25.921,6.887C47.487,295.757,42.369,288.23,38.549,281.614L38.549,281.614zM159.182,287.086c-19.655,34.043-63.159,45.7-97.202,26.045c-5.487-3.168-10.386-6.958-14.672-11.227c0.468,0.29,0.94,0.575,1.42,0.852c25.771,14.879,58.705,6.055,73.584-19.717c3.847-6.664,6.105-13.807,6.898-20.995l0.003,0.001c1.215-9.323,9.194-16.511,18.838-16.49c10.479,0.023,18.951,8.533,18.925,19.005C166.961,272.275,163.001,280.471,159.182,287.086L159.182,287.086z`;

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

function makeCaesbContent() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '30 170 155 155');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.style.display = 'block';
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', CAESB_ICON_PATH);
  path.setAttribute('fill', '#134FAF');
  path.setAttribute('stroke', 'white');
  path.setAttribute('stroke-width', '6');
  svg.appendChild(path);
  return svg;
}

export default function LayerPanel({ map, mapType = 'gmaps', onFeatureSearch, onWaterUseChange, clearTrigger, initialLayerState, onLayerStateChange, isMarkerActive, onLocate, markerPosition = null }) {
  const { scalePx } = useFontSize();
  const [open, setOpen]               = useState(false);
  const [locating, setLocating]       = useState(false);
  const [active, setActive]           = useState(new Set());
  const [loading, setLoading]         = useState(new Set());
  const [addressKeyword, setAddressKeyword] = useState('');
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [metersMap, setMetersMap]     = useState(initialLayerState?.metersMap   ?? { enderecos: 500, caesb_estacoes: 500 });
  const [waterUseMap, setWaterUseMap] = useState(initialLayerState?.waterUseMap ?? { hidrogeo_fraturado: false, hidrogeo_poroso: false });
  const [openGroups, setOpenGroups]   = useState(new Set());

  const panelRef        = useRef(null);
  const dataLayersRef   = useRef(new Map());
  const cacheRef        = useRef(new Map());
  const colorCacheRef   = useRef(new Map());
  const infoWinRef      = useRef(null);
  const pendingShapeRef = useRef(null);
  const keywordLayerRef = useRef(null);
  const addressPolygonRef = useRef(null);
  const styleFnsRef     = useRef(new Map()); // Map<id, {gmaps, leaflet}>
  const caesbIconMarkersRef   = useRef([]);
  const caesbIconMarkersLfRef = useRef([]);
  const onSearchRef        = useRef(onFeatureSearch);
  onSearchRef.current      = onFeatureSearch;
  const onWaterUseRef      = useRef(onWaterUseChange);
  onWaterUseRef.current    = onWaterUseChange;
  const waterUseMapRef     = useRef(waterUseMap);
  waterUseMapRef.current   = waterUseMap;
  const onLayerStateRef    = useRef(onLayerStateChange);
  onLayerStateRef.current  = onLayerStateChange;
  const isMarkerActiveRef  = useRef(isMarkerActive);
  isMarkerActiveRef.current = isMarkerActive;
  const markerPositionRef      = useRef(markerPosition);
  markerPositionRef.current    = markerPosition;
  const activeRef              = useRef(active);
  activeRef.current            = active;
  const riversZoomCleanupRef   = useRef(null);
  const toggleRef          = useRef(null);
  const isMountedRef       = useRef(false);

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
      caesbIconMarkersRef.current.forEach(m => { try { m.map = null; } catch (_) {} });
      caesbIconMarkersRef.current = [];
      caesbIconMarkersLfRef.current.forEach(m => { try { if (map) map.removeLayer(m); } catch (_) {} });
      caesbIconMarkersLfRef.current = [];
      if (riversZoomCleanupRef.current) {
        try { riversZoomCleanupRef.current(); } catch (_) {}
        riversZoomCleanupRef.current = null;
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

  useEffect(() => {
    if (!clearTrigger) return;
    dataLayersRef.current.forEach(dl => {
      if (mapType === 'gmaps') { try { dl.setMap(null); } catch (_) {} }
      else { try { if (map && map.hasLayer(dl)) map.removeLayer(dl); } catch (_) {} }
    });
    if (keywordLayerRef.current) {
      if (mapType === 'gmaps') { try { keywordLayerRef.current.setMap(null); } catch (_) {} }
      else { try { if (map && map.hasLayer(keywordLayerRef.current)) map.removeLayer(keywordLayerRef.current); } catch (_) {} }
      keywordLayerRef.current = null;
    }
    caesbIconMarkersRef.current.forEach(m => { try { m.map = null; } catch (_) {} });
    caesbIconMarkersRef.current = [];
    caesbIconMarkersLfRef.current.forEach(m => { try { if (map) map.removeLayer(m); } catch (_) {} });
    caesbIconMarkersLfRef.current = [];
    if (riversZoomCleanupRef.current) {
      try { riversZoomCleanupRef.current(); } catch (_) {}
      riversZoomCleanupRef.current = null;
    }
    setActive(new Set());
    setWaterUseMap({ hidrogeo_fraturado: false, hidrogeo_poroso: false });
    onWaterUseRef.current?.(false);
  }, [clearTrigger, map, mapType]);

  const handleWaterUseToggle = useCallback((id) => {
    const turningOn = !waterUseMapRef.current[id];

    setWaterUseMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      onWaterUseRef.current?.(Object.values(next).some(Boolean));
      return next;
    });

    if (turningOn && map) {
      const dl = dataLayersRef.current.get(id);
      if (dl) {
        if (mapType === 'gmaps') {
          const bounds = new window.google.maps.LatLngBounds();
          let hasPoints = false;
          dl.forEach(feature => {
            feature.getGeometry().forEachLatLng(ll => { bounds.extend(ll); hasPoints = true; });
          });
          if (hasPoints && !bounds.isEmpty()) {
            map.fitBounds(bounds, 40);
            const listener = map.addListener('idle', () => {
              window.google.maps.event.removeListener(listener);
              map.setZoom(Math.min((map.getZoom() ?? 10) + 2, 14));
            });
          }
        } else {
          map.flyTo([-15.781682, -47.802887], 11, { animate: true, duration: 0.6 });
        }
      }
    }
  }, [map, mapType]);

  const getMapCenter = useCallback(() => {
    if (!map) return null;
    if (mapType === 'gmaps') {
      const c = map.getCenter();
      return { lat: c.lat(), lng: c.lng() };
    }
    const c = map.getCenter();
    return { lat: c.lat, lng: c.lng };
  }, [map, mapType]);

  const loadRiversLayer = useCallback(async (id, color) => {
    const layerDef = ALL_LAYERS.find(l => l.id === id);
    const pos = markerPositionRef.current;
    if (!pos?.lat || !pos?.lng) return;

    if (riversZoomCleanupRef.current) {
      try { riversZoomCleanupRef.current(); } catch (_) {}
      riversZoomCleanupRef.current = null;
    }

    const existing = dataLayersRef.current.get(id);
    if (existing) {
      if (mapType === 'gmaps') { try { existing.setMap(null); } catch (_) {} }
      else { try { if (map && map.hasLayer(existing)) map.removeLayer(existing); } catch (_) {} }
    }

    // Mutable array preenchido após o fetch — lido pelos click handlers via closure
    const riverColors = [];

    const getWeight = () => {
      const z = map?.getZoom?.() ?? 12;
      if (z >= 17) return 8;
      if (z >= 15) return 6;
      if (z >= 13) return 4;
      return 2;
    };

    let dl;
    if (mapType === 'gmaps') {
      dl = new window.google.maps.Data({ map });
      dl.addListener('click', (event) => {
        if (isMarkerActiveRef.current?.()) return;
        const fIdx = typeof event.feature.getId() === 'number' ? event.feature.getId() : 0;
        const fColor = riverColors[fIdx] ?? getFeatureColor(fIdx);
        const props = gmapsFeatureProps(event.feature);
        pendingShapeRef.current = null;
        if (!infoWinRef.current) infoWinRef.current = new window.google.maps.InfoWindow();
        infoWinRef.current.setContent(buildFeatureHtml(props, layerDef?.label ?? id, fColor, false, null, LAYER_FIELD_CONFIG[id]?.bold ?? null));
        infoWinRef.current.setPosition(event.latLng);
        infoWinRef.current.open(map);
      });
    } else {
      const L = (await import('leaflet')).default;
      dl = L.geoJSON(null, {
        onEachFeature: (feature, layer) => {
          layer.on('click', (e) => {
            const fIdx = feature?.id ?? 0;
            const fColor = riverColors[fIdx] ?? getFeatureColor(fIdx);
            pendingShapeRef.current = null;
            L.DomEvent.stopPropagation(e);
            L.popup({ maxWidth: 300, closeButton: true })
              .setLatLng(e.latlng)
              .setContent(buildFeatureHtml(feature.properties, layerDef?.label ?? id, fColor, false, null, LAYER_FIELD_CONFIG[id]?.bold ?? null))
              .openOn(map);
          });
        },
      });
      if (map) dl.addTo(map);
    }
    dataLayersRef.current.set(id, dl);

    setLoading(prev => new Set([...prev, id]));
    try {
      const raw = await fetchRiversByCoordinates(pos.lat, pos.lng);
      const gj = normalizeRiversGeoJSON(raw);

      gj.features.forEach((_, i) => { riverColors[i] = getFeatureColor(i); });

      if (mapType === 'gmaps') {
        const styleFn = (feature) => {
          const fIdx = typeof feature.getId() === 'number' ? feature.getId() : 0;
          return { strokeColor: riverColors[fIdx] ?? getFeatureColor(fIdx), strokeOpacity: 0.9, strokeWeight: getWeight() };
        };
        dl.addGeoJson(gj);
        dl.setStyle(styleFn);
        const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', () => {
          try { dl.setStyle(styleFn); } catch (_) {}
        });
        riversZoomCleanupRef.current = () => {
          try { window.google.maps.event.removeListener(zoomListener); } catch (_) {}
        };
      } else {
        const L = (await import('leaflet')).default;
        const styleFn = (feature) => {
          const fIdx = feature?.id ?? 0;
          return { color: riverColors[fIdx] ?? getFeatureColor(fIdx), weight: getWeight(), opacity: 0.9 };
        };
        dl.addData(gj);
        dl.setStyle(styleFn);
        const onZoom = () => { try { dl.setStyle(styleFn); } catch (_) {} };
        map.on('zoom', onZoom);
        riversZoomCleanupRef.current = () => {
          try { map.off('zoom', onZoom); } catch (_) {}
        };
      }
    } catch (err) {
      console.error('[LayerPanel] erro ao carregar rios', err);
    } finally {
      setLoading(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [map, mapType]);

  useEffect(() => {
    if (!activeRef.current.has('rios_df') || !markerPosition?.lat || !markerPosition?.lng) return;
    const color = ALL_LAYERS.find(l => l.id === 'rios_df')?.color ?? '#29b6f6';
    loadRiversLayer('rios_df', color);
  }, [markerPosition, loadRiversLayer]);

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

    const isCaesb = id === 'caesb_estacoes';
    const isEndereco = id === 'enderecos';

    const gmapsPointStyle = () => ({
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 5, fillColor: color, fillOpacity: 0.85,
        strokeColor: '#fff', strokeWeight: 1.5,
      },
    });

    const gmapsPolygonStyle = () => ({
      strokeColor: color, strokeWeight: 2, strokeOpacity: 1,
      fillColor: color, fillOpacity: 0.30,
    });

    const gmapsLineStyle = () => ({
      strokeColor: '#134FAF',
      strokeOpacity: 1,
      strokeWeight: 4,
    });

    let dl;
    if (mapType === 'gmaps') {
      dl = new window.google.maps.Data({ map });
      dl.setStyle(isCaesb ? gmapsLineStyle : isEndereco ? gmapsPolygonStyle : gmapsPointStyle);
      dl.addListener('click', (event) => {
        if (isMarkerActiveRef.current?.()) return;
        const props = gmapsFeatureProps(event.feature);
        pendingShapeRef.current = null;
        if (!infoWinRef.current) infoWinRef.current = new window.google.maps.InfoWindow();
        infoWinRef.current.setContent(buildFeatureHtml(props, layerDef?.label ?? id, color, false));
        infoWinRef.current.setPosition(event.latLng);
        infoWinRef.current.open(map);
      });
    } else {
      const L = (await import('leaflet')).default;
      if (isCaesb) {
        dl = L.geoJSON(null, {
          style: () => ({ color: '#134FAF', weight: 4, opacity: 1 }),
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
      } else if (isEndereco) {
        dl = L.geoJSON(null, {
          style: () => ({ color, weight: 2, opacity: 1, fillColor: color, fillOpacity: 0.30 }),
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
      } else {
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
      }
      if (map) dl.addTo(map);
    }
    dataLayersRef.current.set(id, dl);

    setLoading(prev => new Set([...prev, id]));
    try {
      const position = { ...center, meters };
      let esriResult;
      if (id === 'enderecos')           esriResult = await fetchAddressesByPosition(position);
      else if (id === 'caesb_estacoes') esriResult = await fetchSuplySystemByPosition(position);

      if (isCaesb) {
        const gj = esriToGeoJSONPolylines(esriResult);
        if (mapType === 'gmaps') {
          caesbIconMarkersRef.current.forEach(m => { try { m.map = null; } catch (_) {} });
          caesbIconMarkersRef.current = [];

          dl.addGeoJson(gj);
          dl.setStyle(gmapsLineStyle);

          gj.features.forEach((feature, idx) => {
            if (idx % 5 !== 4) return;
            const coords = feature.geometry.coordinates;
            if (!coords.length) return;
            const mid = coords[Math.floor(coords.length / 2)];
            const marker = new window.google.maps.marker.AdvancedMarkerElement({
              position: { lat: mid[1], lng: mid[0] },
              map,
              content: makeCaesbContent(),
              title: feature.properties?.nome || 'CAESB',
            });
            caesbIconMarkersRef.current.push(marker);
          });
        } else {
          const L = (await import('leaflet')).default;
          caesbIconMarkersLfRef.current.forEach(m => { try { map.removeLayer(m); } catch (_) {} });
          caesbIconMarkersLfRef.current = [];
          dl.addData(gj);
          gj.features.forEach((feature, idx) => {
            if (idx % 5 !== 4) return;
            const coords = feature.geometry.coordinates;
            if (!coords.length) return;
            const mid = coords[Math.floor(coords.length / 2)];
            const svgHtml = `<svg viewBox="30 170 155 155" width="20" height="20" style="display:block"><path d="${CAESB_ICON_PATH}" fill="#134FAF" stroke="white" stroke-width="6"/></svg>`;
            const icon = L.divIcon({ className: '', html: svgHtml, iconSize: [20, 20], iconAnchor: [10, 10] });
            const m = L.marker([mid[1], mid[0]], { icon, interactive: false }).addTo(map);
            caesbIconMarkersLfRef.current.push(m);
          });
        }
      } else if (isEndereco) {
        const gj = esriToGeoJSONPolygons(esriResult);
        if (mapType === 'gmaps') { dl.addGeoJson(gj); dl.setStyle(gmapsPolygonStyle); }
        else { dl.addData(gj); }
      } else {
        const gj = esriToGeoJSONPoints(esriResult);
        if (mapType === 'gmaps') { dl.addGeoJson(gj); dl.setStyle(gmapsPointStyle); }
        else { dl.addData(gj); }
      }
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
      if (id === 'caesb_estacoes') {
        caesbIconMarkersRef.current.forEach(m => { try { m.map = null; } catch (_) {} });
        caesbIconMarkersRef.current = [];
        caesbIconMarkersLfRef.current.forEach(m => { try { if (map) map.removeLayer(m); } catch (_) {} });
        caesbIconMarkersLfRef.current = [];
      }
      if (id === 'rios_df' && riversZoomCleanupRef.current) {
        try { riversZoomCleanupRef.current(); } catch (_) {}
        riversZoomCleanupRef.current = null;
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

    // Marker-position layers fetch by red marker coordinates
    if (MARKER_POSITION_LAYERS.has(id)) {
      await loadRiversLayer(id, color);
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
      return { strokeColor: fColor, strokeWeight: 2, strokeOpacity: 1, fillColor: fColor, fillOpacity: 0.30 };
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
      return { color: fColor, weight: 2, opacity: 1, fillColor: fColor, fillOpacity: 0.30 };
    };

    styleFnsRef.current.set(id, { gmaps: gmapsStyleFn, leaflet: leafletStyleFn });

    let dl;
    if (mapType === 'gmaps') {
      dl = new window.google.maps.Data({ map });
      dl.setStyle(gmapsStyleFn);

      dl.addListener('click', (event) => {
        if (isMarkerActiveRef.current?.()) return;
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
        const pctUtilizada = WATER_USE_LAYERS.has(id) && waterUseMapRef.current[id]
          ? (props.pct_utilizada ?? null)
          : null;
        infoWinRef.current.setContent(
          buildFeatureHtml(props, layerDef?.label ?? id, fColor, !!shape && !!onSearchRef.current, pctUtilizada, LAYER_FIELD_CONFIG[id]?.bold ?? null)
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
            const pctUtilizada = WATER_USE_LAYERS.has(id) && waterUseMapRef.current[id]
              ? (feature.properties?.pct_utilizada ?? null)
              : null;
            L.popup({ maxWidth: 300, closeButton: true })
              .setLatLng(e.latlng)
              .setContent(buildFeatureHtml(feature.properties, layerDef?.label ?? id, fColor, !!shape && !!onSearchRef.current, pctUtilizada, LAYER_FIELD_CONFIG[id]?.bold ?? null))
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
  }, [active, map, mapType, metersMap, loadPositionLayer, loadRiversLayer]);

  toggleRef.current = toggle;

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
          if (isMarkerActiveRef.current?.()) return;
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

  // Busca sugestões de endereço conforme o usuário digita (debounce 300ms)
  useEffect(() => {
    const kw = addressKeyword.trim();
    if (kw.length < 3) { setAddressSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await fetchAddressByKeyword(kw);
        setAddressSuggestions(results || []);
        setShowSuggestions(true);
      } catch (_) {
        setAddressSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [addressKeyword]);

  const handleSuggestionSelect = useCallback(async (option) => {
    setAddressKeyword(option.pu_end_usual);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    if (!option?.geometry) return;

    // Remove polígono anterior
    if (addressPolygonRef.current) {
      if (mapType === 'gmaps') { try { addressPolygonRef.current.setMap(null); } catch (_) {} }
      else { try { if (map && map.hasLayer(addressPolygonRef.current)) map.removeLayer(addressPolygonRef.current); } catch (_) {} }
      addressPolygonRef.current = null;
    }

    const paths = convertGeometryToGmaps(option.geometry);
    if (!paths?.length) return;
    const centroid = getPolygonEsriCentroid(option.geometry);

    // Propriedades sem a geometria para o popup
    const { geometry: _geo, ...props } = option;

    const html = buildFeatureHtml(props, 'Endereço', '#1565c0', false);

    if (mapType === 'gmaps' && map) {
      const polygon = new window.google.maps.Polygon({
        paths, map,
        strokeColor: '#1565c0', strokeWeight: 2,
        fillColor: '#1565c0', fillOpacity: 0.15,
      });
      addressPolygonRef.current = polygon;
      if (!infoWinRef.current) infoWinRef.current = new window.google.maps.InfoWindow();
      infoWinRef.current.setContent(html);
      polygon.addListener('click', () => {
        if (centroid) {
          infoWinRef.current.setPosition(centroid);
          infoWinRef.current.open(map);
        }
      });
      if (centroid) {
        map.panTo(centroid);
        map.setZoom(17);
        infoWinRef.current.setPosition(centroid);
        infoWinRef.current.open(map);
      }
    } else if (mapType !== 'gmaps' && map) {
      const L = (await import('leaflet')).default;
      const latLngs = paths.map(ring => ring.map(p => [p.lat, p.lng]));
      const poly = L.polygon(latLngs, { color: '#1565c0', weight: 2, fillColor: '#1565c0', fillOpacity: 0.15 });
      poly.addTo(map);
      addressPolygonRef.current = poly;
      poly.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (centroid) {
          L.popup({ maxWidth: 300, closeButton: true })
            .setLatLng([centroid.lat, centroid.lng])
            .setContent(html)
            .openOn(map);
        }
      });
      if (centroid) {
        map.setView([centroid.lat, centroid.lng], 17);
        L.popup({ maxWidth: 300, closeButton: true })
          .setLatLng([centroid.lat, centroid.lng])
          .setContent(html)
          .openOn(map);
      }
    }
  }, [map, mapType]);

  const handleClearAddress = useCallback(() => {
    setAddressKeyword('');
    setAddressSuggestions([]);
    setShowSuggestions(false);
    if (addressPolygonRef.current) {
      if (mapType === 'gmaps') { try { addressPolygonRef.current.setMap(null); } catch (_) {} }
      else { try { if (map && map.hasLayer(addressPolygonRef.current)) map.removeLayer(addressPolygonRef.current); } catch (_) {} }
      addressPolygonRef.current = null;
    }
    if (infoWinRef.current) { try { infoWinRef.current.close(); } catch (_) {} }
  }, [map, mapType]);

  // Reporta estado das camadas para o pai sempre que muda (para persistir entre trocas de mapa)
  useEffect(() => {
    if (!isMountedRef.current) { isMountedRef.current = true; return; }
    onLayerStateRef.current?.({ active, waterUseMap, metersMap });
  }, [active, waterUseMap, metersMap]);

  // Restaura camadas ativas ao montar (ex: após troca de provedor de mapa)
  useEffect(() => {
    if (initialLayerState?.waterUseMap && Object.values(initialLayerState.waterUseMap).some(Boolean)) {
      onWaterUseRef.current?.(true);
    }
    if (!initialLayerState?.active?.size) return;
    initialLayerState.active.forEach(id => {
      const layerDef = ALL_LAYERS.find(l => l.id === id);
      if (layerDef) toggleRef.current?.(id, layerDef.color);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLocate = () => {
    if (!navigator.geolocation || locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (map && map.panTo) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
        onLocate?.({ lat, lng });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10_000, maximumAge: 30_000 },
    );
  };

  return (
    <div
      ref={panelRef}
      style={{ position: 'relative', margin: '0', fontFamily: 'Roboto, Arial, sans-serif', zIndex: 9999 }}
    >
      {/* Botão de localização — aparece acima do toggle de camadas */}
      <div style={{ padding: '6px 0 6px' }}>
        <button
          onClick={handleLocate}
          disabled={locating}
          title="Minha localização"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30, padding: 0,
            background: '#fff', border: '1px solid #ccc', borderRadius: 2,
            boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
            cursor: locating ? 'default' : 'pointer',
            color: locating ? '#1565c0' : '#555',
            transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
            opacity: locating ? 0.75 : 1,
          }}
          onMouseEnter={e => { if (!locating) { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.color = '#1565c0'; e.currentTarget.style.boxShadow = 'inset 2px 0 0 #1565c0, 0 2px 6px rgba(21,101,192,0.12)'; e.currentTarget.style.transform = 'scale(1.08)'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = locating ? '#1565c0' : '#555'; e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = ''; }}
        >
          {locating
            ? <span className="lp-spin" style={{ width: 14, height: 14, display: 'block', border: '2px solid #1565c0', borderTopColor: 'transparent', borderRadius: '50%' }} />
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
          }
        </button>
      </div>

      <button
        onClick={() => setOpen(p => !p)}
        onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.color = '#1565c0'; e.currentTarget.style.boxShadow = 'inset 2px 0 0 #1565c0, 0 2px 6px rgba(21,101,192,0.12)'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.zIndex = '2'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#555'; e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = ''; e.currentTarget.style.zIndex = ''; }}
        onMouseDown={e => { e.currentTarget.style.background = '#dce8ff'; }}
        onMouseUp={e => { e.currentTarget.style.background = '#dbeafe'; }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
          padding: '0', background: '#fff', border: '1px solid #ccc',
          borderRadius: 2, boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
          cursor: 'pointer', fontSize: scalePx(12), color: '#333', fontWeight: 600,
          whiteSpace: 'nowrap', width: 30, height: 30,
          transition: 'background 0.15s, box-shadow 0.15s',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#555">
          <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
        </svg>
        {active.size > 0 && (
          <span style={{
            background: '#1565c0', color: '#fff', borderRadius: '50%',
            width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: scalePx(10), fontWeight: 700, flexShrink: 0,
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
          minWidth: 230,
          zIndex: 1000,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 10px 6px', borderBottom: '1px solid #e8ecf0',
          }}>
            <span style={{ fontSize: scalePx(11), fontWeight: 700, color: '#546e7a', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Camadas</span>
            <button
              onClick={() => setOpen(false)}
              title="Fechar painel"
              onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.color = '#424242'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9e9e9e'; }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9e9e9e', padding: '2px 4px', lineHeight: 1,
                fontSize: 16, display: 'flex', alignItems: 'center',
                borderRadius: 3, transition: 'background 0.15s, color 0.15s',
              }}
            >×</button>
          </div>
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
                onMouseEnter={e => { e.currentTarget.style.background = isGroupOpen ? '#edf0ff' : '#f5f7ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isGroupOpen ? '#f5f7ff' : '#fff'; }}
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
                <span style={{ flex: 1, fontSize: scalePx(10), fontWeight: 700, color: '#546e7a', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  {group}
                </span>
                {groupActive > 0 && (
                  <span style={{
                    background: '#1565c0', color: '#fff', borderRadius: '50%',
                    width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: scalePx(9), fontWeight: 700, flexShrink: 0,
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
                      <div style={{ padding: '5px 12px 2px', display: 'flex', gap: 4, position: 'relative' }}>
                        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Buscar endereço..."
                            value={addressKeyword}
                            onChange={e => setAddressKeyword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleKeywordSearch(color)}
                            onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            style={{
                              width: '100%', fontSize: scalePx(11),
                              padding: addressKeyword ? '3px 18px 3px 6px' : '3px 6px',
                              border: '1px solid #ccc', borderRadius: 3, outline: 'none',
                              fontFamily: 'Roboto, Arial, sans-serif', boxSizing: 'border-box',
                            }}
                          />
                          {addressKeyword && (
                            <button
                              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleClearAddress(); }}
                              title="Limpar"
                              onMouseEnter={e => { e.currentTarget.style.color = '#c62828'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#9e9e9e'; }}
                              style={{
                                position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: 0, lineHeight: 1, color: '#9e9e9e', fontSize: 13,
                                transition: 'color 0.15s',
                              }}
                            >×</button>
                          )}
                        </div>
                        <button
                          onClick={() => handleKeywordSearch(color)}
                          disabled={keywordLoading || !addressKeyword.trim()}
                          title="Pesquisar endereço por nome"
                          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(0.85)'; }}
                          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
                          onMouseDown={e => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(0.72)'; }}
                          onMouseUp={e => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(0.85)'; }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '3px 7px', background: color, color: '#fff',
                            border: 'none', borderRadius: 3,
                            cursor: keywordLoading || !addressKeyword.trim() ? 'default' : 'pointer',
                            opacity: keywordLoading || !addressKeyword.trim() ? 0.5 : 1,
                            flexShrink: 0, transition: 'filter 0.15s',
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
                        {showSuggestions && addressSuggestions.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            maxHeight: 180,
                            overflowY: 'auto',
                            zIndex: 9999,
                            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                            marginTop: 2,
                          }}>
                            {addressSuggestions.slice(0, 20).map(opt => (
                              <div
                                key={opt.objectid}
                                onMouseDown={() => handleSuggestionSelect(opt)}
                                style={{
                                  padding: '5px 8px',
                                  fontSize: scalePx(11),
                                  cursor: 'pointer',
                                  fontFamily: 'Roboto, Arial, sans-serif',
                                  borderBottom: '1px solid #f0f0f0',
                                  color: '#263238',
                                  lineHeight: 1.3,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#e3f2fd'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                              >
                                {opt.pu_end_usual}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Checkbox row */}
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px', cursor: 'pointer',
                        fontSize: scalePx(12.5), color: '#263238',
                        background: isActive ? `${color}18` : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => toggle(id, color)}
                      onMouseEnter={e => { e.currentTarget.style.background = isActive ? `${color}28` : '#f5f7ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isActive ? `${color}18` : 'transparent'; }}
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
                            fontSize: scalePx(10), padding: '1px 2px',
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
                        <span style={{ fontSize: scalePx(11), color: '#546e7a', fontStyle: 'italic' }}>Cálculo de Uso</span>
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
      <style>{`@keyframes lp-spin{to{transform:rotate(360deg)}}.lp-spin{animation:lp-spin .8s linear infinite}.nd-swatch-btn{transition:transform .15s,box-shadow .15s}.nd-swatch-btn:hover{transform:scale(1.18);box-shadow:0 0 0 3px rgba(0,0,0,0.22)}.nd-swatch-btn:active{transform:scale(.92)}.nd-act-btn{transition:filter .15s,transform .1s}.nd-act-btn:not([disabled]):hover{filter:brightness(.88)}.nd-act-btn:not([disabled]):active{filter:brightness(.72);transform:scale(.97)}`}</style>

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
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.color = '#1565c0'; e.currentTarget.style.boxShadow = 'inset 2px 0 0 #1565c0, 0 2px 6px rgba(21,101,192,0.12)'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.zIndex = '2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#555'; e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = ''; e.currentTarget.style.zIndex = ''; }}
            onMouseDown={e => { e.currentTarget.style.background = '#dce8ff'; }}
            onMouseUp={e => { e.currentTarget.style.background = '#dbeafe'; }}
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
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.color = '#1565c0'; e.currentTarget.style.boxShadow = 'inset 2px 0 0 #1565c0, 0 2px 6px rgba(21,101,192,0.12)'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.zIndex = '2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#555'; e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = ''; e.currentTarget.style.zIndex = ''; }}
            onMouseDown={e => { e.currentTarget.style.background = '#dce8ff'; }}
            onMouseUp={e => { e.currentTarget.style.background = '#dbeafe'; }}
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

