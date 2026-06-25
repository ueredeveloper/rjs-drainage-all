import React, { useEffect, useRef, useState } from 'react';

const VB = 140;
const R  = 100;

function pt(r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: +(r * Math.cos(rad)).toFixed(3), y: +(r * Math.sin(rad)).toFixed(3) };
}

/* ─── Anel externo de pontos — rotação lenta ─────────────────────────────── */
function DotRing() {
  const N = 80;
  return (
    <g>
      {Array.from({ length: N }, (_, i) => {
        const { x, y } = pt(R + 14, (i / N) * 360);
        const accent = i % 5 === 0;
        return (
          <circle key={i} cx={x} cy={y}
            r={accent ? 1.4 : 0.78}
            fill="#29B6F6"
            opacity={accent ? 0.88 : 0.36}
          />
        );
      })}
      <animateTransform attributeName="transform" attributeType="XML"
        type="rotate" from="0 0 0" to="360 0 0" dur="220s" repeatCount="indefinite" />
    </g>
  );
}

/* ─── Marcações radiais internas ─────────────────────────────────────────── */
function TickMarks() {
  const N = 60;
  return (
    <g>
      {Array.from({ length: N }, (_, i) => {
        const deg    = (i / N) * 360;
        const vMajor = i % 15 === 0;
        const major  = i % 5 === 0;
        const inner  = pt(vMajor ? 84 : major ? 89 : 93, deg);
        const outer  = pt(R - 1.5, deg);
        return (
          <line key={i}
            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke="#29B6F6"
            strokeWidth={vMajor ? 0.9 : major ? 0.5 : 0.28}
            opacity={vMajor ? 0.58 : major ? 0.3 : 0.14}
          />
        );
      })}
    </g>
  );
}

/* ─── Marcadores na borda do círculo ─────────────────────────────────────── */
function RingMarkers() {
  const N = 20;
  return (
    <g filter="url(#saddf-glow)">
      {Array.from({ length: N }, (_, i) => {
        const { x, y } = pt(R, (i / N) * 360);
        const cardinal = i % 5 === 0;
        const semi     = i % 2 === 0;
        return (
          <g key={i}>
            {cardinal && (
              <circle cx={x} cy={y} r={3.6}
                fill="none" stroke="#29B6F6" strokeWidth="0.7" opacity="0.68" />
            )}
            <circle cx={x} cy={y}
              r={cardinal ? 1.7 : semi ? 1.0 : 0.6}
              fill="#29B6F6"
              opacity={cardinal ? 0.92 : semi ? 0.58 : 0.38}
            />
          </g>
        );
      })}
    </g>
  );
}

/* ─── Linhas radiais tracejadas ──────────────────────────────────────────── */
function RadialExtensions() {
  const angles = [22, 67, 112, 157, 202, 247, 292, 337];
  return (
    <g opacity="0.28">
      {angles.map((deg, i) => {
        const inner = pt(R + 1, deg);
        const outer = pt(R + 24, deg);
        return (
          <line key={i}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="#29B6F6" strokeWidth="0.45"
            strokeDasharray="2.5 4"
          />
        );
      })}
    </g>
  );
}

/* ─── Medallhão central ──────────────────────────────────────────────────── */
function CenterMedallion() {
  return (
    <g>
      <circle cx="0" cy="0" r="32"
        fill="none" stroke="#1976D2"
        strokeWidth="0.45" strokeDasharray="8.5 24.5"
        opacity="0.32"
      />
      {[[-28, -22], [28, -22], [-28, 22], [28, 22]].map(([cx, cy], i) => {
        const hLen = 5, vLen = 4;
        const hx = cx < 0 ? cx + hLen : cx - hLen;
        const vy = cy < 0 ? cy + vLen : cy - vLen;
        return (
          <g key={i} stroke="#29B6F6" strokeWidth="0.5" opacity="0.4">
            <line x1={cx} y1={cy} x2={hx} y2={cy} />
            <line x1={cx} y1={cy} x2={cx} y2={vy} />
          </g>
        );
      })}
    </g>
  );
}

