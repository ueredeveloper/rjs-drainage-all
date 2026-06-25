import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import LayerPanel from './LayerPanel';
import ElemWaterUsage from './components/ElemWaterUsage';
import { iwManualIcon, iwTubularIcon, iwSuperficialIcon, iwBarragemIcon, iwEfluenteIcon, iwPluvialIcon, iwDefaultIcon } from '../assets/svg/svgs-icons';
import { usePlanoPilotoLayer } from './layers/usePlanoPilotoLayer';
import { useSetorizacaoLayer } from './layers/useSetorizacaoLayer';
import SadDfHud from './SadDfHud';
const BRASILIA  = { lat: -15.7948528, lng: -47.8831189 };
const TI_COLORS = { 1: '#2e7d32', 2: '#0277bd', 3: '#f57f17', 4: '#6a1b9a', 5: '#bf360c' };

const SHAPE_STYLE = {
  strokeColor: '#1565c0', strokeWeight: 2,
  fillColor: '#1565c0', fillOpacity: 0.18,
};


const USER_SHAPE_STYLE = {
  strokeColor: '#c62828', strokeWeight: 3,
  fillColor: '#c62828', fillOpacity: 0.18,
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

function makePinElement(url, w, h) {
  const img = document.createElement('img');
  img.src = url;
  img.style.cssText = `width:${w}px;height:${h}px;display:block;`;
  return img;
}

function getTypeSvg(item) {
  const key = (item._catLabel ?? '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
  let fn;
  if (key.includes('superficial'))    fn = iwSuperficialIcon;
  else if (key.includes('subterr')) {
    const tp = (item.tp_descricao ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    fn = (tp.includes('manual') || tp.includes('raso')) ? iwManualIcon : iwTubularIcon;
  }
  else if (key.includes('pluvial'))   fn = iwPluvialIcon;
  else if (key.includes('efluente'))  fn = iwEfluenteIcon;
  else if (key.includes('barragem'))  fn = iwBarragemIcon;
  else                                 fn = iwDefaultIcon;
  let svg = fn()
    .replace(/^[\s\S]*?(?=<svg[\s>])/i, '')  // remove XML declaration e comentários antes de <svg
    .trim();
  svg = svg.replace(/<svg([^>]*)>/i, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+(width|height)="[^"]*"/g, '')   // remove width/height explícitos
      .replace(/\s+style="[^"]*"/g, '');             // remove style (enable-background, etc.)
    return `<svg width="100%" height="100%" style="display:block;background:transparent;" ${cleaned.trim()}>`;
  });
  return svg;
}

function buildInfoHtml(item) {
  const color = item._catColor ?? TI_COLORS[item.ti_id] ?? '#1565c0';
  const lat = parseFloat(item.int_latitude), lng = parseFloat(item.int_longitude);
  const icon = getTypeSvg(item);
  const td1 = 'style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"';
  const td2 = 'style="color:#263238;"';
  const row = (label, val) => val ? `<tr><td ${td1}><b>${label}</b></td><td ${td2}>${val}</td></tr>` : '';
  const fmtDate = iso => { if (!iso) return null; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('pt-BR'); };
  const fmtDoc  = v => { if (!v) return null; const n = String(v).replace(/\D/g, ''); if (n.length === 11) return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); if (n.length === 14) return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); return v; };
  return `
    <div style="font-family:Roboto,Arial,sans-serif;min-width:210px;max-width:310px;">
      <div style="display:flex;align-items:center;gap:8px;
                  border-bottom:2px solid ${color};padding-bottom:5px;margin-bottom:6px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;
                     width:44px;height:44px;border-radius:8px;
                     background:transparent;flex-shrink:0;overflow:hidden;padding:4px;">
          ${icon}
        </span>
        <span style="font-weight:700;font-size:13px;color:#1a237e;line-height:1.3;">
          ${item.us_nome ?? '—'}
        </span>
      </div>
      <table style="width:100%;font-size:11px;border-collapse:collapse;line-height:1.7;">
        <tr><td ${td1}><b>Processo</b></td><td ${td2}>${item.int_processo ?? '—'}</td></tr>
        <tr><td ${td1}><b>CPF/CNPJ</b></td><td ${td2}>${fmtDoc(item.us_cpf_cnpj) ?? '—'}</td></tr>
        ${row('Núm. do Ato', item.int_num_ato)}
        ${row('Endereço', item.emp_endereco)}
        ${row('Situação', item.sp_descricao)}
        ${row('Publicação', fmtDate(item.int_data_publicacao))}
        ${row('Vencimento', fmtDate(item.int_data_vencimento))}
        ${row('Bacia', item.bh_nome)}
        ${row('Unid. Hidro.', item.uh_nome)}
        <tr><td ${td1}><b>Tipo</b></td><td style="color:${color};font-weight:600;">${item._catLabel ?? '—'}</td></tr>
        ${!isNaN(lat) && !isNaN(lng)
          ? `<tr><td ${td1}><b>Lat/Lng</b></td><td ${td2}>${lat.toFixed(6)}, ${lng.toFixed(6)}</td></tr>`
          : ''}
      </table>
    </div>`;
}

