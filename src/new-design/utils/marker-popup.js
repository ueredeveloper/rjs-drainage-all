import { TI_CATS } from '../constants';

const TYPE_LABELS = {
  superficial: { abbr: 'Sup', title: 'Superficial' },
  subterranea: { abbr: 'Sub', title: 'Subterrâneo' },
  efluente:    { abbr: 'Efl', title: 'Lançamento de efluentes' },
  barragem:    { abbr: 'Bar', title: 'Barragem' },
  pluvial:     { abbr: 'Plu', title: 'Lançamento de águas pluviais' },
};

/** Tipos de outorga que podem ser atribuídos a um marcador, com a cor da categoria. */
export const MARKER_TYPES = ['superficial', 'subterranea', 'efluente', 'barragem', 'pluvial']
  .map(key => ({ key, ...TYPE_LABELS[key], color: TI_CATS.find(c => c.key === key).color }));

/**
 * Cor do marcador conforme o tipo de outorga informado.
 * @param {string|null} catKey - Chave da categoria (ex: 'superficial')
 * @param {string} fallback - Cor usada quando o tipo não foi informado
 * @returns {string}
 */
export function markerColor(catKey, fallback) {
  return MARKER_TYPES.find(t => t.key === catKey)?.color ?? fallback;
}

/** className a usar no L.popup dos marcadores (Leaflet) para remover margens/paddings nativos. */
export const MARKER_POPUP_LEAFLET_CLASS = 'nd-marker-popup-wrap';