/* ─── Texto em arco inferior — acompanha a rotação ──────────────────────── */
function ArcText() {
  /*
   * Arco de raio 122, da esquerda (-122, 0) à direita (122, 0) passando
   * pelo ponto inferior (0, 122) com sweep=0 (SVG counter-clockwise).
   * Isso coloca o texto na metade inferior do círculo, legível de fora.
   */
  const r = 122;
  return (
    <g>
      <text
        textAnchor="middle"
        fontFamily="'Roboto Condensed', 'Roboto', 'Arial', sans-serif"
        fontWeight="400"
        fontSize="8"
        letterSpacing="1.5"
        fill="#82CFEA"
        opacity="0.7"
        filter="url(#saddf-tag-glow)"
      >
        <textPath
          href="#saddf-bottom-arc"
          startOffset="50%"
        >
          SAD/DF  ·  Sistema de Apoio à Decisão
        </textPath>
      </text>
      <animateTransform attributeName="transform" attributeType="XML"
        type="rotate" from="0 0 0" to="360 0 0" dur="220s" repeatCount="indefinite" />
    </g>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
/**
 * HUD geoespacial do SAD/DF — sobreposto ao mapa como elemento de identidade visual.
 * @param {{ phase: 'intro' | 'ambient' }} props
 *   - intro   : visibilidade plena (primeiros 10 s)
 *   - ambient : visibilidade reduzida, permanece como marca d'água discreta
 */
export default function SadDfHud({ phase = 'intro' }) {
  const containerRef          = useRef(null);
  const [size, setSize]       = useState(0);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(Math.round(Math.min(width, height) * 0.85));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'ambient') setOpacity(0.25);
  }, [phase]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 2,
        transition: 'opacity 2s ease-in-out',
        opacity,
      }}
    >
      {size > 0 && (
        <svg
          width={size}
          height={size}
          viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
          style={{ overflow: 'visible', display: 'block' }}
        >
          <defs>
            {/*
             * Arco inferior para o texto orbital:
             * de (-122, 0) a (122, 0) passando por (0, 122) — sweep=0 → bottom
             */}
            <path id="saddf-bottom-arc" d="M -122,0 A 122,122 0 0,0 122,0" />

            <radialGradient id="saddf-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#0D47A1" stopOpacity="0" />
              <stop offset="60%"  stopColor="#0D47A1" stopOpacity="0" />
              <stop offset="85%"  stopColor="#1565C0" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#29B6F6" stopOpacity="0.22" />
            </radialGradient>
            <filter id="saddf-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="saddf-ring-glow" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="saddf-text-glow" x="-50%" y="-90%" width="200%" height="280%">
              <feDropShadow dx="0" dy="0" stdDeviation="5"
                floodColor="#0D47A1" floodOpacity="0.9" />
            </filter>
            <filter id="saddf-tag-glow" x="-50%" y="-120%" width="200%" height="340%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5"
                floodColor="#0D47A1" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Halo azul translúcido */}
          <circle cx="0" cy="0" r={R} fill="url(#saddf-halo)" />

          {/* Marcações radiais internas */}
          <TickMarks />

          {/* Borda principal com glow */}
          <circle cx="0" cy="0" r={R}
            fill="none" stroke="#29B6F6"
            strokeWidth="0.95" opacity="0.84"
            filter="url(#saddf-ring-glow)"
          />

          {/* Segunda borda interna pontilhada */}
          <circle cx="0" cy="0" r={R - 7}
            fill="none" stroke="#1565C0"
            strokeWidth="0.38" strokeDasharray="5 9"
            opacity="0.32"
          />

          {/* Marcadores circulares na circunferência */}
          <RingMarkers />

          {/* Anel externo de pontos luminosos */}
          <DotRing />

          {/* Linhas radiais tracejadas */}
          <RadialExtensions />

          {/* Texto orbital inferior — acompanha a rotação */}
          <ArcText />

          {/* Medallhão central */}
          <CenterMedallion />

          {/* Ponto central */}
          <circle cx="0" cy="0" r="1.8"
            fill="#29B6F6" opacity="0.6"
            filter="url(#saddf-glow)"
          />

        </svg>
      )}
    </div>
  );
}
