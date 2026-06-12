import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// Corrige ícones padrão quebrados pelo webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const BRASILIA   = [-15.7801, -47.9292];
const SHAPE_OPTS = { color: '#1565c0', fillColor: '#1565c0', fillOpacity: 0.08, weight: 2 };

const TI_COLORS = { 1: '#2e7d32', 2: '#0277bd', 3: '#f57f17', 4: '#6a1b9a', 5: '#bf360c' };

// Ícone SVG inline por tipo de outorga
const TYPE_SVG = {
  superficial: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.87 0-1.4-.27-2.05-.6C9.2 17.41 8.35 17 7 17s-2.2.42-2.95.8c-.65.33-1.17.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.27 2.05.6c.75.38 1.6.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.17-.6 2.05-.6s1.4.27 2.05.6c.75.38 1.6.8 2.95.8v-1.95c-.87 0-1.4-.27-2.05-.6-.75-.38-1.6-.8-2.95-.8zm0-4.45c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.87 0-1.4-.28-2.05-.6C9.2 13 8.35 12.54 7 12.54s-2.2.43-2.95.8c-.65.32-1.17.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.28 2.05.6c.75.37 1.6.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.28 2.05.6c.75.37 1.6.8 2.95.8v-1.95c-.87 0-1.4-.28-2.05-.6-.75-.37-1.6-.8-2.95-.8z"/></svg>`,
  subterranea: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.24 2 7 4.24 7 7c0 2.85 2.92 7.21 5 9.72C14.08 14.21 17 9.85 17 7c0-2.76-2.24-5-5-5zm0 7.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 4.5 12 4.5s2.5 1.12 2.5 2.5S13.38 9.5 12 9.5z"/><path d="M5 19h14v2H5z"/></svg>`,
  pluvial:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8zM6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14H6z"/></svg>`,
  efluente:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 12h3v8h6v-5h2v5h6v-8h3L12 3zm0 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
  barragem:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`,
};

function getTypeSvg(item) {
  const key = item._catLabel?.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (key?.includes('superficial')) return TYPE_SVG.superficial;
  if (key?.includes('subterr'))     return TYPE_SVG.subterranea;
  if (key?.includes('pluvial'))     return TYPE_SVG.pluvial;
  if (key?.includes('efluente'))    return TYPE_SVG.efluente;
  if (key?.includes('barragem'))    return TYPE_SVG.barragem;
  return TYPE_SVG.subterranea;
}

function makePinIcon(color, size = 'normal') {
  const [w, h, r] = size === 'small' ? [16, 24, 3.5] : [24, 36, 5];
  return L.divIcon({
    className: '',
    html: `<svg width="${w}" height="${h}" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z" fill="${color}" opacity="0.92"/>
      <circle cx="12" cy="12" r="${r}" fill="white"/>
    </svg>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -(h + 2)],
  });
}

function buildPopupHtml(item) {
  const color = item._catColor ?? TI_COLORS[item.ti_id] ?? '#1565c0';
  const lat   = parseFloat(item.int_latitude);
  const lng   = parseFloat(item.int_longitude);
  const icon  = getTypeSvg(item);
  return `
    <div style="font-family:Roboto,Arial,sans-serif;min-width:210px;max-width:280px;">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;
                  border-bottom:2px solid ${color};padding-bottom:5px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;
                     width:26px;height:26px;border-radius:6px;
                     background:${color}18;color:${color};flex-shrink:0;">
          ${icon}
        </span>
        <span style="font-weight:700;font-size:13px;color:#1a237e;line-height:1.3;">
          ${item.us_nome ?? '—'}
        </span>
      </div>
      <table style="width:100%;font-size:11px;border-collapse:collapse;line-height:1.7;">
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Processo</b></td><td style="color:#263238;">${item.int_processo ?? '—'}</td></tr>
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>CPF/CNPJ</b></td><td style="color:#263238;">${item.us_cpf_cnpj ?? '—'}</td></tr>
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Endereço</b></td><td style="color:#263238;">${item.emp_endereco ?? '—'}</td></tr>
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Bacia</b></td><td style="color:#263238;">${item.bh_nome ?? '—'}</td></tr>
        <tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Tipo</b></td><td style="color:${color};font-weight:600;">${item._catLabel ?? '—'}</td></tr>
        ${!isNaN(lat) && !isNaN(lng) ? `<tr><td style="color:#78909c;padding:1px 8px 1px 0;white-space:nowrap;"><b>Lat / Lng</b></td><td style="color:#263238;">${lat.toFixed(6)}, ${lng.toFixed(6)}</td></tr>` : ''}
      </table>
    </div>`;
}

