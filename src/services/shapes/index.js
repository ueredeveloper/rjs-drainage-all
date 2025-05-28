import { calculateContributingArea, convertOthoCoordToGmaps } from "../../tools";

const url = 'https://app-sis-out-srh-backend-01-h3hkbcf5f8dubbdy.brazilsouth-01.azurewebsites.net';

/**
* Buscar a shape solicitada no servidor
* @param shapeName Pode ser os valores 'hidrogeo_fraturado' ou 'hidrogeo_poroso'
*
  */
async function fetchShape(shape_name) {

  let response = await fetch(url + `/find-shape-by-name?shape_name=${shape_name}`, {
    method: 'GET',
    headers: {
      Accept: 'application/JSON',
      'Content-Type': 'application/JSON',
    }

  }).then(res => {
    return res.json();
  })

  return response;
}

/**
 * Recupera outorgas dentro de uma forma geográfica específica de uma shape (unidades hidrograficas, bacia...).
 *
 * @param {string} shapeName - O nome da forma geográfica (shape).
 * @param {string} shapeCode - O código da forma geográfica, ex: bacias hidrográficas, bacia_cod.
 * @returns {Promise<any>} Uma Promise que resolve com os dados das outorgas encontradas.
 * @throws {Error} Se ocorrer algum erro durante a busca.
 */
async function fetchGrantsInsideShape(shapeName, shapeCode) {

  try {
    const response = await fetch(url + `/find_points-inside-shape?shapeName=${shapeName}&shapeCode=${shapeCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // obter primeiro índice da matriz
    return data[0];
  } catch (error) {
    console.error(error);
  }
}

/**
 * Busca as ottobacias e converte para o formato gmaps api.
 */
async function fethcOthoBacias(uhInfo, lat, lng) {

  // URL para buscar as áreas de drenagem no servidor.
  let url =
    "https://njs-drainage-ueredeveloper.replit.app/drainage?" +

    new URLSearchParams({
      lat: lat,
      lng: lng,
      uh: uhInfo.uh_codigo, // atributo código da uh, ex: 37
    });

  //console.log(url);

  /**
   * Buscar as áreas de drenagem no servidor.
   * @param {number} lat Latitude do ponto.
   * @param {number} lng Longitude do ponto.
   * @param {string} uh Unidade Hidrográfica.
   * @returns {Promise<Array>} Uma Promise que resolve com as informações de áreas de drenagem.
   */
  let features = await fetch(url, { method: "GET" })
    .then((features) => {
      let ottoBasins = features.json();
      return ottoBasins;
    }).then(ottoBasins => {
      // Converte as coodernadas para o padrão da biblioteca gmaps api
      let ottoBasinsToGmaps = convertOthoCoordToGmaps(ottoBasins);

      // Adiciona um nome para renderizar pelo componete correto
      ottoBasinsToGmaps.name = 'otto-bacias';
      // Seta área de contribuição
      ottoBasinsToGmaps.area = calculateContributingArea(ottoBasinsToGmaps);
      // Sete informações da Unidade Hidrográfica
      ottoBasinsToGmaps.uhCodigo = uhInfo.uh_codigo;
      ottoBasinsToGmaps.uhLabel = uhInfo.uh_label;
      ottoBasinsToGmaps.unNome = uhInfo.uh_nome;
      return {ottoBasins, ottoBasinsToGmaps};
    });

  return features;
}


export { fetchShape, fetchGrantsInsideShape, fethcOthoBacias }