//const url = 'https://njs-drainage.ueredeveloper.repl.co';
//const url = 'https://njs-drainage-ueredeveloper.replit.app';
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

  console.log(response)

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
async function fetchGrantsInsideShape (shapeName, shapeCode) {

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


export { fetchShape, fetchGrantsInsideShape }