const ICONS = {
  drop:   '<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>',
  place:  '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
  layers: '<path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16zm0-11.47L17.74 9 12 13.47 6.26 9 12 4.53z"/>',
  user:   '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
  move:   '<path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>',
  expand: '<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>',
  pin:    '<path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>',
  edit:   '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
  check:  '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
  close:  '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
};
const icon = (name, size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">${ICONS[name]}</svg>`;

// Estilos do popup do marcador. Também deixa transparentes e sem padding os containers do
// GMaps (InfoWindow) e do Leaflet (L.popup com MARKER_POPUP_LEAFLET_CLASS): fundo, sombra e
// cantos ficam no próprio cartão (.ndmp), que pode ser arrastado para fora da posição original.
if (typeof document !== 'undefined' && !document.getElementById('nd-marker-popup-style')) {
  const style = document.createElement('style');
  style.id = 'nd-marker-popup-style';
  style.textContent = `
    .gm-style-iw-c:has(.ndmp) { padding: 0 !important; border-radius: 0 !important; max-width: none !important; min-width: 0 !important;
      max-height: none !important; background: transparent !important; box-shadow: none !important; overflow: visible !important; }
    .gm-style-iw-d:has(.ndmp) { overflow: visible !important; padding: 0 !important; max-height: none !important; }
    .leaflet-popup.${MARKER_POPUP_LEAFLET_CLASS} .leaflet-popup-content-wrapper { padding: 0; border-radius: 0; overflow: visible; background: transparent; box-shadow: none; }
    .leaflet-popup.${MARKER_POPUP_LEAFLET_CLASS} .leaflet-popup-content { margin: 0; width: auto !important; min-width: 0; line-height: normal; }

    /* Wrapper fixo na posição original; o cartão (.ndmp) é deslocado com 'translate' e a
       linha (.ndmp-link) liga a ponta da seta do popup (base do wrapper) ao cartão */
    .ndmp-wrap { position: relative; z-index: 0; }
    .ndmp-link { position: absolute; left: 50%; top: 100%; width: 1px; height: 1px; overflow: visible; pointer-events: none; z-index: -1; }

    /* Paleta do novo design: marca #003566 (nd-header), destaque #1565c0, texto #263238,
       rótulos #78909c, bordas #e8eaf0/#cfd8dc, raio 8px (mesmos tons do popup das outorgas) */
    .ndmp { font-family: Roboto, Arial, sans-serif; width: 260px; color: #263238; background: #fff;
      border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,.3); }
    .ndmp * { box-sizing: border-box; }
    .ndmp button { font-family: inherit; }
    .ndmp-head { position: relative; display: flex; align-items: center; gap: 8px; padding: 9px 32px 9px 12px;
      background: var(--ndmp-head, #003566); color: #fff; transition: background-color .2s; }
    .ndmp-head-icon { display: flex; flex-shrink: 0; }
    .ndmp-sep { width: 1px; align-self: stretch; background: rgba(255,255,255,.35); flex-shrink: 0; }
    .ndmp-title { flex: 1; min-width: 0; font-size: 15px; font-weight: 700; color: #fff; background: transparent;
      border: 1px solid transparent; border-radius: 6px; padding: 2px 6px; margin: 0; outline: none; font-family: inherit; }
    .ndmp-title::placeholder { color: rgba(255,255,255,.6); }
    .ndmp-title:hover { border-color: rgba(255,255,255,.3); }
    .ndmp-title:focus { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.55); }
    .ndmp-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .ndmp-btn { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; padding: 0; margin: 0;
      border: none; border-radius: 4px; cursor: pointer; color: #fff; background: rgba(255,255,255,.18); transition: background-color .15s, transform .15s; }
    .ndmp-btn:hover { background: #004080; }
    .ndmp-btn.ndmp-on { background: #fff; color: var(--ndmp-head, #003566); }
    /* Cabeçalho na cor do tipo de outorga: hover escurece a própria cor em vez do #004080 */
    .ndmp-typed .ndmp-btn:hover, .ndmp-typed .ndmp-close:hover { background: rgba(0,0,0,.22); }
    .ndmp-btn.ndmp-pin-off svg { transform: rotate(45deg); }
    .ndmp-btn.ndmp-drag { cursor: grab; touch-action: none; }
    .ndmp-btn.ndmp-drag:active { cursor: grabbing; }
    .ndmp-close { position: absolute; top: 6px; right: 6px; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;
      padding: 0; margin: 0; border: none; border-radius: 50%; cursor: pointer; color: rgba(255,255,255,.85); background: transparent; }
    .ndmp-close:hover { background: #004080; color: #fff; }

    .ndmp-body { padding: 10px 12px 12px; background: #fff; }
    .ndmp-sec { display: flex; gap: 10px; align-items: flex-start; }
    .ndmp-sec-icon { display: flex; color: #1565c0; margin-top: 1px; flex-shrink: 0; }
    .ndmp-sec-main { flex: 1; min-width: 0; }
    .ndmp-label { font-size: 10px; font-weight: 600; color: #78909c; text-transform: uppercase; letter-spacing: .7px; margin-bottom: 3px; }
    .ndmp-divider { height: 1px; background: #e8eaf0; margin: 10px 0; }
    .ndmp-coords { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: #1a237e; }
    .ndmp-coord { cursor: pointer; border-radius: 4px; padding: 1px 4px; margin-left: -4px; transition: background-color .15s, color .15s; }
    .ndmp-coord:hover { background: #e3f2fd; }
    .ndmp-coord + .ndmp-comma + .ndmp-coord { margin-left: 0; }
    .ndmp-coord-btn { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; margin: 0 0 0 auto; padding: 0;
      border: none; border-radius: 4px; cursor: pointer; color: #78909c; background: transparent; flex-shrink: 0; }
    .ndmp-coord-btn:hover { background: #e3f2fd; color: #1565c0; }
    .ndmp-coord-done { color: #fff; background: #1565c0; margin-left: 2px; }
    .ndmp-coord-done:hover { background: #0d47a1; color: #fff; }
    .ndmp-coord-input { flex: 1; min-width: 0; width: 0; font-size: 12px; font-weight: 600; color: #1a237e; font-family: inherit;
      padding: 3px 5px; margin: 0; border: 1px solid #cfd8dc; border-radius: 4px; outline: none; background: #fff; }
    .ndmp-coord-input:focus { border-color: #1565c0; box-shadow: 0 0 0 2px #e3f2fd; }
    .ndmp-coord-input.ndmp-invalid { border-color: #c62828; box-shadow: 0 0 0 2px #fce8e8; }
    .ndmp-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
    .ndmp-chip { display: flex; align-items: center; gap: 3px; padding: 1px 6px; font-size: 9.5px; line-height: 14px; font-weight: 600; letter-spacing: 0;
      border-radius: 999px; cursor: pointer; color: #455a64; transition: background-color .15s, border-color .15s, box-shadow .15s; }
    .ndmp-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .ndmp-extra { font-size: 12px; }

    /* Popup fixado e recolhido: só o cabeçalho, compacto */
    .ndmp.ndmp-compact { width: auto; max-width: 240px; }
    .ndmp-compact .ndmp-head { gap: 6px; padding: 5px 26px 5px 8px; }
    .ndmp-compact .ndmp-head-icon svg { width: 15px; height: 15px; }
    /* input do nome com a largura exata do texto (field-sizing; fallback pelo atributo size) */
    .ndmp-compact .ndmp-title { flex: 0 0 auto; width: auto; min-width: 0; field-sizing: content; font-size: 13px; padding: 0 2px; border-radius: 3px; }
    .ndmp-compact .ndmp-actions { gap: 4px; }
    .ndmp-compact .ndmp-btn { width: 20px; height: 20px; border-radius: 4px; }
    .ndmp-compact .ndmp-btn svg { width: 13px; height: 13px; }
    .ndmp-compact .ndmp-close { top: 50%; right: 4px; transform: translateY(-50%); width: 18px; height: 18px; }
    .ndmp-compact .ndmp-body { display: none; }
  `;
  document.head.appendChild(style);
}

/**
 * Copia um texto para a área de transferência. Usa a Clipboard API e, se não
 * estiver disponível (ex: http fora de localhost), recorre a execCommand('copy').
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} true se copiou
 */
function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
  ta.remove();
  return ok;
}

