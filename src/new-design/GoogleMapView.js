import React, { useRef, useEffect } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

const API_KEY   = 'AIzaSyDELUXEV5kZ2MNn47NVRgCcDX-96Vtyj0w';
const BRASILIA  = { lat: -15.7801, lng: -47.9292 };
const TI_COLORS = { 1: '#2e7d32', 2: '#0277bd', 3: '#f57f17', 4: '#6a1b9a', 5: '#bf360c' };

const SHAPE_STYLE = {
  strokeColor: '#1565c0', strokeWeight: 2,
  fillColor: '#1565c0', fillOpacity: 0.08,
};

const HAVERSINE = (lat1, lng1, lat2, lng2) => {
  const R = 6371000, toRad = v => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function makePinUrl(color, size = 'normal') {
  const [w, h, r] = size === 'small' ? [16, 24, 3.5] : [24, 36, 5];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 36">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z" fill="${color}" opacity="0.92"/>
    <circle cx="12" cy="12" r="${r}" fill="white"/>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function buildInfoHtml(item) {
  const color = item._catColor ?? TI_COLORS[item.ti_id] ?? '#1565c0';
  const lat = parseFloat(item.int_latitude), lng = parseFloat(item.int_longitude);
  return `
    <div style="font-family:Roboto,Arial,sans-serif;min-width:210px;max-width:270px;">
      <div style="font-weight:700;font-size:13px;color:#1a237e;
                  border-bottom:2px solid ${color};padding-bottom:5px;margin-bottom:6px;">
        ${item.us_nome ?? '—'}
      </div>
      <table style="width:100%;font-size:11px;border-collapse:collapse;line-height:1.7;">
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Processo</b></td><td>${item.int_processo ?? '—'}</td></tr>
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>CPF/CNPJ</b></td><td>${item.us_cpf_cnpj ?? '—'}</td></tr>
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Endereço</b></td><td>${item.emp_endereco ?? '—'}</td></tr>
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Bacia</b></td><td>${item.bh_nome ?? '—'}</td></tr>
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Tipo</b></td>
            <td style="color:${color};font-weight:600;">${item._catLabel ?? '—'}</td></tr>
        ${!isNaN(lat) && !isNaN(lng)
          ? `<tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Lat/Lng</b></td>
              <td>${lat.toFixed(6)}, ${lng.toFixed(6)}</td></tr>`
          : ''}
      </table>
    </div>`;
}

const DRAW_BTNS = [
  { mode: null,        title: 'Cursor',    svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 0l16 12.28-6.95 1.17 4.32 8.82-3.6 1.73-4.35-8.88-5.42 4.7z"/></svg>` },
  { mode: 'circle',    title: 'Círculo',   svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/></svg>` },
  { mode: 'polygon',   title: 'Polígono',  svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12,2 21,8 18,20 6,20 3,8"/></svg>` },
  { mode: 'rectangle', title: 'Retângulo', svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="6" width="18" height="12" rx="1"/></svg>` },
];

// ─── Componente interno (renderizado somente após API carregada) ───────────────
function GMapInner({ circleData, onShapeCreated, markerData, onPickCoordinate, allMarkers, subShape }) {
  const containerRef   = useRef(null);
  const mapRef         = useRef(null);
  const circleRef      = useRef(null);
  const selectedMkrRef = useRef(null);
  const allMkrsRef     = useRef([]);
  const subShapeRef    = useRef(null);
  const infoWinRef     = useRef(null);
  const onCreatedRef   = useRef(onShapeCreated);
  const onPickRef      = useRef(onPickCoordinate);
  onCreatedRef.current = onShapeCreated;
  onPickRef.current    = onPickCoordinate;

  // ── Inicializa mapa + toolbar de desenho (uma só vez) ───────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: BRASILIA, zoom: 11,
      mapTypeId: 'roadmap',
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      },
    });
    mapRef.current  = map;
    infoWinRef.current = new window.google.maps.InfoWindow();

    // --- toolbar de desenho ---
    let drawMode = null;
    let points   = [];
    let startPt  = null;
    let dragging = false;
    let lastDrag = null;
    let previews = [];
    let pickMode = false;

    const clearPrev = () => { previews.forEach(s => s.setMap(null)); previews = []; };

    const setDrawMode = m => {
      dragging = false; lastDrag = null; map.setOptions({ draggable: true });
      drawMode = m; clearPrev(); points = []; startPt = null;
      map.setOptions({
        draggableCursor: m ? 'crosshair' : null,
        disableDoubleClickZoom: m === 'polygon',
      });
      toolbar.querySelectorAll('button[data-draw]').forEach(btn => {
        const active = btn.dataset.draw === (m ?? '');
        btn.style.background  = active ? '#d8e8f8' : '#fff';
        btn.style.borderColor = active ? '#4a90d9' : '#ccc';
      });
    };

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;align-items:center;background:#fff;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.3);margin:10px;padding:2px;gap:2px;';

    DRAW_BTNS.forEach(({ mode: bMode, title, svg }) => {
      const btn = document.createElement('button');
      btn.dataset.draw = bMode ?? '';
      btn.title = title; btn.innerHTML = svg;
      btn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:26px;height:26px;background:#fff;border:1px solid #ccc;border-radius:2px;cursor:pointer;color:#444;padding:0;';
      btn.onmouseenter = () => { if (drawMode !== bMode) btn.style.background = '#f5f5f5'; };
      btn.onmouseleave = () => { if (drawMode !== bMode) btn.style.background = '#fff'; };
      btn.onclick = () => setDrawMode(bMode);
      toolbar.appendChild(btn);
    });

    // botão pick coordinate
    const pickBtn = document.createElement('button');
    pickBtn.title = 'Selecionar ponto de pesquisa no mapa';
    pickBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.8" fill="white"/></svg>`;
    pickBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:26px;height:26px;background:#fff;border:1px solid #ccc;border-radius:2px;cursor:pointer;color:#444;padding:0;';
    pickBtn.onclick = () => {
      pickMode = !pickMode;
      map.getDiv().style.cursor    = pickMode ? 'crosshair' : '';
      pickBtn.style.background     = pickMode ? '#e3f2fd' : '#fff';
      pickBtn.style.borderColor    = pickMode ? '#1565c0'  : '#ccc';
      pickBtn.style.color          = pickMode ? '#1565c0'  : '#444';
    };
    toolbar.appendChild(pickBtn);

    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(toolbar);

    // --- listeners ---
    const clickL = map.addListener('click', e => {
      if (pickMode) {
        pickMode = false;
        map.getDiv().style.cursor = '';
        pickBtn.style.background = '#fff'; pickBtn.style.borderColor = '#ccc'; pickBtn.style.color = '#444';
        onPickRef.current?.({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        return;
      }
      if (!drawMode) return;
      if (drawMode === 'polygon') points.push(e.latLng);
    });

    const dblClickL = map.addListener('dblclick', () => {
      if (drawMode === 'polygon' && points.length >= 3) {
        const finalPts = [...points]; setDrawMode(null);
        new window.google.maps.Polygon({ paths: finalPts, map, ...SHAPE_STYLE, clickable: false });
        const pts = finalPts.map(p => [p.lng(), p.lat()]);
        onCreatedRef.current?.({ type: 'polygon', points: [...pts, pts[0]] });
      }
    });

    const mouseDownL = map.addListener('mousedown', e => {
      if (drawMode !== 'circle' && drawMode !== 'rectangle') return;
      startPt = e.latLng; dragging = true; map.setOptions({ draggable: false });
    });

    const mouseMoveL = map.addListener('mousemove', e => {
      if (dragging) lastDrag = e.latLng;
      if (!drawMode) return;
      clearPrev();
      if (drawMode === 'polygon' && points.length > 0) {
        previews = [new window.google.maps.Polyline({
          path: [...points, e.latLng], map,
          strokeColor: '#1565c0', strokeWeight: 1.5, strokeOpacity: 0.7, clickable: false,
        })];
      }
      if (drawMode === 'circle' && dragging && startPt) {
        const r = HAVERSINE(startPt.lat(), startPt.lng(), e.latLng.lat(), e.latLng.lng());
        previews = [new window.google.maps.Circle({ center: startPt, radius: r, map, ...SHAPE_STYLE, clickable: false })];
      }
      if (drawMode === 'rectangle' && dragging && startPt) {
        const SW = new window.google.maps.LatLng(Math.min(startPt.lat(), e.latLng.lat()), Math.min(startPt.lng(), e.latLng.lng()));
        const NE = new window.google.maps.LatLng(Math.max(startPt.lat(), e.latLng.lat()), Math.max(startPt.lng(), e.latLng.lng()));
        previews = [new window.google.maps.Rectangle({ bounds: new window.google.maps.LatLngBounds(SW, NE), map, ...SHAPE_STYLE, clickable: false })];
      }
    });

    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false; map.setOptions({ draggable: true });
      if (drawMode === 'circle' && startPt && lastDrag) {
        const radius = HAVERSINE(startPt.lat(), startPt.lng(), lastDrag.lat(), lastDrag.lng());
        if (radius < 50) { clearPrev(); startPt = null; lastDrag = null; return; }
        const s = startPt; clearPrev(); setDrawMode(null); startPt = null; lastDrag = null;
        onCreatedRef.current?.({ type: 'circle', center: { lat: s.lat(), lng: s.lng() }, radius: Math.round(radius) });
      }
      if (drawMode === 'rectangle' && startPt && lastDrag) {
        const s = startPt, end = lastDrag; clearPrev(); setDrawMode(null); startPt = null; lastDrag = null;
        onCreatedRef.current?.({
          type: 'rectangle',
          nex: Math.max(s.lng(), end.lng()), ney: Math.max(s.lat(), end.lat()),
          swx: Math.min(s.lng(), end.lng()), swy: Math.min(s.lat(), end.lat()),
        });
      }
    };

    const onKeyDown = e => { if (e.key === 'Escape') { setDrawMode(null); pickMode = false; } };

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearPrev();
      window.google.maps.event.removeListener(clickL);
      window.google.maps.event.removeListener(dblClickL);
      window.google.maps.event.removeListener(mouseDownL);
      window.google.maps.event.removeListener(mouseMoveL);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      mapRef.current = null;
    };
  }, []);

  // ── Círculo de busca ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (circleRef.current) { circleRef.current.setMap(null); circleRef.current = null; }
    if (!circleData) return;
    circleRef.current = new window.google.maps.Circle({
      center: circleData.center, radius: circleData.radius,
      map: mapRef.current, ...SHAPE_STYLE,
    });
    mapRef.current.panTo(circleData.center);
    mapRef.current.setZoom(13);
  }, [circleData]);

  // ── Marcador selecionado ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedMkrRef.current) { selectedMkrRef.current.setMap(null); selectedMkrRef.current = null; }
    infoWinRef.current?.close();
    if (!markerData) return;
    const lat = parseFloat(markerData.int_latitude), lng = parseFloat(markerData.int_longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    const color = markerData._catColor ?? TI_COLORS[markerData.ti_id] ?? '#1565c0';
    const marker = new window.google.maps.Marker({
      position: { lat, lng }, map: mapRef.current,
      icon: { url: makePinUrl(color), scaledSize: new window.google.maps.Size(24, 36), anchor: new window.google.maps.Point(12, 36) },
    });
    infoWinRef.current.setContent(buildInfoHtml(markerData));
    infoWinRef.current.open(mapRef.current, marker);
    selectedMkrRef.current = marker;
    mapRef.current.panTo({ lat, lng });
  }, [markerData]);

  // ── Todos os marcadores da pesquisa ───────────────────────────────────────────
  useEffect(() => {
    allMkrsRef.current.forEach(m => m.setMap(null));
    allMkrsRef.current = [];
    if (!mapRef.current || !allMarkers?.length) return;
    allMarkers.forEach(item => {
      const lat = parseFloat(item.int_latitude), lng = parseFloat(item.int_longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      const color = item._catColor ?? TI_COLORS[item.ti_id] ?? '#1565c0';
      const marker = new window.google.maps.Marker({
        position: { lat, lng }, map: mapRef.current,
        icon: { url: makePinUrl(color, 'small'), scaledSize: new window.google.maps.Size(16, 24), anchor: new window.google.maps.Point(8, 24) },
      });
      marker.addListener('click', () => {
        infoWinRef.current.setContent(buildInfoHtml(item));
        infoWinRef.current.open(mapRef.current, marker);
      });
      allMkrsRef.current.push(marker);
    });
  }, [allMarkers]);

  // ── Polígono do subsistema ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (subShapeRef.current) { subShapeRef.current.setMap(null); subShapeRef.current = null; }
    if (!subShape) return;
    const geoJson = (subShape.type === 'Feature' || subShape.type === 'FeatureCollection')
      ? subShape : { type: 'Feature', geometry: subShape };
    const dataLayer = new window.google.maps.Data({ map: mapRef.current });
    dataLayer.addGeoJson(geoJson);
    dataLayer.setStyle({ strokeColor: '#6a1b9a', strokeWeight: 2, strokeOpacity: 0.85, fillColor: '#ce93d8', fillOpacity: 0.12 });
    subShapeRef.current = dataLayer;
    const bounds = new window.google.maps.LatLngBounds();
    dataLayer.forEach(f => f.getGeometry()?.forEachLatLng(ll => bounds.extend(ll)));
    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 24);
  }, [subShape]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// ─── Wrapper público ──────────────────────────────────────────────────────────
export default function GoogleMapView(props) {
  return (
    <Wrapper apiKey={API_KEY} libraries={['drawing', 'geometry']}>
      <GMapInner {...props} />
    </Wrapper>
  );
}
