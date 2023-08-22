const url = 'https://njs-drainage.ueredeveloper.repl.co';
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


export { fetchShape }