/** Cria um elemento a partir de tag, className e innerHTML opcionais. */
function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

/** Botão do popup que não propaga o clique para o mapa. */
function button(className, html, title, onClick) {
  const btn = el('button', className, html);
  btn.type = 'button';
  btn.title = title;
  btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); onClick(); });
  return btn;
}

/**
 * Monta o conteúdo do popup de um marcador: cabeçalho com nome editável e botões
 * (expandir, fixar, fechar), coordenadas clicáveis (copiam o valor) e tipo de outorga.
 * Popup fixado não fecha ao clicar no mapa ou em outro marcador e começa recolhido
 * (só o cabeçalho). Usado tanto pelo GoogleMapView quanto pelo LeafletMap.
 *
 * @param {Object} opts
 * @param {string} opts.name - Nome atual do marcador (ex: "Marcador 1")
 * @param {{lat: number, lng: number}} opts.position - Coordenada do marcador
 * @param {(name: string) => void} opts.onRename - Chamado a cada alteração do nome
 * @param {string|null} [opts.catKey] - Tipo de outorga atual do marcador
 * @param {(catKey: string|null) => void} [opts.onTypeChange] - Chamado ao escolher/limpar o tipo
 * @param {boolean} [opts.pinned] - Se o popup está fixado
 * @param {() => void} [opts.onTogglePin] - Chamado ao clicar no botão de fixar/desafixar
 * @param {() => void} [opts.onClose] - Chamado ao clicar no "X" do cabeçalho
 * @param {(pos: {lat: number, lng: number}) => void} [opts.onMove] - Chamado a cada coordenada válida digitada (move o marcador); sem ele, a coordenada não é editável
 * @param {() => void} [opts.onLayoutChange] - Chamado quando o popup fixado expande/recolhe (para o mapa reajustar o tamanho)
 * @param {{x: number, y: number}} [opts.offset] - Deslocamento inicial (px) do cartão em relação à posição original
 * @param {(offset: {x: number, y: number}) => void} [opts.onOffsetChange] - Chamado ao terminar de arrastar o popup
 * @param {string} [opts.extraHtml] - HTML adicional exibido abaixo (ex: dados do usuário)
 * @returns {HTMLDivElement}
 */
