import { mkrBlueIcon, mkrBrownIcon, mkrGreenIcon, mkrOrangeIcon, mkrPinkIcon, mkrPurpleIcon, mkrRedIcon, mkrYellowIcon } from "../assets";
import { iwBarragemIcon, iwEfluenteIcon, iwManualIcon, iwPluvialIcon, iwSuperficialIcon, iwTubularIcon } from "../assets/svg/svgs-icons";

/**
 * Cria anéis para cada ângulo do círculo (0 a 360º) e constrói um polígono em formato circular para buscas de outorgas.
 * @param {object} center - Latitude e longitude do centro de um círculo.
 * @param {number} radius - Raio do círculo desenhado.
 * @return {array} - Retorna polígono em formato de círculo.
 */
function createCircleRings(center, radius) {
  let angle = { start: 0, end: 360 }
  let rings = [];
  let i = angle.start;
  // convert metros par km
  radius = radius * 0.0000092

  while (i < angle.end) {
    let path = [
      { lat: center.lat, lng: center.lng },
      { lat: center.lat + (Math.sin(i * Math.PI / 180)) * radius, lng: center.lng + (Math.cos(i * Math.PI / 180)) * radius }
    ];
    // retirar a coordenada do centro, só importa a segunda de cada linha criada
    rings.push(path[1]);
    i++;
  }
  return rings;
}
/**
 * Converte um shape do PostGIS para o formato do Google Maps.
 * @param {object} shape - Shape a ser convertido.
 * @returns {object[]} - Array de coordenadas no formato do Google Maps.
 */
function converterPostgresToGmaps(shape) {

  if (shape.shape.type === 'MultiPolygon') {
    let _paths = shape.shape.coordinates.map(coord => {
      return coord[0].map(c => {
        return { lat: parseFloat(c[1]), lng: parseFloat(c[0]) }
      })
    })
    return _paths
  }
  else {
    let _paths = shape.shape.coordinates.map(coord => {
      return coord.map(c => {
        return { lat: parseFloat(c[1]), lng: parseFloat(c[0]) }
      })
    })
    return _paths
  }
}

/**
 * Abrevia valores para exibição em gráfico de barra.
 * @param {number} num - Número a ser abreviado.
 * @param {number} digits - Número de dígitos após a vírgula.
 * @returns {string} - Valor abreviado.
 */
function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}
/**
 * Analisa a disponibilidade de recursos hídricos com base em informações e marcadores subterrâneos.
 *
 * @param {object} hgInfo - Informações sobre a shape (hidrogeo) fraturado ou poroso.
 * @param {array} subterraneanMarkers - Marcadores de outorgas subterrâneas (manual ou tubular).
 * @returns {object} - Um objeto contendo informações analisadas.
 */
function analyzeAvailability(hgInfo, subterraneanMarkers) {
  // Somatório de vazão anual
  let qTotalAnnual = 0;
  subterraneanMarkers.map((sMarker) => {
    if (typeof sMarker.dt_demanda.vol_anual_ma === 'undefined') {
      return qTotalAnnual += 0;
    } else {
      return qTotalAnnual += parseFloat(sMarker.dt_demanda.vol_anual_ma);
    }
  });

  // Cálculo de vazão anual do usuário solicitado
  let qUserAnnual = parseFloat(subterraneanMarkers[0].dt_demanda.vol_anual_ma).toFixed(4) || 0;

  // Extração de valores da tabela hidrogeo (fraturado ou poroso)
  let {
    bacia_nome: basinName,
    uh_label: uhNameLabel,
    uh_nome: uhName,
    sistema: subsystem,
    cod_plan: codPlan,
    re_cm_ano: qExploitable,
  } = hgInfo;

  // Cálculo do números de pontos no polígono
  let numberOfPoints = subterraneanMarkers.length;

  // Porcentagem de uso da vazão disponível
  let qPointsPercentage = ((qTotalAnnual * 100) / qExploitable) || 0;

  // Cálculo de disponibilidade do subsistema
  let volAvailable = (qExploitable - qTotalAnnual);

  return {
    basinName,
    uhNameLabel,
    uhName,
    subsystem,
    codPlan,
    qExploitable,
    numberOfPoints,
    qUserAnnual,
    qTotalAnnual: parseFloat(qTotalAnnual).toFixed(4),
    qPointsPercentage,
    volAvailable: parseFloat(volAvailable).toFixed(4),
  };
}

