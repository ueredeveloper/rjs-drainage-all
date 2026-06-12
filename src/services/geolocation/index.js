
import { getAuthHeaders } from '../auth/headers';

const url = 'https://app-sis-out-srh-backend-01-h3hkbcf5f8dubbdy.brazilsouth-01.azurewebsites.net';

async function findAllPointsInASubsystem(tp_id, lat, lng) {

  try {
    const response = await fetch(url + `/find-points-inside-subsystem?tp_id=${tp_id}&lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
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
 * Encontra todos os pontos dentro de um retângulo especificado pelas coordenadas.
 *
 * @param {number} xmin A coordenada X mínima do retângulo.
 * @param {number} ymin A coordenada Y mínima do retângulo.
 * @param {number} xmax A coordenada X máxima do retângulo.
 * @param {number} ymax A coordenada Y máxima do retângulo.
 * @returns {Promise<Array>} Uma Promise que resolve para uma matriz de pontos encontrados.
 */
async function findAllPointsInRectangle(nex, ney, swx, swy) {

  console.log('nex, ney, swx, swy:', nex, ney, swx, swy);

  try {
    const response = await fetch(url + '/find-points-inside-rectangle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        nex,
        ney,
        swx,
        swy
      })
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
 * Encontra todos os pontos dentro de um polígono especificado.
 *
 * @param {object} polygon O polígono para o qual se deseja encontrar pontos.
 * @returns {Promise<Array>} Uma Promise que resolve para uma matriz de pontos encontrados.
 */
async function findAllPointsInPolygon(polygon) {

  console.log(polygon);

  try {
    const response = await fetch(url + '/find-points-inside-polygon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(polygon)
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
 * Encontra todos os pontos dentro de um círculo especificado.
 *
 * @param {object} circle O círculo para o qual se deseja encontrar pontos.
 * @returns {Promise<Array>} Uma Promise que resolve para uma matriz de pontos encontrados.
 */
async function findAllPointsInCircle(circle) {

 
  const circleJson = JSON.stringify(circle);


  console.log(circleJson);

  try {
    const response = await fetch(url + '/find-points-inside-circle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(circle)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    console.log(data[0])

    // obter primeiro índice da matriz
    return data[0];
  } catch (error) {

    console.error(error);
  }
}


/**
* Através de uma coordenada buscar todos os pontos no sistema (fraturado ou poroso) ao qual pertence a coordenada. 
* @param {integer} tp_id Tipo de poço em análise, se tubular ou manual.
* @param {float} lat Latitude.
* @para {float} lng Longitue.
*
  */


/**
 * Busca o subsistema hidrogeológico a partir de uma coordenada e tipo de poço.
 *
 * Mapeamento de tp_id:
 *   1 (Manual) ou 2 (Tubular Raso)  → sistema poroso  (id interno 1)
 *   3 (Tubular Profundo)             → sistema fraturado (id interno 2)
 *
 * @param {number|string} tp_id - Tipo do poço (1, 2 ou 3).
 * @param {number} lat - Latitude decimal.
 * @param {number} lng - Longitude decimal.
 * @returns {Promise<object>} Objeto com _hg_info, _points e _hg_shape.
 */
async function findPointsInASystem(tp_id, lat, lng) {
  const id = Number(tp_id);
  const systemId = (id === 1 || id === 2) ? 1 : 2;

  const response = await fetch(
    `${url}/find-points-inside-subsystem?tp_id=${systemId}&lat=${lat}&lng=${lng}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...getAuthHeaders() },
    }
  );

  if (!response.ok) throw new Error(`findPointsInASystem: HTTP ${response.status}`);

  return response.json();
}

export {
  findAllPointsInASubsystem,
  findAllPointsInRectangle,
  findAllPointsInPolygon,
  findAllPointsInCircle,
  findPointsInASystem
};
