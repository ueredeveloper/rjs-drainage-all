import { calculateContributingArea, convertOthoCoordToGmaps } from "../../tools";
import { joinPolygons } from "../../tools/surface-tools";

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
async function fetchOttoBasins(lat, lng) {

  let params = new URLSearchParams({
    lat: lat,
    lng: lng
  });

  /**
   * Buscar as áreas de drenagem no servidor.
   * @param {number} lat Latitude do ponto.
   * @param {number} lng Longitude do ponto.
   * @param {string} uh Unidade Hidrográfica.
   * @returns {Promise<Array>} Uma Promise que resolve com as informações de áreas de drenagem.
   */
  let features = await fetch(`${url}/find-otto-basins-by-lat-lng?${params}`,
    {
      method: "GET"
    })
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

      // Seta informações da Unidade Hidrográfica
      ottoBasinsToGmaps.uhNome = ottoBasins[0]?.attributes.uh_nome;
      ottoBasinsToGmaps.uhRotulo = ottoBasins[0]?.attributes.uh_rotulo;


      return { ottoBasins, ottoBasinsToGmaps };
    });

  return features;
}

/**
 * Busca pontos superficiais outorgados pela Unidade Hidrográfica
 * @param {*} uh_codigo 
 * @returns 
 */
async function fetchMarkersByUH(uh_codigo) {

  let points = await fetch(`${url}/find-surface-pointos-inside-uh?uh_codigo=${uh_codigo}`,
    {
      method: 'GET',
      headers: {
        "Content-type": "application/json",
        "Accept": "application/json",
      },

    }).then(response => {
      return response.json();
    })

  return points;

}



export { fetchShape, fetchGrantsInsideShape, fetchOttoBasins, fetchMarkersByUH }