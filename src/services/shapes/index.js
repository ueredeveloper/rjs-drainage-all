const url = 'https://njs-drainage.ueredeveloper.repl.co';
/**
* Buscar a shape solicitada no servidor
* @param shape Pode ser os valores 'hidrogeo_fraturado' ou 'hidrogeo_poroso'
*
  */
async function fetchShape (shape) {

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


  export {fetchShape}