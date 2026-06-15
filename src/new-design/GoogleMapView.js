import React, { useRef, useEffect } from 'react';

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

// polígono → retângulo → círculo
const DRAW_BTNS = [
  { mode: 'polygon',   title: 'Polígono',  svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12,2 21,8 18,20 6,20 3,8"/></svg>` },
  { mode: 'rectangle', title: 'Retângulo', svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="6" width="18" height="12" rx="1"/></svg>` },
  { mode: 'circle',    title: 'Círculo',   svg: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/></svg>` },
];

const BTN_CSS = [
  'display:flex', 'align-items:center', 'justify-content:center',
  'width:30px', 'height:30px', 'background:#fff',
  'border:none', 'border-bottom:1px solid #ccc',
  'cursor:pointer', 'padding:0',
  'transition:background 0.15s,color 0.15s',
  'text-decoration:none',
].join(';');

const BAR_CSS = 'display:flex;flex-direction:column;background:#fff;border-radius:4px;box-shadow:0 1px 5px rgba(0,0,0,0.4);overflow:hidden;';

function makeBtn(innerHTML, title, color = '#555') {
  const a = document.createElement('a');
  a.href = '#'; a.title = title; a.innerHTML = innerHTML;
  a.style.cssText = `${BTN_CSS};color:${color};`;
  a.addEventListener('click', e => e.preventDefault());
  a.addEventListener('mouseenter', () => { if (!a._active) a.style.background = '#f4f4f4'; });
  a.addEventListener('mouseleave', () => { if (!a._active) a.style.background = '#fff'; });
  return a;
}

function makeBar() {
  const d = document.createElement('div');
  d.style.cssText = BAR_CSS;
  return d;
}

// ─── Componente interno ───────────────────────────────────────────────────────
function GMapInner({ circleData, onShapeCreated, markerData, userMarker, onPickCoordinate, onClearAll, allMarkers, subShape }) {
  const containerRef   = useRef(null);
  const mapRef         = useRef(null);
  const circleRef      = useRef(null);
  const userMarkerRef  = useRef(null);
  const selectedMkrRef = useRef(null);
  const allMkrsRef     = useRef([]);
  const subShapeRef    = useRef(null);
  const infoWinRef     = useRef(null);
  const onCreatedRef   = useRef(onShapeCreated);
  const onPickRef      = useRef(onPickCoordinate);
  const onClearRef     = useRef(onClearAll);

  onCreatedRef.current = onShapeCreated;
  onPickRef.current    = onPickCoordinate;
  onClearRef.current   = onClearAll;

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: BRASILIA, zoom: 11,
      mapTypeId: 'roadmap',
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: window.google.maps.ControlPosition.TOP_LEFT,
      },
    });
    mapRef.current     = map;
    infoWinRef.current = new window.google.maps.InfoWindow();
    window.google.maps.event.addListenerOnce(map, 'idle', () => map.setMapTypeId('roadmap'));

    let drawnShapes  = [];
    let editMode     = false;
    let editBtnEl    = null;
    let popupAnchor  = null;

    // ── Popup de área ─────────────────────────────────────────────────────────
    const fmtArea = (m2) => {
      const ha = m2 / 10000;
      const fmt = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
      return `<b>${fmt(Math.round(m2))} m²</b>&nbsp;·&nbsp;<b>${fmt(ha)} ha</b>`;
    };

    // Vértice de latitude máxima — garante ponto na borda do polígono, nunca dentro
    const topOfPath = (pathArr) => {
      let top = pathArr[0];
      pathArr.forEach(p => { if (p.lat() > top.lat()) top = p; });
      return top;
    };

    // Ponto central da borda superior do bounding box (retângulo)
    const topOfBounds = (bounds) => {
      const ne = bounds.getNorthEast();
      return new window.google.maps.LatLng(ne.lat(), bounds.getCenter().lng());
    };

    // Ponto mais ao norte da circunferência
    const topOfCircle = (center, radius) =>
      new window.google.maps.LatLng(center.lat() + radius / 111320, center.lng());

    const showAreaPopupG = (topLatLng, areaM2) => {
      infoWinRef.current.setContent(`
        <div style="font-family:Roboto,Arial,sans-serif;min-width:150px;text-align:center;padding:2px 4px;">
          <div style="font-size:10px;color:#78909c;text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px;">Área da camada</div>
          <div style="font-size:12px;color:#263238;">${fmtArea(areaM2)}</div>
        </div>
      `);
      // Anchor no ponto mais ao norte: o tip da seta fica na borda, conteúdo acima
      if (!popupAnchor) popupAnchor = new window.google.maps.Marker({ map, visible: false });
      popupAnchor.setPosition(topLatLng);
      infoWinRef.current.open(map, popupAnchor);
    };

    const computeArea = (shapeDesc) => {
      const geo = window.google.maps.geometry?.spherical;
      if (!geo) return 0;
      if (shapeDesc.type === 'circle') return Math.PI * shapeDesc.radius ** 2;
      if (shapeDesc.type === 'polygon') {
        const path = shapeDesc.points.slice(0, -1).map(([lng, lat]) => new window.google.maps.LatLng(lat, lng));
        return geo.computeArea(path);
      }
      if (shapeDesc.type === 'rectangle') {
        const path = [
          new window.google.maps.LatLng(shapeDesc.ney, shapeDesc.nex),
          new window.google.maps.LatLng(shapeDesc.ney, shapeDesc.swx),
          new window.google.maps.LatLng(shapeDesc.swy, shapeDesc.swx),
          new window.google.maps.LatLng(shapeDesc.swy, shapeDesc.nex),
        ];
        return geo.computeArea(path);
      }
      return 0;
    };

    const exitEdit = (save) => {
      if (!editMode) return;
      editMode = false;
      if (editBtnEl) {
        editBtnEl._active = false;
        editBtnEl.style.background = '#fff';
        editBtnEl.style.color = '#444';
        editBtnEl.title = 'Editar camadas';
      }
      const all = [...drawnShapes];
      if (circleRef.current) all.push(circleRef.current);
      all.forEach(s => { try { s.setEditable(false); } catch (_) {} });

      if (!save) return;
      if (circleRef.current) {
        const c = circleRef.current, ctr = c.getCenter();
        const cs = { type: 'circle', center: { lat: ctr.lat(), lng: ctr.lng() }, radius: Math.round(c.getRadius()) };
        showAreaPopupG(topOfCircle(ctr, c.getRadius()), computeArea(cs));
        onCreatedRef.current?.(cs);
        return;
      }
      drawnShapes.forEach(s => {
        let shape = null, center = null;
        if (s instanceof window.google.maps.Rectangle) {
          const b = s.getBounds(), ne = b.getNorthEast(), sw = b.getSouthWest();
          shape = { type: 'rectangle', nex: ne.lng(), ney: ne.lat(), swx: sw.lng(), swy: sw.lat() };
          center = topOfBounds(b);
        } else if (s instanceof window.google.maps.Polygon) {
          const pathArr = s.getPath().getArray();
          const pts = pathArr.map(p => [p.lng(), p.lat()]);
          if (pts.length >= 3) {
            shape = { type: 'polygon', points: [...pts, pts[0]] };
            center = topOfPath(pathArr);
          }
        }
        if (shape) { showAreaPopupG(center, computeArea(shape)); onCreatedRef.current?.(shape); }
      });
    };

    const clearAll = () => {
      exitEdit(false);
      drawnShapes.forEach(s => s.setMap(null)); drawnShapes = [];
      if (circleRef.current)      { circleRef.current.setMap(null);      circleRef.current = null; }
      if (userMarkerRef.current)  { userMarkerRef.current.setMap(null);  userMarkerRef.current = null; }
      if (selectedMkrRef.current) { selectedMkrRef.current.setMap(null); selectedMkrRef.current = null; }
      allMkrsRef.current.forEach(m => m.setMap(null)); allMkrsRef.current = [];
      if (subShapeRef.current)    { subShapeRef.current.setMap(null);    subShapeRef.current = null; }
      infoWinRef.current?.close();
    };

    // ── Toolbar: inserida no sistema de controles do GMaps (LEFT_TOP) ────────
    // Usando map.controls, o GMaps gerencia z-index — o dropdown do seletor
    // de tipo de mapa renderiza por cima automaticamente, e o fullscreen funciona.
    const TB = document.createElement('div');
    TB.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin:5px 0 0 10px;';
    map.controls[window.google.maps.ControlPosition.LEFT_TOP].push(TB);

    // --- estado desenho ---
    let drawMode = null, points = [], startPt = null, dragging = false, lastDrag = null, previews = [], pickMode = false;
    const clearPrev = () => { previews.forEach(s => s.setMap(null)); previews = []; };
    const drawBtnMap = {};

    const setDrawMode = m => {
      dragging = false; lastDrag = null; map.setOptions({ draggable: true });
      drawMode = m; clearPrev(); points = []; startPt = null;
      map.setOptions({ draggableCursor: m ? 'crosshair' : null, disableDoubleClickZoom: m === 'polygon' });
      Object.entries(drawBtnMap).forEach(([key, btn]) => {
        const active = key === m;
        btn._active = active;
        btn.style.background = active ? '#d8e8f8' : '#fff';
        btn.style.color = active ? '#1565c0' : '#444';
      });
    };

    // ── Grupo 1: polígono, retângulo, círculo ──────────────────────────────
    const drawBar = makeBar();
    DRAW_BTNS.forEach(({ mode: bMode, title, svg }, i) => {
      const btn = makeBtn(svg, title);
      if (i === DRAW_BTNS.length - 1) btn.style.borderBottom = 'none';
      btn.addEventListener('click', e => { e.preventDefault(); setDrawMode(bMode); });
      drawBtnMap[bMode] = btn;
      drawBar.appendChild(btn);
    });
    TB.appendChild(drawBar);

    // ── Grupo 2: marcador ─────────────────────────────────────────────────
    const pickSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.8" fill="white"/>
    </svg>`;
    const pickBar = makeBar();
    const pickBtn = makeBtn(pickSvg, 'Marcador — selecionar ponto no mapa');
    pickBtn.style.borderBottom = 'none';
    pickBtn.addEventListener('click', e => {
      e.preventDefault();
      pickMode = !pickMode;
      pickBtn._active           = pickMode;
      map.getDiv().style.cursor = pickMode ? 'crosshair' : '';
      pickBtn.style.background  = pickMode ? '#e3f2fd' : '#fff';
      pickBtn.style.color       = pickMode ? '#1565c0' : '#555';
    });
    pickBar.appendChild(pickBtn);
    TB.appendChild(pickBar);

    // ── Grupo 3: editar + remover ─────────────────────────────────────────
    const editSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>`;
    const removeSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>`;
    const actionBar = makeBar();

    editBtnEl = makeBtn(editSvg, 'Editar camadas');
    editBtnEl.addEventListener('click', e => {
      e.preventDefault();
      if (!editMode) {
        const all = [...drawnShapes];
        if (circleRef.current) all.push(circleRef.current);
        if (!all.length) return;
        editMode = true;
        editBtnEl._active = true;
        editBtnEl.style.background = '#d8e8f8';
        editBtnEl.style.color = '#1565c0';
        editBtnEl.title = 'Salvar edição';
        all.forEach(s => s.setEditable(true));
      } else {
        exitEdit(true);
      }
    });
    actionBar.appendChild(editBtnEl);

    const removeBtn = makeBtn(removeSvg, 'Remover', '#c62828');
    removeBtn.style.borderBottom = 'none';
    removeBtn.addEventListener('click', e => {
      e.preventDefault();
      clearAll();
      setDrawMode(null);
      pickMode = false;
      pickBtn._active = false;
      pickBtn.style.background = '#fff';
      pickBtn.style.color = '#555';
      map.getDiv().style.cursor = '';
      onClearRef.current?.();
    });
    actionBar.appendChild(removeBtn);
    TB.appendChild(actionBar);

    // --- listeners ---
    const clickL = map.addListener('click', e => {
      if (pickMode) {
        pickMode = false; pickBtn._active = false;
        map.getDiv().style.cursor = ''; pickBtn.style.background = '#fff'; pickBtn.style.color = '#555';
        onPickRef.current?.({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        return;
      }
      if (!drawMode) return;
      if (drawMode === 'polygon') points.push(e.latLng);
    });

    const dblClickL = map.addListener('dblclick', () => {
      if (drawMode === 'polygon' && points.length >= 3) {
        const finalPts = [...points]; setDrawMode(null);
        const poly = new window.google.maps.Polygon({ paths: finalPts, map, ...SHAPE_STYLE });
        drawnShapes.push(poly);
        const pts = finalPts.map(p => [p.lng(), p.lat()]);
        const shape = { type: 'polygon', points: [...pts, pts[0]] };
        showAreaPopupG(topOfPath(finalPts), computeArea(shape));
        onCreatedRef.current?.(shape);
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
        previews = [new window.google.maps.Polyline({ path: [...points, e.latLng], map, strokeColor: '#1565c0', strokeWeight: 1.5, strokeOpacity: 0.7, clickable: false })];
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
        const circShape = { type: 'circle', center: { lat: s.lat(), lng: s.lng() }, radius: Math.round(radius) };
        showAreaPopupG(topOfCircle(s, radius), computeArea(circShape));
        onCreatedRef.current?.(circShape);
      }
      if (drawMode === 'rectangle' && startPt && lastDrag) {
        const s = startPt, end = lastDrag; clearPrev(); setDrawMode(null); startPt = null; lastDrag = null;
        const rect = new window.google.maps.Rectangle({
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(Math.min(s.lat(), end.lat()), Math.min(s.lng(), end.lng())),
            new window.google.maps.LatLng(Math.max(s.lat(), end.lat()), Math.max(s.lng(), end.lng())),
          ),
          map, ...SHAPE_STYLE,
        });
        drawnShapes.push(rect);
        const rectShape = { type: 'rectangle', nex: Math.max(s.lng(), end.lng()), ney: Math.max(s.lat(), end.lat()), swx: Math.min(s.lng(), end.lng()), swy: Math.min(s.lat(), end.lat()) };
        showAreaPopupG(topOfBounds(rect.getBounds()), computeArea(rectShape));
        onCreatedRef.current?.(rectShape);
      }
    };

    const onKeyDown = e => {
      if (e.key === 'Escape') { setDrawMode(null); pickMode = false; exitEdit(false); }
    };

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearPrev();
      const ctrlArr = map.controls[window.google.maps.ControlPosition.LEFT_TOP];
      const idx = ctrlArr.getArray().indexOf(TB);
      if (idx !== -1) ctrlArr.removeAt(idx);
      window.google.maps.event.removeListener(clickL);
      window.google.maps.event.removeListener(dblClickL);
      window.google.maps.event.removeListener(mouseDownL);
      window.google.maps.event.removeListener(mouseMoveL);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      if (popupAnchor) { popupAnchor.setMap(null); popupAnchor = null; }
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (circleRef.current) { circleRef.current.setMap(null); circleRef.current = null; }
    if (!circleData) return;
    circleRef.current = new window.google.maps.Circle({ center: circleData.center, radius: circleData.radius, map: mapRef.current, ...SHAPE_STYLE });
    mapRef.current.panTo(circleData.center);
    mapRef.current.setZoom(13);
  }, [circleData]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (userMarkerRef.current) { userMarkerRef.current.setMap(null); userMarkerRef.current = null; }
    if (!userMarker) return;
    userMarkerRef.current = new window.google.maps.Marker({
      position: { lat: userMarker.lat, lng: userMarker.lng }, map: mapRef.current,
      icon: { url: makePinUrl('#e53935'), scaledSize: new window.google.maps.Size(24, 36), anchor: new window.google.maps.Point(12, 36) },
      zIndex: 1000,
    });
    mapRef.current.panTo({ lat: userMarker.lat, lng: userMarker.lng });
  }, [userMarker]);

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

  useEffect(() => {
    allMkrsRef.current.forEach(m => m.setMap(null)); allMkrsRef.current = [];
    if (!mapRef.current || !allMarkers?.length) return;
    allMarkers.forEach(item => {
      const lat = parseFloat(item.int_latitude), lng = parseFloat(item.int_longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      const color = item._catColor ?? TI_COLORS[item.ti_id] ?? '#1565c0';
      const marker = new window.google.maps.Marker({
        position: { lat, lng }, map: mapRef.current,
        icon: { url: makePinUrl(color, 'small'), scaledSize: new window.google.maps.Size(16, 24), anchor: new window.google.maps.Point(8, 24) },
      });
      marker.addListener('click', () => { infoWinRef.current.setContent(buildInfoHtml(item)); infoWinRef.current.open(mapRef.current, marker); });
      allMkrsRef.current.push(marker);
    });
  }, [allMarkers]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (subShapeRef.current) { subShapeRef.current.setMap(null); subShapeRef.current = null; }
    if (!subShape) return;
    const geoJson = (subShape.type === 'Feature' || subShape.type === 'FeatureCollection') ? subShape : { type: 'Feature', geometry: subShape };
    const dataLayer = new window.google.maps.Data({ map: mapRef.current });
    dataLayer.addGeoJson(geoJson);
    const s = subShape._style ?? {};
    dataLayer.setStyle({ strokeColor: s.color ?? '#6a1b9a', strokeWeight: 2, strokeOpacity: 0.85, fillColor: s.fillColor ?? '#ce93d8', fillOpacity: 0.12 });
    subShapeRef.current = dataLayer;
    const bounds = new window.google.maps.LatLngBounds();
    dataLayer.forEach(f => f.getGeometry()?.forEachLatLng(ll => bounds.extend(ll)));
    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 24);
  }, [subShape]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

export default function GoogleMapView(props) {
  return <GMapInner {...props} />;
}
