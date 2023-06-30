/**
* Buscar a shape solicitada no servidor
* @param shape Pode ser os valores 'hidrogeo_fraturado' ou 'hidrogeo_poroso'
*
  */
async function findShape(shape) {

    let response = await fetch(url + `/getShape?shape=${shape}`, {
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


  export {findShape}