/**
 * Adiciona pontos separadores nos números, ex: 37274109,255484 para 37.274.109,255484.
 * @param {*} x - O número a ser formatado.
 * @returns {string} - O número formatado com os pontos separadores.
 */
function numberWithCommas(x) {
  // Converte para float e define a precisão de 4 casas decimais
  x = parseFloat(x).toFixed(4);
  // Divide o número em partes inteira e decimal
  var parts = x.toString().split(".");
  // Adiciona os pontos separadores de milhares à parte inteira
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Junta novamente as partes inteira e decimal com o ponto decimal
  return parts.join(",");
}

/**
 * Calcula a área de um retângulo com base nos limites fornecidos.
 * @param {google.maps.LatLngBounds} bounds - Os limites do retângulo.
 * @returns {number} - A área do retângulo.
 */
function calculateRectangleArea(bounds) {
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();

  // Calcula a largura usando a distância entre dois pontos no eixo leste-oeste
  var width = window.google.maps.geometry.spherical.computeDistanceBetween(
    new window.google.maps.LatLng(ne.lat(), ne.lng()),
    new window.google.maps.LatLng(sw.lat(), ne.lng())
  );

  // Calcula a altura usando a distância entre dois pontos no eixo norte-sul
  var height = window.google.maps.geometry.spherical.computeDistanceBetween(
    new window.google.maps.LatLng(ne.lat(), ne.lng()),
    new window.google.maps.LatLng(ne.lat(), sw.lng())
  );

  return Math.abs(width * height);
}


/**
 * Calcula a área de um círculo com base no raio fornecido.
 * @param {number} radius - Raio do círculo.
 * @returns {number|string} - Área do círculo ou uma mensagem de erro se o raio for inválido.
 */
function calculateCircleArea(radius) {
  if (radius >= 0) {
    var area = Math.PI * Math.pow(radius, 2);
    return area.toFixed(4);
  } else {
    return "Raio inválido";
  }
}

/**
 * Calcula a área de um polígono com base nos vértices fornecidos.
 * @param {google.maps.Polygon} polygon - Polígono para calcular a área.
 * @returns {number} - Área do polígono.
 */
function calculatePolygonArea(polygon) {
  var path = polygon.getPath();
  var coords = [];

  for (var i = 0; i < path.getLength(); i++) {
    var latLng = path.getAt(i);
    coords.push({ lat: latLng.lat(), lng: latLng.lng() });
  }

  var area = window.google.maps.geometry.spherical.computeArea(coords);
  return area;
}

/**
 * Calcula o comprimento de uma polilinha com base nos pontos fornecidos.
 * @param {google.maps.Polyline} polyline - Polilinha para calcular o comprimento.
 * @returns {number} - Comprimento da polilinha em metros.
 */
function calculatePolylineLength(polyline) {
  const lengthInMeters = window.google.maps.geometry.spherical.computeLength(polyline.getPath());
  return lengthInMeters;
}



function setInfoMarkerIcon(id, ti_id, tp_id) {
  if (id === 0) {
    return { mkr: mkrRedIcon, color: '#9D0404' };
  } else {
    switch (ti_id) {
      case 1:
        return { type: 'superficial', mkr: mkrGreenIcon, color: '#019367', iw: iwSuperficialIcon() };
      case 2:
        return tp_id === 1 ?
          { type: 'subterraneo-manual', mkr: mkrBlueIcon, color: '#BD371A', iw: iwManualIcon() } :
          { type: 'subterraneo-tubular', mkr: mkrBlueIcon, color: '#040C9D', iw: iwTubularIcon() };
      case 3:
        return { type: 'pluvial', mkr: mkrOrangeIcon, color: '#E3AB00', iw: iwPluvialIcon() };
      case 4:
        return { type: 'efluente', mkr: mkrPinkIcon, color: '#9D0471', iw: iwEfluenteIcon() };
      case 5:
        return { type: 'barragem', mkr: mkrPurpleIcon, color: '#BDB01A', iw: iwBarragemIcon() };
      case 6:
        return { type: 'caminhao', mrk: mkrPinkIcon, color: '#BD1A8E', iw: 'null' }
      default:
        return null; // Return null or handle other cases as needed
    }
  }
}


export {
  createCircleRings,
  converterPostgresToGmaps, nFormatter,
  analyzeAvailability, numberWithCommas,
  calculateCircleArea, calculateRectangleArea,
  calculatePolylineLength, calculatePolygonArea,
  setInfoMarkerIcon
}