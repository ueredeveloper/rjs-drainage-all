/**
*  Converter uma união de shapes feita na jtst com formato do gmaps api para o formato que possa ser utilizado na arcgis rest service.
*  @param {object[]} rings Array com coordenadas no formato gmaps api, ex: [{lat: -17, lng: -47},...]
*  @returns {object[]} arcGis. Array no formato Arg Gis Rest Service, ex: [[[-47...,-15...],...,[-48...,-16...]]]
*/
const gmapsToArcGis = (rings) => {
  // arcGis = [[]] => [[[-47,-16], [-47,-17], [-47,-18]]]
  let arcGis = [[]];
  rings.forEach(r => {
    // adicionar tudo na posição 0 da array.
    arcGis[0].push([r.lng(), r.lat()])
  })
  // adicionar a primeira coordenada no final do polígono para fechar completamente
  if (arcGis[0][0][0] !== arcGis[0][arcGis[0].length - 1][0]) {
    arcGis[0].push(arcGis[0][0])
  }
  return arcGis;
}
/**
  * Criar linhas para cada ângulo do círculo (0 a 360º) e assim construir um polígono em formato circular para buscas de outorgas.
  * @param {object} center. Latitude e longitude do centro de um círculo.
  * @param {number} radius. Raio do circulo desenhado
  * @return {array} rings. Retorna polígono em formato de círculo.
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
/*
*
  *
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
* Abreviar valores (mil, milhares, bnilhares, ...) para mostrar na barra ( bar chart).
  * link: https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
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
 * Analisar se é possível outorgar a partir da vazão requerida, vazões outorgadas etc.
 */
function analyseItsAvaiable(_info, _points) {

  let _Q = 0;
  _points.map((_point) => {

    if (typeof _point.dt_demanda.vol_anual_ma === 'undefined') {
      return _Q += 0;
    } else {
      return _Q += parseFloat(_point.dt_demanda.vol_anual_ma);
    }
  });
  // vazão explotável/ ano
  let _q_ex = _info.re_cm_ano;
  // nº de pontos
  let _n_points = _points.length;
  // somatório de vazão anual
  let _q_points = _Q;
  // percentual de vazão utilizada
  let _q_points_per = (Number(_Q) * 100 / Number(_q_ex)).toFixed(4);
  if (isNaN(_q_points_per)) {
    console.log('análise, porcentagem, NaN')
    _q_points_per = 0;
  }

  return {
    bacia_nome: _info.bacia_nome,
    // Unidade Hidrográfica
    uh_label: _info.uh_label,
    // Nome da UH
    uh_nome: _info.uh_nome,
    // Sitema (R3, P1)
    sistema: _info.sistema,
    // Código do Sitema
    cod_plan: _info.cod_plan,
    // Q explotável
    q_ex: _q_ex,
    // nº pontos
    n_points: _n_points,
    // Q outorgada
    q_points: _q_points,
    // % utilizada
    q_points_per: _q_points_per,
    // vol disponível
    vol_avaiable: (Number(_q_ex) - Number(_q_points)).toFixed(4)
  };
}
/**
 * Adicionar pontos nos números, ex: 37274109,255484 para 37.274.109,255484.
 * @param {*} x 
 * @returns 
 */
function numberWithCommas(x) {
  // converte para float
  x = parseFloat(x).toFixed(4)
  // adiciona as pontuaçõas 2000000 => 2.000.000 e vírgula das casas decimais
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}


export { gmapsToArcGis, createCircleRings, converterPostgresToGmaps, nFormatter, analyseItsAvaiable, numberWithCommas }