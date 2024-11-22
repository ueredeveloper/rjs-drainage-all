//const url = 'https://njs-drainage.ueredeveloper.repl.co';
const url = 'https://njs-drainage-ueredeveloper.replit.app';
/**
 * Encontra pontos dentro de um polígono.
 *
 * @param {object} polygon O polígono para o qual se deseja encontrar pontos.
 * @returns {Promise<Array>} Uma Promise que resolve para uma matriz de pontos encontrados.
 */
async function findPointsInsidePolygon(polygon) {
  let points = await fetch(url + '/findPointsInsidePolygon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(polygon)
  }).then(response => {
    return response.json();
  });

  return points;
}

/**
 * Encontra pontos dentro de um círculo.
 *
 * @param {object} circle O círculo para o qual se deseja encontrar pontos.
 * @returns {Promise<Array>} Uma Promise que resolve para uma matriz de pontos encontrados.
 */
async function findPointsInsideCircle(circle) {

  let points = await fetch(url + '/findPointsInsideCircle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(circle)
  }).then(response => {
    return response.json();
  });

  return points;
}

/**
 * Encontra pontos dentro de um retângulo.
 *
 * @param {object} rectangle O retângulo para o qual se deseja encontrar pontos.
 * @returns {Promise<Array>} Uma Promise que resolve para uma matriz de pontos encontrados.
 */
async function findPointsInsideRectangle(rectangle) {
  let points = await fetch(url + '/findPointsInsideRectangle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rectangle)
  }).then(response => {
    return response.json();
  });

  return points;
}

/**
 * Encontra pontos em um sistema com base no tipo, latitude e longitude fornecidos.
 *
 * @param {integer} tp_id O tipo de poço em análise, tubular ou manual.
 * @param {float} lat A latitude.
 * @param {float} lng A longitude.
 * @returns {Promise<Array>} Uma Promise que resolve para uma matriz de pontos encontrados.
 */
async function findPointsInASystem(tp_id, lat, lng) {
  let response = await fetch(url + `/findPointsInASystem?tp_id=${tp_id}&lat=${lat}&lng=${lng}`, {
    method: 'GET',
    headers: {
      Accept: 'application/JSON',
      'Content-Type': 'application/JSON',
    }
  }).then(res => {
    return res.json();
  });

  return response;
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
async function findAllPointsInRectangle(xmin, ymin, xmax, ymax) {
 
  try {
    const response = await fetch(url + '/findAllPointsInRectangle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        xmin,
        ymin,
        xmax,
        ymax
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
  try {
    const response = await fetch(url + '/findAllPointsInPolygon', {
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

  try {
    const response = await fetch(url + '/findAllPointsInCircle', {
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

export {
  findAllPointsInRectangle,
  findAllPointsInPolygon,
  findAllPointsInCircle,
  findPointsInsidePolygon,
  findPointsInsideRectangle,
  findPointsInsideCircle,
  findPointsInASystem
};