// polígono → retângulo → círculo → linha de distância
const DRAW_BTNS = [
  { mode: 'polygon',   title: 'Polígono',  svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12,2 21,8 18,20 6,20 3,8"/></svg>` },
  { mode: 'rectangle', title: 'Retângulo', svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="6" width="18" height="12" rx="1"/></svg>` },
  { mode: 'circle',    title: 'Círculo',   svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/></svg>` },
  { mode: 'polyline',  title: 'Medir distância', svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="21" x2="21" y2="3"/><circle cx="3" cy="21" r="2.2" fill="currentColor" stroke="none"/><circle cx="21" cy="3" r="2.2" fill="currentColor" stroke="none"/></svg>` },
];

const BTN_CSS = [
  'display:flex', 'align-items:center', 'justify-content:center',
  'width:30px', 'height:30px', 'background:#fff',
  'border:none', 'border-bottom:1px solid #ccc',
  'cursor:pointer', 'padding:0',
  'transition:background 0.18s,color 0.18s,box-shadow 0.18s,transform 0.15s',
  'text-decoration:none',
  'outline:none',
  'position:relative',
].join(';');

const BAR_CSS = 'display:flex;flex-direction:column;background:#fff;border-radius:4px;box-shadow:0 1px 5px rgba(0,0,0,0.4);overflow:visible;';

function makeBtn(innerHTML, title, color = '#555') {
  const a = document.createElement('a');
  a._defaultColor = color;
  a.href = '#'; a.title = title; a.innerHTML = innerHTML;
  a.style.cssText = `${BTN_CSS};color:${color};`;
  a.addEventListener('click', e => e.preventDefault());

  const isRed = color === '#c62828';
  const hoverBg    = isRed ? '#fce8e8' : '#dbeafe';
  const hoverColor = isRed ? '#c62828' : '#1565c0';
  const hoverShadow = isRed
    ? 'inset 2px 0 0 #c62828, 0 2px 6px rgba(198,40,40,0.15)'
    : 'inset 2px 0 0 #1565c0, 0 2px 6px rgba(21,101,192,0.12)';

  a.addEventListener('mouseenter', () => {
    if (a._active) return;
    a.style.background = hoverBg;
    a.style.color = hoverColor;
    a.style.boxShadow = hoverShadow;
    a.style.transform = 'scale(1.08)';
    a.style.zIndex = '2';
  });
  a.addEventListener('mouseleave', () => {
    if (a._active) return;
    a.style.background = '#fff';
    a.style.color = color;
    a.style.boxShadow = '';
    a.style.transform = '';
    a.style.zIndex = '';
  });
  return a;
}

function makeBar() {
  const d = document.createElement('div');
  d.style.cssText = BAR_CSS;
  return d;
}


// ─── Componente interno ───────────────────────────────────────────────────────
function GMapInner({ circleData, onShapeCreated, markerData, userMarker, onPickCoordinate, onClearAll, onEditSave, allMarkers, subShape, clearShapesTrigger, onLayerFeatureSearch, initialLayerState, onLayerStateChange, lastDrawnPageId, removeShapeTrigger, introReady = true, onInitialMarker }) {
  const [mapInstance, setMapInstance]         = useState(null);
  const [isWaterAvailable, setIsWaterAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen]       = useState(false);
  const [layerClearTrigger, setLayerClearTrigger] = useState(0);
  const [hudPhase, setHudPhase]                   = useState('intro');
  const [introMapInstance, setIntroMapInstance]   = useState(null);
  const introStartedRef         = useRef(false);
  const pilotLayersRef          = useRef({});
  const setzLayersRef           = useRef({});
  const polygonsClearedRef      = useRef(false);
  const introBrasiliaMarkerRef  = useRef(null);
  const coordCircleTimerRef     = useRef(null);
  const setLayerClearRef    = useRef(null);
  const setIntroMapRef      = useRef(null);
  setLayerClearRef.current  = setLayerClearTrigger;
  setIntroMapRef.current    = setIntroMapInstance;
  const containerRef      = useRef(null);
  const panelRootRef      = useRef(null);
  const waterUsageRootRef = useRef(null);
  const mapRef            = useRef(null);
  const circleRef         = useRef(null);
  const userMarkerRef     = useRef(null);
  const selectedMkrRef    = useRef(null);
  const allMkrsRef        = useRef([]);
  const clearDrawnRef     = useRef(null);
  const allCirclesRef     = useRef([]);
  const subShapeRef       = useRef(null);
  const infoWinRef        = useRef(null);
  const areaInfoWinsRef          = useRef([]);
  const areaAnchorsRef           = useRef([]);
  const shapeStyleIWRef          = useRef(null);
  const shapeStatesRef           = useRef(new Map());
  const pendingCircleAreaRef     = useRef(null);
  const addShapeClickListenerRef = useRef(null);
  const coordCircleRef           = useRef(null);
  const pageShapesRef            = useRef(new Map());
  const drawnShapesRef           = useRef([]);
  const removeFromDrawnRef       = useRef(null);
  const distLinesRef             = useRef([]);
  const distIWsRef               = useRef([]);
  const distAnchorsRef           = useRef([]);
  const markerClickSuppressRef   = useRef(false);
  const onCreatedRef        = useRef(onShapeCreated);
  const onPickRef           = useRef(onPickCoordinate);
  const onClearRef          = useRef(onClearAll);
  const onEditSaveRef       = useRef(onEditSave);
  const onInitialMarkerRef  = useRef(onInitialMarker);

  onCreatedRef.current       = onShapeCreated;
  onPickRef.current          = onPickCoordinate;
  onClearRef.current         = onClearAll;
  onInitialMarkerRef.current = onInitialMarker;
  onEditSaveRef.current = onEditSave;

  usePlanoPilotoLayer(introMapInstance, pilotLayersRef);
  useSetorizacaoLayer(introMapInstance, setzLayersRef);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    requestAnimationFrame(() => {
      window.google.maps.event.trigger(mapRef.current, 'resize');
    });
  }, [isFullscreen]);

  // Inicia a animação de intro somente quando o mapa está pronto E o login foi concluído
  useEffect(() => {
    if (!introReady || !mapInstance || introStartedRef.current) return;
    introStartedRef.current = true;
    setIntroMapInstance(mapInstance);        // dispara os hooks de polígonos
    const startTime = Date.now();
    const INTRO_MS  = 5000;
    const fired     = { current: false };

    const fireIntroEnd = () => {
      if (fired.current) return;
      fired.current = true;
      setHudPhase('ambient');
      // null → cleanup dos hooks cancela timers/intervals e remove todas as camadas
      setIntroMapInstance(null);
      setTimeout(() => {
        introBrasiliaMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
          position: BRASILIA, map: mapRef.current,
          content: makePinElement(makePinUrl('#e53935'), 24, 36),
          zIndex: 1000,
        });
        onInitialMarkerRef.current?.(BRASILIA);
      }, 300);
    };

    const introTimer = setTimeout(fireIntroEnd, INTRO_MS);

    // Page Visibility API: dispara imediatamente ao voltar à aba se 7s já passaram
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - startTime >= INTRO_MS) {
        clearTimeout(introTimer);
        fireIntroEnd();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(introTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [introReady, mapInstance]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: BRASILIA, zoom: 11,
      mapTypeId: 'satellite',
      mapId: 'DEMO_MAP_ID',
      streetViewControl: window.innerWidth >= 900,
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: window.google.maps.ControlPosition.TOP_LEFT,
      },
    });
    mapRef.current     = map;
    infoWinRef.current = new window.google.maps.InfoWindow();
    const shapeStyleIW = new window.google.maps.InfoWindow();
    shapeStyleIWRef.current = shapeStyleIW;

    polygonsClearedRef.current = true;

    // injeta o container do LayerPanel usando o sistema de controles do GMaps (persiste em fullscreen)
    const panelContainer = document.createElement('div');
    panelContainer.id = 'map-layer-zoom-controls';
    panelContainer.style.cssText = 'z-index:999999;position:absolute;right:14px;bottom:0px;';
    map.controls[window.google.maps.ControlPosition.BOTTOM_RIGHT].push(panelContainer);
    panelRootRef.current = panelContainer;

    const waterUsageContainer = document.createElement('div');
    map.controls[window.google.maps.ControlPosition.BOTTOM_CENTER].push(waterUsageContainer);
    waterUsageRootRef.current = waterUsageContainer;

    setMapInstance(map);

    let drawnShapes  = [];
    let editMode     = false;
    let editBtnEl    = null;

    removeFromDrawnRef.current = (s) => {
      drawnShapes = drawnShapes.filter(x => x !== s);
      drawnShapesRef.current = drawnShapesRef.current.filter(x => x !== s);
    };

    const clearAreaPopups = () => {
      areaInfoWinsRef.current.forEach(iw => { try { iw.close(); } catch (_) {} });
      areaInfoWinsRef.current = [];
      areaAnchorsRef.current.forEach(a => { try { a.map = null; } catch (_) {} });
      areaAnchorsRef.current = [];
    };

    const clearDistLines = () => {
      distLinesRef.current.forEach(l => { try { l.setMap(null); } catch (_) {} });
      distLinesRef.current = [];
      distIWsRef.current.forEach(iw => { try { iw.close(); } catch (_) {} });
      distIWsRef.current = [];
      distAnchorsRef.current.forEach(a => { try { a.map = null; } catch (_) {} });
      distAnchorsRef.current = [];
    };

    clearDrawnRef.current = () => {
      drawnShapes.forEach(s => { s.setMap(null); shapeStatesRef.current.delete(s); });
      drawnShapes = [];
      drawnShapesRef.current = [];
      allCirclesRef.current.forEach(c => { try { c.setMap(null); } catch (_) {} shapeStatesRef.current.delete(c); });
      allCirclesRef.current = [];
      circleRef.current = null;
      coordCircleRef.current = null;
      pendingCircleAreaRef.current = null;
      pageShapesRef.current.clear();
      shapeStyleIW.close();
      clearAreaPopups();
      clearDistLines();
    };

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
      const iw = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family:Roboto,Arial,sans-serif;min-width:150px;text-align:center;padding:2px 4px;">
            <div style="font-size:10px;color:#78909c;text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px;">Área da camada</div>
            <div style="font-size:12px;color:#263238;">${fmtArea(areaM2)}</div>
          </div>
        `,
      });
      const hiddenEl = document.createElement('div');
      hiddenEl.style.cssText = 'display:none;width:0;height:0;';
      const anchor = new window.google.maps.marker.AdvancedMarkerElement({ position: topLatLng, map, content: hiddenEl });
      iw.open({ map, anchor });
      areaInfoWinsRef.current.push(iw);
      areaAnchorsRef.current.push(anchor);
      return { iw, anchor };
    };

    // ── Painel de estilo das camadas desenhadas ───────────────────────────────
    const STYLE_COLORS = [
      { hex: '#2e7d32', label: 'Verde' },
      { hex: '#1565c0', label: 'Azul' },
      { hex: '#c62828', label: 'Vermelho' },
      { hex: '#212121', label: 'Preto' },
    ];
    const defaultShapeState = (userDrawn = false) => ({
      strokeColor: userDrawn ? USER_SHAPE_STYLE.strokeColor : SHAPE_STYLE.strokeColor,
      fillColor:   userDrawn ? USER_SHAPE_STYLE.fillColor   : SHAPE_STYLE.fillColor,
      fillOpacity: SHAPE_STYLE.fillOpacity,
      areaIW: null, areaAnchor: null, areaVisible: false,
      shapeDesc: null,
      _listenerAdded: false,
    });
    const applyShapeStyle = (shape, state) =>
      shape.setOptions({ strokeColor: state.strokeColor, fillColor: state.fillColor, fillOpacity: state.fillOpacity });

    const buildStylePanelHtml = (state) => {
      const opacityPct = Math.round(state.fillOpacity * 100);
      const swatches = (prefix, activeColor) =>
        STYLE_COLORS.map(({ hex, label }) => {
          const sel = hex === activeColor;
          return `<button data-nd="${prefix}" data-color="${hex}" title="${label}" class="nd-swatch-btn"
            style="width:22px;height:22px;border-radius:4px;cursor:pointer;padding:0;outline:none;
                   border:2px solid ${sel ? '#000' : 'transparent'};background:${hex};"></button>`;
        }).join('');
      const hasArea = !!state.areaIW;
      return `<style>.nd-swatch-btn{transition:transform .15s,box-shadow .15s}.nd-swatch-btn:hover{transform:scale(1.18);box-shadow:0 0 0 3px rgba(0,0,0,0.22)}.nd-swatch-btn:active{transform:scale(.92)}.nd-act-btn:not([disabled]):hover{filter:brightness(.88)}.nd-act-btn:not([disabled]):active{filter:brightness(.72);transform:scale(.97)}.nd-act-btn{transition:filter .15s,transform .1s}</style>
      <div id="nd-sp" style="font-family:Roboto,Arial,sans-serif;min-width:200px;padding:2px 0 4px;">
        <div style="font-weight:700;font-size:11px;color:#1565c0;margin-bottom:8px;letter-spacing:.4px;text-transform:uppercase;">Estilo da camada</div>
        <div style="margin-bottom:7px;">
          <div style="font-size:10px;color:#78909c;font-weight:600;margin-bottom:4px;">Cor da linha</div>
          <div style="display:flex;gap:5px;">${swatches('stroke', state.strokeColor)}</div>
        </div>
        <div style="margin-bottom:7px;">
          <div style="font-size:10px;color:#78909c;font-weight:600;margin-bottom:4px;">Cor do fundo</div>
          <div style="display:flex;gap:5px;">${swatches('fill', state.fillColor)}</div>
        </div>
        <div style="margin-bottom:7px;">
          <div style="font-size:10px;color:#78909c;font-weight:600;margin-bottom:3px;">
            Transparência: <span id="nd-opa-val">${opacityPct}%</span>
          </div>
          <input id="nd-opa-slider" type="range" min="0" max="100" value="${opacityPct}"
            style="width:100%;accent-color:#1565c0;height:4px;cursor:pointer;">
        </div>
        <button id="nd-toggle-area" class="nd-act-btn"
          style="width:100%;padding:4px 8px;font-size:10px;font-weight:600;border-radius:4px;cursor:pointer;
                 border:1px solid ${hasArea ? '#1565c0' : '#ccc'};
                 background:${!hasArea ? '#f5f5f5' : state.areaVisible ? '#1565c0' : '#fff'};
                 color:${!hasArea ? '#bbb' : state.areaVisible ? '#fff' : '#1565c0'};"
          ${!hasArea ? 'disabled' : ''}>
          ${!hasArea ? 'Sem info de área' : (state.areaVisible ? 'Ocultar' : 'Mostrar') + ' info de área'}
        </button>
        ${state.shapeDesc ? `<button id="nd-search-shape" class="nd-act-btn"
          style="width:100%;padding:4px 8px;font-size:10px;font-weight:600;border-radius:4px;cursor:pointer;
                 border:1px solid #1565c0;background:#1565c0;color:#fff;margin-top:5px;">
          Atualizar pesquisa
        </button>` : ''}
      </div>`;
    };

    const setupStyleListeners = (shape, state) => {
      const panel = document.getElementById('nd-sp');
      if (!panel) return;
      panel.querySelectorAll('[data-nd="stroke"]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.strokeColor = btn.dataset.color;
          applyShapeStyle(shape, state);
          shapeStyleIW.setContent(buildStylePanelHtml(state));
          window.google.maps.event.addListenerOnce(shapeStyleIW, 'domready', () => setupStyleListeners(shape, state));
        });
      });
      panel.querySelectorAll('[data-nd="fill"]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.fillColor = btn.dataset.color;
          applyShapeStyle(shape, state);
          shapeStyleIW.setContent(buildStylePanelHtml(state));
          window.google.maps.event.addListenerOnce(shapeStyleIW, 'domready', () => setupStyleListeners(shape, state));
        });
      });
      const slider = document.getElementById('nd-opa-slider');
      const valEl  = document.getElementById('nd-opa-val');
      if (slider) {
        slider.addEventListener('input', () => {
          state.fillOpacity = parseInt(slider.value) / 100;
          if (valEl) valEl.textContent = `${slider.value}%`;
          applyShapeStyle(shape, state);
        });
      }
      const toggleBtn = document.getElementById('nd-toggle-area');
      if (toggleBtn && state.areaIW) {
        toggleBtn.addEventListener('click', () => {
          state.areaVisible = !state.areaVisible;
          if (state.areaVisible) state.areaIW.open({ map, anchor: state.areaAnchor });
          else state.areaIW.close();
          shapeStyleIW.setContent(buildStylePanelHtml(state));
          window.google.maps.event.addListenerOnce(shapeStyleIW, 'domready', () => setupStyleListeners(shape, state));
        });
      }
      const searchBtn = document.getElementById('nd-search-shape');
      if (searchBtn && state.shapeDesc) {
        searchBtn.addEventListener('click', () => {
          onCreatedRef.current?.(state.shapeDesc);
          shapeStyleIW.close();
        });
      }
    };

    const openShapeStylePanel = (shape, latLng) => {
      const state = shapeStatesRef.current.get(shape) ?? defaultShapeState();
      shapeStatesRef.current.set(shape, state);
      shapeStyleIW.setPosition(latLng);
      shapeStyleIW.setContent(buildStylePanelHtml(state));
      shapeStyleIW.open(map);
      window.google.maps.event.addListenerOnce(shapeStyleIW, 'domready', () => setupStyleListeners(shape, state));
    };

    const addShapeClickListener = (shape, areaInfo = null, shapeDesc = null, userDrawn = false) => {
      const state = shapeStatesRef.current.get(shape) ?? defaultShapeState(userDrawn);
      if (areaInfo) { state.areaIW = areaInfo.iw; state.areaAnchor = areaInfo.anchor; state.areaVisible = true; }
      if (shapeDesc) state.shapeDesc = shapeDesc;
      shapeStatesRef.current.set(shape, state);
      if (!state._listenerAdded) {
        state._listenerAdded = true;
        shape.addListener('click', e => openShapeStylePanel(shape, e.latLng));
      }
    };
    addShapeClickListenerRef.current = addShapeClickListener;

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
        editBtnEl.style.boxShadow = '';
        editBtnEl.style.transform = '';
        editBtnEl.title = 'Editar camadas';
      }
      const all = [...drawnShapes, ...allCirclesRef.current];
      all.forEach(s => { try { s.setEditable(false); } catch (_) {} });

      if (!save) return;
      onEditSaveRef.current?.();
      clearAreaPopups();

      allCirclesRef.current.forEach(c => {
        const ctr = c.getCenter();
        const cs = { type: 'circle', center: { lat: ctr.lat(), lng: ctr.lng() }, radius: Math.round(c.getRadius()) };
        const areaInfo = showAreaPopupG(topOfCircle(ctr, c.getRadius()), computeArea(cs));
        addShapeClickListener(c, areaInfo, cs);
        onCreatedRef.current?.(cs);
      });

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
        if (shape) {
          const areaInfo = showAreaPopupG(center, computeArea(shape));
          addShapeClickListener(s, areaInfo, shape);
          onCreatedRef.current?.(shape);
        }
      });
    };

    const clearAll = () => {
      exitEdit(false);
      drawnShapes.forEach(s => { s.setMap(null); shapeStatesRef.current.delete(s); }); drawnShapes = []; drawnShapesRef.current = [];
      allCirclesRef.current.forEach(c => { try { c.setMap(null); } catch (_) {} shapeStatesRef.current.delete(c); });
      allCirclesRef.current = [];
      circleRef.current = null;
      pendingCircleAreaRef.current = null;
      shapeStyleIW.close();
      clearAreaPopups();
      clearDistLines();
      if (userMarkerRef.current)  { userMarkerRef.current.map = null;  userMarkerRef.current = null; }
      if (selectedMkrRef.current) { selectedMkrRef.current.map = null; selectedMkrRef.current = null; }
      allMkrsRef.current.forEach(m => { m.map = null; }); allMkrsRef.current = [];
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
      map.setOptions({ draggableCursor: m ? 'crosshair' : null, disableDoubleClickZoom: m === 'polygon' || m === 'polyline' });
      Object.entries(drawBtnMap).forEach(([key, btn]) => {
        const active = key === m;
        btn._active = active;
        btn.style.background = active ? '#d8e8f8' : '#fff';
        btn.style.color = active ? '#1565c0' : '#444';
        btn.style.boxShadow = '';
        btn.style.transform = '';
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
    const pickSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
      pickBtn.style.boxShadow   = '';
      pickBtn.style.transform   = '';
    });
    pickBar.appendChild(pickBtn);
    TB.appendChild(pickBar);

    // ── Grupo 3: editar + remover ─────────────────────────────────────────
    const editSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>`;
    const removeSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.81 14.99l1.19-.92-1.43-1.43-1.19.92 1.43 1.43zm-.45-4.72L21 9l-9-7-2.91 2.27 7.87 7.88 2.4-1.88zM3.27 1L2 2.27l4.22 4.22L3 9l1.63 1.27L12 16l2.1-1.63 1.43 1.43L12 18.54l-7.37-5.73L3 14.07l9 7 4.95-3.85L20.73 21 22 19.73 3.27 1z"/></svg>`;
    const actionBar = makeBar();

    editBtnEl = makeBtn(editSvg, 'Editar');
    editBtnEl.addEventListener('click', e => {
      e.preventDefault();
      if (!editMode) {
        const all = [...drawnShapes, ...allCirclesRef.current];
        if (!all.length) return;
        editMode = true;
        editBtnEl._active = true;
        editBtnEl.style.background = '#d8e8f8';
        editBtnEl.style.color = '#1565c0';
        editBtnEl.style.boxShadow = '';
        editBtnEl.style.transform = '';
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
      pickBtn.style.boxShadow = '';
      pickBtn.style.transform = '';
      map.getDiv().style.cursor = '';
      setIntroMapRef.current?.(null);
      setLayerClearRef.current?.(t => t + 1);
      onClearRef.current?.();
    });
    actionBar.appendChild(removeBtn);
    TB.appendChild(actionBar);

    // --- listeners ---
    const clickL = map.addListener('click', e => {
      if (pickMode) {
        pickMode = false; pickBtn._active = false;
        map.getDiv().style.cursor = '';
        pickBtn.style.background = '#fff'; pickBtn.style.color = '#555';
        pickBtn.style.boxShadow = ''; pickBtn.style.transform = '';
        onPickRef.current?.({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        return;
      }
      if (!drawMode) return;
      if (drawMode === 'polygon') points.push(e.latLng);
      if (drawMode === 'polyline') points.push(e.latLng);
    });

    const dblClickL = map.addListener('dblclick', (e) => {
      if (drawMode === 'polygon' && points.length >= 3) {
        e.stop();
        const finalPts = [...points]; setDrawMode(null);
        const poly = new window.google.maps.Polygon({ paths: finalPts, map, ...USER_SHAPE_STYLE });
        drawnShapes.push(poly);
        drawnShapesRef.current.push(poly);
        const pts = finalPts.map(p => [p.lng(), p.lat()]);
        const shape = { type: 'polygon', points: [...pts, pts[0]] };
        addShapeClickListener(poly, showAreaPopupG(topOfPath(finalPts), computeArea(shape)), shape, true);
        onCreatedRef.current?.(shape);
      }
      if (drawMode === 'polyline' && points.length >= 2) {
        e.stop();
        const finalPts = [...points]; setDrawMode(null); clearPrev();
        let totalDist = 0;
        for (let i = 0; i < finalPts.length - 1; i++) {
          totalDist += HAVERSINE(finalPts[i].lat(), finalPts[i].lng(), finalPts[i + 1].lat(), finalPts[i + 1].lng());
        }
        const line = new window.google.maps.Polyline({
          path: finalPts, map,
          strokeColor: '#e65100', strokeWeight: 2.5, strokeOpacity: 0.9, clickable: false,
        });
        distLinesRef.current.push(line);
        const fmt = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
        const distM = Math.round(totalDist);
        const distKm = totalDist / 1000;
        const lastPt = finalPts[finalPts.length - 1];
        const iw = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family:Roboto,Arial,sans-serif;min-width:150px;text-align:center;padding:2px 4px;">
              <div style="font-size:10px;color:#78909c;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">Distância total</div>
              <div style="font-size:14px;color:#bf360c;font-weight:700;">${fmt(distM)} m</div>
              <div style="font-size:12px;color:#546e7a;margin-top:2px;">${fmt(distKm)} km</div>
            </div>
          `,
        });
        const hiddenEl = document.createElement('div');
        hiddenEl.style.cssText = 'display:none;width:0;height:0;';
        const anchor = new window.google.maps.marker.AdvancedMarkerElement({ position: lastPt, map, content: hiddenEl });
        iw.open({ map, anchor });
        distIWsRef.current.push(iw);
        distAnchorsRef.current.push(anchor);
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
        previews = [new window.google.maps.Polyline({ path: [...points, e.latLng], map, strokeColor: USER_SHAPE_STYLE.strokeColor, strokeWeight: USER_SHAPE_STYLE.strokeWeight, strokeOpacity: 0.85, clickable: false })];
      }
      if (drawMode === 'polyline' && points.length > 0) {
        previews = [new window.google.maps.Polyline({ path: [...points, e.latLng], map, strokeColor: '#e65100', strokeWeight: 2.5, strokeOpacity: 0.9, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '12px' }], clickable: false })];
      }
      if (drawMode === 'circle' && dragging && startPt) {
        const r = HAVERSINE(startPt.lat(), startPt.lng(), e.latLng.lat(), e.latLng.lng());
        previews = [new window.google.maps.Circle({ center: startPt, radius: r, map, ...USER_SHAPE_STYLE, clickable: false })];
      }
      if (drawMode === 'rectangle' && dragging && startPt) {
        const SW = new window.google.maps.LatLng(Math.min(startPt.lat(), e.latLng.lat()), Math.min(startPt.lng(), e.latLng.lng()));
        const NE = new window.google.maps.LatLng(Math.max(startPt.lat(), e.latLng.lat()), Math.max(startPt.lng(), e.latLng.lng()));
        previews = [new window.google.maps.Rectangle({ bounds: new window.google.maps.LatLngBounds(SW, NE), map, ...USER_SHAPE_STYLE, clickable: false })];
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
        pendingCircleAreaRef.current = showAreaPopupG(topOfCircle(s, radius), computeArea(circShape));
        onCreatedRef.current?.(circShape);
      }
      if (drawMode === 'rectangle' && startPt && lastDrag) {
        const s = startPt, end = lastDrag; clearPrev(); setDrawMode(null); startPt = null; lastDrag = null;
        const rect = new window.google.maps.Rectangle({
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(Math.min(s.lat(), end.lat()), Math.min(s.lng(), end.lng())),
            new window.google.maps.LatLng(Math.max(s.lat(), end.lat()), Math.max(s.lng(), end.lng())),
          ),
          map, ...USER_SHAPE_STYLE,
        });
        drawnShapes.push(rect);
        drawnShapesRef.current.push(rect);
        const rectShape = { type: 'rectangle', nex: Math.max(s.lng(), end.lng()), ney: Math.max(s.lat(), end.lat()), swx: Math.min(s.lng(), end.lng()), swy: Math.min(s.lat(), end.lat()) };
        addShapeClickListener(rect, showAreaPopupG(topOfBounds(rect.getBounds()), computeArea(rectShape)), rectShape, true);
        onCreatedRef.current?.(rectShape);
      }
    };

    const onKeyDown = e => {
      if (e.key === 'Escape') { setDrawMode(null); pickMode = false; exitEdit(false); }
    };

    // ── Touch: círculo e retângulo ────────────────────────────────────────────
    // Converte coordenada de toque (px) em LatLng usando a projeção do mapa
    const getTouchLatLng = (touch) => {
      const el = containerRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const proj = map.getProjection();
      if (!proj) return null;
      const scale = Math.pow(2, map.getZoom());
      const center = proj.fromLatLngToPoint(map.getCenter());
      return proj.fromPointToLatLng(new window.google.maps.Point(
        center.x + (x - el.offsetWidth  / 2) / scale,
        center.y + (y - el.offsetHeight / 2) / scale,
      ));
    };

    const onTouchStart = (e) => {
      if (drawMode !== 'circle' && drawMode !== 'rectangle') return;
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const latLng = getTouchLatLng(touch);
      if (!latLng) return;
      startPt = latLng; dragging = true; map.setOptions({ draggable: false });
    };

    const onTouchMove = (e) => {
      if (!dragging || !startPt) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const latLng = getTouchLatLng(touch);
      if (!latLng) return;
      lastDrag = latLng;
      clearPrev();
      if (drawMode === 'circle') {
        const r = HAVERSINE(startPt.lat(), startPt.lng(), latLng.lat(), latLng.lng());
        previews = [new window.google.maps.Circle({ center: startPt, radius: r, map, ...USER_SHAPE_STYLE, clickable: false })];
      }
      if (drawMode === 'rectangle') {
        const SW = new window.google.maps.LatLng(Math.min(startPt.lat(), latLng.lat()), Math.min(startPt.lng(), latLng.lng()));
        const NE = new window.google.maps.LatLng(Math.max(startPt.lat(), latLng.lat()), Math.max(startPt.lng(), latLng.lng()));
        previews = [new window.google.maps.Rectangle({ bounds: new window.google.maps.LatLngBounds(SW, NE), map, ...USER_SHAPE_STYLE, clickable: false })];
      }
    };

    const onTouchEnd = () => onMouseUp();

    const containerEl = containerRef.current;
    containerEl.addEventListener('touchstart', onTouchStart, { passive: false });
    containerEl.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('touchend', onTouchEnd);

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
      containerEl.removeEventListener('touchstart', onTouchStart);
      containerEl.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      clearAreaPopups();
      if (panelContainer.parentNode) panelContainer.parentNode.removeChild(panelContainer);
      if (waterUsageContainer.parentNode) waterUsageContainer.parentNode.removeChild(waterUsageContainer);
      mapRef.current = null;
    };
  }, []);



  useEffect(() => {
    if (!mapRef.current) return;
    if (!circleData) {
      if (coordCircleRef.current) {
        const old = coordCircleRef.current;
        const st = shapeStatesRef.current.get(old);
        if (st?.areaIW) { try { st.areaIW.close(); } catch (_) {} }
        if (st?.areaAnchor) { try { st.areaAnchor.map = null; } catch (_) {} }
        shapeStatesRef.current.delete(old);
        allCirclesRef.current = allCirclesRef.current.filter(c => c !== old);
        try { old.setMap(null); } catch (_) {}
        coordCircleRef.current = null;
      }
      circleRef.current = null;
      return;
    }
    // Busca por coordenada (aba Geral): remove o círculo anterior antes de criar o novo
    if (circleData._replaceCoord && coordCircleRef.current) {
      const old = coordCircleRef.current;
      const st = shapeStatesRef.current.get(old);
      if (st?.areaIW) { try { st.areaIW.close(); } catch (_) {} }
      if (st?.areaAnchor) { try { st.areaAnchor.map = null; } catch (_) {} }
      shapeStatesRef.current.delete(old);
      allCirclesRef.current = allCirclesRef.current.filter(c => c !== old);
      try { old.setMap(null); } catch (_) {}
      coordCircleRef.current = null;
    }
    const circStyle = circleData._userDrawn ? USER_SHAPE_STYLE : SHAPE_STYLE;
    const circle = new window.google.maps.Circle({ center: circleData.center, radius: circleData.radius, map: mapRef.current, ...circStyle });
    circleRef.current = circle;
    allCirclesRef.current.push(circle);
    if (circleData._replaceCoord) coordCircleRef.current = circle;
    if (circleData._pageId) pageShapesRef.current.set(circleData._pageId, circle);
    addShapeClickListenerRef.current?.(circle, pendingCircleAreaRef.current, { type: 'circle', center: circleData.center, radius: circleData.radius }, circleData._userDrawn ?? false);
    pendingCircleAreaRef.current = null;
    if (!circleData._skipFly) {
      mapRef.current.panTo(circleData.center);
      mapRef.current.setZoom(13);
    }
    // remove o círculo de coordenada automaticamente após 2s
    if (circleData._replaceCoord) {
      clearTimeout(coordCircleTimerRef.current);
      coordCircleTimerRef.current = setTimeout(() => {
        const st = shapeStatesRef.current.get(circle);
        if (st?.areaIW) { try { st.areaIW.close(); } catch (_) {} }
        if (st?.areaAnchor) { try { st.areaAnchor.map = null; } catch (_) {} }
        shapeStatesRef.current.delete(circle);
        allCirclesRef.current = allCirclesRef.current.filter(c => c !== circle);
        if (coordCircleRef.current === circle) coordCircleRef.current = null;
        try { circle.setMap(null); } catch (_) {}
      }, 2000);
    }
  }, [circleData]);

  useEffect(() => {
    if (!clearShapesTrigger) return;
    clearDrawnRef.current?.();
    infoWinRef.current?.close();
  }, [clearShapesTrigger]);

  useEffect(() => {
    if (!lastDrawnPageId) return;
    const { pageId } = lastDrawnPageId;
    const last = drawnShapesRef.current[drawnShapesRef.current.length - 1];
    if (last) pageShapesRef.current.set(pageId, last);
  }, [lastDrawnPageId]);

  useEffect(() => {
    if (!removeShapeTrigger) return;
    const { pageId } = removeShapeTrigger;
    const shape = pageShapesRef.current.get(pageId);
    if (!shape) return;
    pageShapesRef.current.delete(pageId);
    const st = shapeStatesRef.current.get(shape);
    if (st?.areaIW) {
      try { st.areaIW.close(); } catch (_) {}
      areaInfoWinsRef.current = areaInfoWinsRef.current.filter(x => x !== st.areaIW);
    }
    if (st?.areaAnchor) {
      try { st.areaAnchor.map = null; } catch (_) {}
      areaAnchorsRef.current = areaAnchorsRef.current.filter(x => x !== st.areaAnchor);
    }
    shapeStatesRef.current.delete(shape);
    try { shape.setMap(null); } catch (_) {}
    allCirclesRef.current = allCirclesRef.current.filter(c => c !== shape);
    if (coordCircleRef.current === shape) coordCircleRef.current = null;
    removeFromDrawnRef.current?.(shape);
  }, [removeShapeTrigger]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!userMarker) return;
    if (userMarkerRef.current) { userMarkerRef.current.map = null; userMarkerRef.current = null; }
    // remove o marcador inicial de Brasília quando o usuário faz sua primeira busca
    if (introBrasiliaMarkerRef.current) { introBrasiliaMarkerRef.current.map = null; introBrasiliaMarkerRef.current = null; }
    const userPinEl = makePinElement(makePinUrl('#e53935'), 24, 36);
    const mkr = new window.google.maps.marker.AdvancedMarkerElement({
      position: { lat: userMarker.lat, lng: userMarker.lng },
      map: polygonsClearedRef.current ? mapRef.current : null,
      content: userPinEl,
      zIndex: 1000,
      gmpClickable: true,
    });
    if (userMarker.info) {
      userPinEl.style.cursor = 'pointer';
      userPinEl.addEventListener('click', e => {
        e.stopPropagation();
        markerClickSuppressRef.current = true;
        setTimeout(() => { markerClickSuppressRef.current = false; }, 100);
        infoWinRef.current.setContent(buildInfoHtml({ ...userMarker.info, _catColor: '#e53935', _catLabel: 'Usuário' }));
        infoWinRef.current.open({ map: mapRef.current, anchor: mkr });
      });
    }
    userMarkerRef.current = mkr;
    mapRef.current.panTo({ lat: userMarker.lat, lng: userMarker.lng });
  }, [userMarker]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedMkrRef.current) { selectedMkrRef.current.map = null; selectedMkrRef.current = null; }
    infoWinRef.current?.close();
    if (!markerData) return;
    const lat = parseFloat(markerData.int_latitude), lng = parseFloat(markerData.int_longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    const color = markerData._catColor ?? TI_COLORS[markerData.ti_id] ?? '#1565c0';
    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      position: { lat, lng },
      map: mapRef.current,
      content: makePinElement(makePinUrl(color), 24, 36),
    });
    infoWinRef.current.setContent(buildInfoHtml(markerData));
    infoWinRef.current.open({ map: mapRef.current, anchor: marker });
    selectedMkrRef.current = marker;
    mapRef.current.panTo({ lat, lng });
  }, [markerData]);

  useEffect(() => {
    allMkrsRef.current.forEach(m => { m.map = null; }); allMkrsRef.current = [];
    if (!mapRef.current || !allMarkers?.length) return;
    allMarkers.forEach(item => {
      const lat = parseFloat(item.int_latitude), lng = parseFloat(item.int_longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      const color = item._catColor ?? TI_COLORS[item.ti_id] ?? '#1565c0';
      const pinEl = makePinElement(makePinUrl(color, 'small'), 16, 24);
      pinEl.style.cursor = 'pointer';
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: mapRef.current,
        content: pinEl,
        gmpClickable: true,
      });
      pinEl.addEventListener('click', e => {
        e.stopPropagation();
        markerClickSuppressRef.current = true;
        setTimeout(() => { markerClickSuppressRef.current = false; }, 100);
        infoWinRef.current.setContent(buildInfoHtml(item));
        infoWinRef.current.open({ map: mapRef.current, anchor: marker });
      });
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <SadDfHud phase={hudPhase} ready={introReady} />
      {mapInstance && panelRootRef.current &&
        ReactDOM.createPortal(
          <LayerPanel map={mapInstance} mapType="gmaps" onFeatureSearch={onLayerFeatureSearch} onWaterUseChange={setIsWaterAvailable} clearTrigger={layerClearTrigger} initialLayerState={initialLayerState} onLayerStateChange={onLayerStateChange} isMarkerActive={() => markerClickSuppressRef.current} onLocate={(pos) => onPickRef.current?.(pos)} />,
          panelRootRef.current,
        )
      }
{mapInstance && waterUsageRootRef.current && isFullscreen && isWaterAvailable &&
        ReactDOM.createPortal(
          <ElemWaterUsage isFullscreen={true} isWaterAvailable={true} />,
          waterUsageRootRef.current,
        )
      }
    </div>
  );
}

export default function GoogleMapView(props) {
  return <GMapInner {...props} />;
}