export default function LeafletMap({ circleData, onShapeCreated, markerData, onPickCoordinate, allMarkers, subShape }) {
  const containerRef       = useRef(null);
  const mapRef             = useRef(null);
  const circleLayerRef     = useRef(null);
  const markerLayerRef     = useRef(null);
  const allMarkersLayerRef = useRef(null);
  const subShapeLayerRef   = useRef(null);
  const onCreatedRef       = useRef(onShapeCreated);
  const onPickRef          = useRef(onPickCoordinate);
  const pickModeRef        = useRef(false);
  const pickBtnRef         = useRef(null);

  // Mantém referências das callbacks sempre atualizadas sem recriar o mapa
  onCreatedRef.current = onShapeCreated;
  onPickRef.current    = onPickCoordinate;

  // ── Inicializa o mapa uma única vez ──────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: BRASILIA,
      zoom: 11,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Camada que recebe as formas desenhadas
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Controle de desenho (círculo, polígono, retângulo)
    const drawCtrl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        circle:       { shapeOptions: SHAPE_OPTS },
        polygon:      { shapeOptions: SHAPE_OPTS, allowIntersection: false },
        rectangle:    { shapeOptions: SHAPE_OPTS },
        polyline:     false,
        marker:       false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawCtrl);

    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);

      const t = e.layerType;
      let shape = null;

      if (t === 'circle') {
        const ll = e.layer.getLatLng();
        shape = {
          type: 'circle',
          center: { lat: ll.lat, lng: ll.lng },
          radius: Math.round(e.layer.getRadius()),
        };
      } else if (t === 'rectangle') {
        const ne = e.layer.getBounds().getNorthEast();
        const sw = e.layer.getBounds().getSouthWest();
        // nex/swx = longitude (x), ney/swy = latitude (y)
        shape = { type: 'rectangle', nex: ne.lng, ney: ne.lat, swx: sw.lng, swy: sw.lat };
      } else if (t === 'polygon') {
        const pts = e.layer.getLatLngs()[0].map(ll => [ll.lng, ll.lat]);
        // array fechado de pares [lng, lat], igual ao formato esperado pelo serviço
        shape = { type: 'polygon', points: [...pts, pts[0]] };
      }

      if (shape) onCreatedRef.current(shape);
    });

    // ── Botão de seleção de ponto de pesquisa ────────────────────────────────
    const PickControl = L.Control.extend({
      onAdd() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const btn = L.DomUtil.create('a', '', container);
        btn.href  = '#';
        btn.title = 'Selecionar ponto de pesquisa no mapa';
        btn.style.cssText = 'width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;transition:background 0.15s,color 0.15s;';
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.8" fill="white"/>
        </svg>`;

        pickBtnRef.current = btn;

        L.DomEvent.on(btn, 'click', L.DomEvent.stop);
        L.DomEvent.on(btn, 'click', () => {
          pickModeRef.current = !pickModeRef.current;
          const active = pickModeRef.current;
          map.getContainer().style.cursor = active ? 'crosshair' : '';
          btn.style.background = active ? '#e3f2fd' : '';
          btn.style.color      = active ? '#1565c0' : '#555';
          btn.title = active ? 'Clique no mapa para selecionar o ponto (ESC para cancelar)' : 'Selecionar ponto de pesquisa no mapa';
        });

        return container;
      },
    });
    new PickControl({ position: 'topleft' }).addTo(map);

    // Cancela pick mode com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pickModeRef.current) {
        pickModeRef.current = false;
        map.getContainer().style.cursor = '';
        if (pickBtnRef.current) {
          pickBtnRef.current.style.background = '';
          pickBtnRef.current.style.color = '#555';
        }
      }
    });

    // Captura clique no mapa quando em pick mode
    map.on('click', (e) => {
      if (!pickModeRef.current) return;
      pickModeRef.current = false;
      map.getContainer().style.cursor = '';
      if (pickBtnRef.current) {
        pickBtnRef.current.style.background = '';
        pickBtnRef.current.style.color = '#555';
      }
      if (onPickRef.current) {
        onPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // executa só uma vez

  // ── Atualiza círculo no mapa quando circleData muda ───────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove círculo anterior
    if (circleLayerRef.current) {
      map.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    if (!circleData) return;

    const circle = L.circle(
      [circleData.center.lat, circleData.center.lng],
      { ...SHAPE_OPTS, radius: circleData.radius },
    );
    circle.addTo(map);
    circleLayerRef.current = circle;

    map.flyTo(
      [circleData.center.lat, circleData.center.lng],
      13,
      { animate: true, duration: 1.2 },
    );
  }, [circleData]);

  // ── Marcador de outorga selecionada ───────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current);
      markerLayerRef.current = null;
    }

    if (!markerData) return;

    const lat = parseFloat(markerData.int_latitude);
    const lng = parseFloat(markerData.int_longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const color = markerData._catColor ?? TI_COLORS[markerData.ti_id] ?? '#1565c0';

    const marker = L.marker([lat, lng], { icon: makePinIcon(color) })
      .bindPopup(buildPopupHtml(markerData), { maxWidth: 300 })
      .addTo(map);

    marker.openPopup();
    markerLayerRef.current = marker;

    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { animate: true, duration: 1.0 });
  }, [markerData]);

  // ── Todas as outorgas da pesquisa como circle markers ─────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (allMarkersLayerRef.current) {
      map.removeLayer(allMarkersLayerRef.current);
      allMarkersLayerRef.current = null;
    }

    if (!allMarkers || allMarkers.length === 0) return;

    const group = L.layerGroup();

    allMarkers.forEach(item => {
      const lat = parseFloat(item.int_latitude);
      const lng = parseFloat(item.int_longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = item._catColor ?? TI_COLORS[item.ti_id] ?? '#1565c0';

      L.marker([lat, lng], { icon: makePinIcon(color, 'small') })
        .bindPopup(buildPopupHtml(item), { maxWidth: 300 })
        .addTo(group);
    });

    group.addTo(map);
    allMarkersLayerRef.current = group;
  }, [allMarkers]);

  // ── Polígono do subsistema hidrogeológico (aba Subterrânea) ──────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (subShapeLayerRef.current) {
      map.removeLayer(subShapeLayerRef.current);
      subShapeLayerRef.current = null;
    }

    if (!subShape) return;

    // _hg_shape pode ser um GeoJSON Feature, FeatureCollection ou geometria bruta
    const geoJson = (subShape.type === 'Feature' || subShape.type === 'FeatureCollection')
      ? subShape
      : { type: 'Feature', geometry: subShape };

    const layer = L.geoJSON(geoJson, {
      style: {
        color:       '#6a1b9a',
        weight:      2,
        opacity:     0.85,
        fillColor:   '#ce93d8',
        fillOpacity: 0.12,
        dashArray:   '6 4',
      },
    });

    layer.addTo(map);
    subShapeLayerRef.current = layer;

    // centraliza no polígono se não houver busca de círculo ativa
    try {
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.flyToBounds(bounds, { padding: [24, 24], maxZoom: 13, duration: 1.0 });
    } catch (_) {}
  }, [subShape]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
