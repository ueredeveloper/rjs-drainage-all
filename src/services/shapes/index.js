//const url = 'https://njs-drainage.ueredeveloper.repl.co';
const url = 'https://njs-drainage-ueredeveloper.replit.app';
/**
* Buscar a shape solicitada no servidor
* @param shapeName Pode ser os valores 'hidrogeo_fraturado' ou 'hidrogeo_poroso'
*
  */
async function fetchShape(shapeName) {

  let response = await fetch(url + `/getShape?shape=${shapeName}`, {
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
async function fetchGrantsInsideShape (shapeName, shapeCode) {
  try {
    const response = await fetch(url + `/findGrantsInsideShape?shapeName=${shapeName}&shapeCode=${shapeCode}`, {
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