export function buildMarkerPopupEl({ name, position, onRename, catKey = null, onTypeChange, pinned = false, onTogglePin, onClose, onMove, onLayoutChange, offset: initialOffset, onOffsetChange, extraHtml }) {
  const wrap = el('div', 'ndmp-wrap');
  const root = el('div', 'ndmp');

  // ── Cabeçalho: ícone, nome editável e ações ──────────────────────────────
  const head = el('div', 'ndmp-head');
  const title = el('input', 'ndmp-title');
  title.type = 'text';
  title.value = name ?? '';
  title.placeholder = 'Nome do marcador';
  title.title = 'Clique para editar o nome do marcador';
  // Fallback para navegadores sem field-sizing: largura aproximada pelo nº de caracteres
  const syncTitleSize = () => { title.size = Math.max(title.value.length, 1); };
  syncTitleSize();
  title.addEventListener('input', () => { syncTitleSize(); onRename?.(title.value); });
  // Popup fixado recolhido: ao terminar a edição, o mapa reajusta/recentraliza o popup à nova largura.
  // Só quando o nome mudou, e adiado para não engolir o clique em um botão do cabeçalho que causou o blur
  let nameOnFocus = title.value;
  title.addEventListener('focus', () => { nameOnFocus = title.value; });
  title.addEventListener('blur', () => {
    if (title.value === nameOnFocus) return;
    setTimeout(() => { if (root.classList.contains('ndmp-compact')) onLayoutChange?.(); }, 200);
  });
  // Evita que atalhos de teclado do mapa (zoom, pan, Esc) sejam disparados ao digitar
  ['keydown', 'keyup', 'keypress'].forEach(evt => title.addEventListener(evt, e => {
    e.stopPropagation();
    if (evt === 'keydown' && e.key === 'Enter') title.blur();
  }));
  title.addEventListener('click', e => e.stopPropagation());

  const actions = el('div', 'ndmp-actions');

  // ── Arrastar: desloca o cartão em relação ao marcador; a linha mantém a ligação ──
  let offset = { x: initialOffset?.x ?? 0, y: initialOffset?.y ?? 0 };
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const link = document.createElementNS(SVG_NS, 'svg');
  link.setAttribute('class', 'ndmp-link');
  // contorno branco + linha na cor do cabeçalho (cor do tipo de outorga)
  const lineBg = document.createElementNS(SVG_NS, 'line');
  lineBg.setAttribute('stroke', '#fff');
  lineBg.setAttribute('stroke-width', '5');
  lineBg.setAttribute('stroke-linecap', 'round');
  const lineFg = document.createElementNS(SVG_NS, 'line');
  lineFg.style.stroke = 'var(--ndmp-head, #003566)';
  lineFg.setAttribute('stroke-width', '2.5');
  lineFg.setAttribute('stroke-linecap', 'round');
  [lineBg, lineFg].forEach(l => { l.setAttribute('x1', '0'); l.setAttribute('y1', '0'); link.appendChild(l); });

  // A linha sai da ponta da seta (origem = base central da posição original) até o ponto
  // mais próximo da borda do cartão deslocado; some se o cartão estiver sobre a origem
  const applyOffset = () => {
    const moved = offset.x !== 0 || offset.y !== 0;
    root.style.translate = moved ? `${offset.x}px ${offset.y}px` : '';
    const w = root.offsetWidth, h = root.offsetHeight;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const x2 = clamp(0, offset.x - w / 2, offset.x + w / 2);
    const y2 = clamp(0, offset.y - h, offset.y);
    link.style.display = moved && (x2 !== 0 || y2 !== 0) ? '' : 'none';
    [lineBg, lineFg].forEach(l => { l.setAttribute('x2', String(x2)); l.setAttribute('y2', String(y2)); });
  };

  const dragBtn = button('ndmp-btn ndmp-drag', icon('move', 16), 'Arrastar o popup (duplo clique volta à posição original)', () => {});
  // Não deixa o mapa iniciar o próprio arrasto/clique a partir do botão
  ['mousedown', 'touchstart'].forEach(evt => dragBtn.addEventListener(evt, e => e.stopPropagation()));
  dragBtn.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    dragBtn.setPointerCapture?.(e.pointerId);
    const start = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    const onPointerMove = ev => {
      offset = { x: start.ox + ev.clientX - start.x, y: start.oy + ev.clientY - start.y };
      applyOffset();
    };
    const onPointerUp = () => {
      dragBtn.removeEventListener('pointermove', onPointerMove);
      dragBtn.removeEventListener('pointerup', onPointerUp);
      dragBtn.removeEventListener('pointercancel', onPointerUp);
      onOffsetChange?.(offset);
    };
    dragBtn.addEventListener('pointermove', onPointerMove);
    dragBtn.addEventListener('pointerup', onPointerUp);
    dragBtn.addEventListener('pointercancel', onPointerUp);
  });
  dragBtn.addEventListener('dblclick', e => {
    e.preventDefault(); e.stopPropagation();
    offset = { x: 0, y: 0 };
    applyOffset();
    onOffsetChange?.(offset);
  });
  if (pinned) {
    let expanded = false;
    const expandBtn = button('ndmp-btn', icon('expand', 18), '', () => {
      expanded = !expanded;
      paintExpand();
      onLayoutChange?.();
    });
    const paintExpand = () => {
      root.classList.toggle('ndmp-compact', !expanded);
      expandBtn.title = expanded ? 'Ocultar opções' : 'Mostrar todas as opções';
      expandBtn.querySelector('svg').style.transform = expanded ? '' : 'rotate(180deg)';
    };
    paintExpand();
    actions.appendChild(expandBtn);
  }
  actions.appendChild(dragBtn);
  actions.appendChild(button(
    `ndmp-btn ${pinned ? 'ndmp-on' : 'ndmp-pin-off'}`,
    icon('pin', 16),
    pinned ? 'Desafixar popup (fecha o popup)' : 'Fixar popup — continua visível ao clicar no mapa ou em outro marcador',
    () => onTogglePin?.(),
  ));

  head.append(
    el('span', 'ndmp-head-icon', icon('drop', 22)),
    el('span', 'ndmp-sep'),
    title,
    actions,
    button('ndmp-close', icon('close', 14), pinned ? 'Fechar (desafixa o popup)' : 'Fechar', () => (pinned ? onTogglePin?.() : onClose?.())),
  );

  // ── Corpo: coordenadas e tipo de outorga ──────────────────────────────────
  const body = el('div', 'ndmp-body');
  const section = (iconName, label, content) => {
    const sec = el('div', 'ndmp-sec');
    const main = el('div', 'ndmp-sec-main');
    main.append(el('div', 'ndmp-label', label), content);
    sec.append(el('span', 'ndmp-sec-icon', icon(iconName, 18)), main);
    return sec;
  };

  // Coordenadas: clicar na latitude ou na longitude copia o valor para a área de transferência;
  // o lápis troca por campos editáveis que movem o marcador enquanto o usuário digita
  const coords = el('div', 'ndmp-coords');
  let current = { lat: position.lat, lng: position.lng };
  const makeCoord = (value) => {
    const text = value.toFixed(6);
    const span = el('span', 'ndmp-coord');
    span.textContent = text;
    span.title = 'Clique para copiar';
    span.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      copyToClipboard(text).then(ok => {
        span.textContent = ok ? 'Copiado!' : 'Erro ao copiar';
        span.style.color = ok ? '#2e7d32' : '#c62828';
        setTimeout(() => { span.textContent = text; span.style.color = ''; }, 900);
      });
    });
    return span;
  };
  const parseCoord = (raw, max) => {
    const v = parseFloat(String(raw).trim().replace(',', '.'));
    return Number.isFinite(v) && Math.abs(v) <= max ? v : null;
  };
  const makeCoordInput = (value, label, max) => {
    const input = el('input', 'ndmp-coord-input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.value = value.toFixed(6);
    input.placeholder = label;
    input.title = `${label} (graus decimais, ex: ${label === 'Latitude' ? '-15.780100' : '-47.929200'})`;
    input._max = max;
    // Evita que atalhos de teclado do mapa sejam disparados ao digitar
    ['keydown', 'keyup', 'keypress'].forEach(evt => input.addEventListener(evt, e => {
      e.stopPropagation();
      if (evt === 'keydown' && (e.key === 'Enter' || e.key === 'Escape')) renderCoords(false);
    }));
    input.addEventListener('click', e => e.stopPropagation());
    return input;
  };
  const renderCoords = (editing) => {
    coords.innerHTML = '';
    if (!editing) {
      coords.append(makeCoord(current.lat), el('span', 'ndmp-comma', ','), makeCoord(current.lng));
      if (onMove) coords.appendChild(button('ndmp-coord-btn', icon('edit', 14), 'Editar coordenada', () => renderCoords(true)));
      return;
    }
    const latIn = makeCoordInput(current.lat, 'Latitude', 90);
    const lngIn = makeCoordInput(current.lng, 'Longitude', 180);
    // Move o marcador a cada digitação válida; valor inválido só marca o campo em vermelho
    const onType = () => {
      const lat = parseCoord(latIn.value, 90);
      const lng = parseCoord(lngIn.value, 180);
      latIn.classList.toggle('ndmp-invalid', lat === null);
      lngIn.classList.toggle('ndmp-invalid', lng === null);
      if (lat === null || lng === null) return;
      if (lat === current.lat && lng === current.lng) return;
      current = { lat, lng };
      onMove({ lat, lng });
    };
    latIn.addEventListener('input', onType);
    lngIn.addEventListener('input', onType);
    coords.append(latIn, lngIn, button('ndmp-coord-btn ndmp-coord-done', icon('check', 15), 'Concluir edição', () => renderCoords(false)));
    latIn.focus();
    latIn.select();
  };
  renderCoords(false);

  // Tipo de outorga: muda a cor do marcador para a cor da categoria; clicar no tipo selecionado limpa
  const chipList = el('div', 'ndmp-chips');
  let selected = catKey;
  const chips = MARKER_TYPES.map(t => {
    const chip = button('ndmp-chip', `<span class="ndmp-dot" style="background:${t.color}"></span>${t.abbr}`, t.title, () => {
      selected = selected === t.key ? null : t.key;
      paintChips();
      onTypeChange?.(selected);
    });
    chipList.appendChild(chip);
    return [chip, t];
  });
  const paintChips = () => {
    chips.forEach(([chip, t]) => {
      const on = selected === t.key;
      chip.style.background  = on ? `${t.color}2e` : `${t.color}12`;
      chip.style.border      = `1px solid ${on ? t.color : `${t.color}40`}`;
      chip.style.color       = on ? t.color : '#455a64';
      chip.style.boxShadow   = on ? `0 0 0 1px ${t.color}` : 'none';
    });
    // Fundo do cabeçalho na cor do tipo de outorga (sem tipo: #003566, cor da marca)
    wrap.style.setProperty('--ndmp-head', markerColor(selected, '#003566'));
    root.classList.toggle('ndmp-typed', !!selected);
  };
  paintChips();

  body.append(
    section('place', 'Coordenadas', coords),
    el('div', 'ndmp-divider'),
    section('layers', 'Tipo de outorga', chipList),
  );

  if (extraHtml) {
    body.append(el('div', 'ndmp-divider'), section('user', 'Usuário', el('div', 'ndmp-extra', extraHtml)));
  }

  root.append(head, body);
  wrap.append(root, link);
  applyOffset();
  // Reaplica a linha quando o cartão muda de tamanho (anexado ao mapa, expandir/recolher etc.)
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => applyOffset()).observe(root);
  return wrap;
}

