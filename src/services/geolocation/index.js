
const url = 'https://app-sis-out-srh-backend-01-h3hkbcf5f8dubbdy.brazilsouth-01.azurewebsites.net';


async function findAllPointsInASubsystem(tp_id, lat, lng) {

  try {
    const response = await fetch(url + `/find-points-inside-subsystem?tp_id=${tp_id}&lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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

  try {
    const response = await fetch(url + '/find-points-inside-rectangle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

  console.log('findAllPointsInPolygon')

  try {
    const response = await fetch(url + '/find-points-inside-polygon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

    console.log('findAllPointsInCircle')


  try {
    const response = await fetch(url + '/find-points-inside-circle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(circle)
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
* Através de uma coordenada buscar todos os pontos no sistema (fraturado ou poroso) ao qual pertence a coordenada. 
* @param {integer} tp_id Tipo de poço em análise, se tubular ou manual.
* @param {float} lat Latitude.
* @para {float} lng Longitue.
*
  */


async function findPointsInASystem(tp_id, lat, lng) {

    console.log('findPointsInASystem')

  //  Tipo de poço na forma antiga 1 - Manual e 2 - Tubular
  //      opções neste sistema
  //          1 - Manual e (antigo 1)
  //          2 - Tubular Raso (antigo 1)
  //          3 - Tubular Profundo (antito 2)
  let _tp_id = (tp_id === 1 || tp_id === 2) ? 1 : 2;

  let url = 'https://njs-drainage-ueredeveloper.replit.app';

  let response = await fetch(url + `/findPointsInASystem?tp_id=${_tp_id}&lat=${lat}&lng=${lng}`, {
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

export {
  findAllPointsInASubsystem,
  findAllPointsInRectangle,
  findAllPointsInPolygon,
  findAllPointsInCircle,
  findPointsInASystem
};
