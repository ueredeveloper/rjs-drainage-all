/** Lista retornada em informacoes_adicionais.barragens_encontradas. */
function normalizeBarragensEncontradas(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.filter(item => item && typeof item === 'object');
  if (typeof raw === 'object') return [raw];
  return [];
}

/** Normaliza valor da API em lista de outorgas de barragem. */
function normalizeBarragemList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'object' && (raw.us_nome || raw.int_processo || isBarragemGrant(raw))) {
    return [raw];
  }
  return [];
}

function isBarragemGrant(item) {
  if (!item || typeof item !== 'object') return false;
  return (
    String(item.ti_id) === '5' ||
    item.rio_barragem != null ||
    item.id_dominio_barragem != null ||
    item.comprimento_crista_m != null
  );
}

function parseCoord(val) {
  if (val == null || val === '') return undefined;
  const n = parseFloat(String(val).replace(',', '.').trim());
  return Number.isFinite(n) ? n : undefined;
}

/** Resolve lat/lng a partir dos formatos usados pela API de barragem. */
function resolveBarragemCoords(item) {
  if (!item || typeof item !== 'object') return {};

  let lat = parseCoord(item.int_latitude)
    ?? parseCoord(item.latitude)
    ?? parseCoord(item.lat);
  let lng = parseCoord(item.int_longitude)
    ?? parseCoord(item.longitude)
    ?? parseCoord(item.lng);

  const nested = item.coordenadas ?? item.coordenada ?? item.coords ?? item.posicao;
  if (nested && typeof nested === 'object') {
    lat = lat ?? parseCoord(nested.int_latitude ?? nested.latitude ?? nested.lat);
    lng = lng ?? parseCoord(nested.int_longitude ?? nested.longitude ?? nested.lng);
  }

  if (Array.isArray(item.coordinates) && item.coordinates.length >= 2) {
    lng = lng ?? parseCoord(item.coordinates[0]);
    lat = lat ?? parseCoord(item.coordinates[1]);
  }

  const geom = item.geometry ?? item.geom ?? item.int_shape;
  if (geom?.type === 'Point' && Array.isArray(geom.coordinates) && geom.coordinates.length >= 2) {
    lng = lng ?? parseCoord(geom.coordinates[0]);
    lat = lat ?? parseCoord(geom.coordinates[1]);
  }

  return {
    ...(lat != null ? { int_latitude: lat } : {}),
    ...(lng != null ? { int_longitude: lng } : {}),
  };
}

/** Garante campos usados pela tabela e pelo mapa. */
function mapBarragemRow(item) {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    us_nome: item.us_nome ?? item.nome ?? item.usuario_nome ?? item.razao_social,
    us_cpf_cnpj: item.us_cpf_cnpj ?? item.cpf_cnpj ?? item.cnpj,
    int_processo: item.int_processo ?? item.processo ?? item.num_processo,
    emp_endereco: item.emp_endereco ?? item.endereco ?? item.endereco_empresa,
    ...resolveBarragemCoords(item),
  };
}

function fromCategorizedObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
  const list = normalizeBarragemList(
    obj.barragens_encontradas ??
    obj.barragem ??
    obj.barragens ??
    obj.lancamento_barragens
  );
  if (list.length) return list;

  const values = Object.values(obj);
  if (values.some(Array.isArray)) {
    const flat = values.flatMap(v => (Array.isArray(v) ? v : []));
    const barr = flat.filter(isBarragemGrant);
    if (barr.length) return barr;
  }
  return [];
}

function collectBarragemFromArrays(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.values(obj).flatMap(val =>
    Array.isArray(val) ? val.filter(isBarragemGrant) : []
  );
}

function findByBarragemKey(node, depth = 0) {
  if (node == null || depth > 10) return [];
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findByBarragemKey(item, depth + 1);
      if (found.length) return found;
    }
    return [];
  }
  if (typeof node === 'object') {
    for (const [key, val] of Object.entries(node)) {
      if (/barragem/i.test(key)) {
        const list = key === 'barragens_encontradas'
          ? normalizeBarragensEncontradas(val)
          : normalizeBarragemList(val);
        if (list.length) return list;
      }
    }
    for (const val of Object.values(node)) {
      const found = findByBarragemKey(val, depth + 1);
      if (found.length) return found;
    }
  }
  return [];
}

/**
 * Extrai outorgas de barragem do retorno de calculateReservoirBalance.
 * @param {object|null|undefined} calcResult
 * @returns {object[]|null} null = ainda sem cálculo; [] = sem barragens
 */
export function extractBarragemRows(calcResult) {
  if (!calcResult) return null;

  const db = calcResult.dbResult;
  const info = db?.informacoes_adicionais ?? calcResult.informacoes_adicionais;

  const barragensEncontradas = info?.barragens_encontradas;
  if (barragensEncontradas != null) {
    const list = normalizeBarragensEncontradas(barragensEncontradas);
    if (list.length) return list.map(mapBarragemRow);
  }

  const candidates = [
    db?.barragem,
    db?.barragens,
    calcResult.barragem,
    calcResult.barragens,
    db?.outorgas,
    db?.pontos,
    db?.marcadores,
    db?.markers,
    db?.markers?.barragem,
    info?.barragem,
    info?.barragens,
    info?.outorgas,
    Array.isArray(db) ? db[0]?.barragem : null,
    Array.isArray(db) ? db[0] : null,
    calcResult.resultadoCalculo?.barragem,
  ];

  for (const raw of candidates) {
    if (raw == null) continue;

    const categorized = fromCategorizedObject(raw);
    if (categorized.length) return categorized.map(mapBarragemRow);

    const direct = normalizeBarragemList(raw);
    if (direct.length) return direct.map(mapBarragemRow);

    if (Array.isArray(raw)) {
      const barr = raw.filter(isBarragemGrant);
      if (barr.length) return barr.map(mapBarragemRow);
    }
  }

  if (db) {
    const fromArrays = collectBarragemFromArrays(db);
    if (fromArrays.length) return fromArrays.map(mapBarragemRow);
  }

  const deep = findByBarragemKey(calcResult);
  if (deep.length) return deep.map(mapBarragemRow);

  return [];
}
