export function classifyWing(props) {
  if (props.tp === 'TP1') return 'eixo';
  const tokens = (props.setores || '').toUpperCase().split(/[;\s]+/).filter(Boolean);
  const hasN = tokens.some(t => /N$/.test(t)), hasS = tokens.some(t => /S$/.test(t));
  if (hasN && !hasS) return 'norte'; if (hasS && !hasN) return 'sul'; return 'outros';
}


export function splitWingN(features, wing, n) {
  const w = features.map(f => ({ f, lat: f.geometry?.coordinates?.[0]?.[0]?.[1] ?? 0 }));
  w.sort((a, b) => wing === 'norte' ? a.lat - b.lat : b.lat - a.lat);
  const size = Math.ceil(w.length / n);
  return Array.from({ length: n }, (_, i) => w.slice(i * size, (i + 1) * size).map(x => x.f));
}

export function splitByLng(features) {
  if (!features.length) return [[], []];
  const w = features.map(f => ({ f, lng: f.geometry?.coordinates?.[0]?.[0]?.[0] ?? 0 }));
  w.sort((a, b) => a.lng - b.lng); const mid = Math.ceil(w.length / 2);
  return [w.slice(0, mid).map(x => x.f), w.slice(mid).map(x => x.f)];
}

export function splitByLat(features, wing) {
  if (!features.length) return [[], []];
  const w = features.map(f => ({ f, lat: f.geometry?.coordinates?.[0]?.[0]?.[1] ?? 0 }));
  w.sort((a, b) => wing === 'norte' ? a.lat - b.lat : b.lat - a.lat); const mid = Math.ceil(w.length / 2);
  return [w.slice(0, mid).map(x => x.f), w.slice(mid).map(x => x.f)];
}

export function splitWingByLng(features, n) {
  const w = features.map(f => ({ f, lng: f.geometry?.coordinates?.[0]?.[0]?.[0] ?? 0 }));
  w.sort((a, b) => a.lng - b.lng);
  const size = Math.ceil(w.length / n);
  return Array.from({ length: n }, (_, i) => w.slice(i * size, (i + 1) * size).map(x => x.f));
}

export function toPoints(features) {
  const rings = [];
  features.forEach(f => {
    const geom = f.geometry; if (!geom) return;
    const raws = geom.type === 'Polygon' ? geom.coordinates : geom.type === 'MultiPolygon' ? geom.coordinates.flat(1) : [];
    raws.forEach(ring => { if (ring.length > 1) rings.push(ring.map(([lng, lat]) => ({ lat, lng }))); });
  });
  if (!rings.length) return [];
  const used = new Uint8Array(rings.length); const ordered = [rings[0]]; used[0] = 1;
  let tail = rings[0][rings[0].length - 1];
  for (let i = 1; i < rings.length; i++) {
    let bestIdx = -1, bestDist = Infinity, bestRev = false;
    for (let j = 0; j < rings.length; j++) {
      if (used[j]) continue; const r = rings[j];
      const dl = tail.lat-r[0].lat, dn = tail.lng-r[0].lng, ds = dl*dl+dn*dn;
      const dl2 = tail.lat-r[r.length-1].lat, dn2 = tail.lng-r[r.length-1].lng, de = dl2*dl2+dn2*dn2;
      if (ds < bestDist) { bestDist = ds; bestIdx = j; bestRev = false; }
      if (de < bestDist) { bestDist = de; bestIdx = j; bestRev = true; }
    }
    if (bestIdx === -1) break; used[bestIdx] = 1;
    const ring = bestRev ? rings[bestIdx].slice().reverse() : rings[bestIdx];
    ordered.push(ring); tail = ring[ring.length - 1];
  }
  return ordered.flat();
}

