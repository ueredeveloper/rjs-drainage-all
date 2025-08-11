const url = 'https://j-sb-drainage-ueredeveloper.replit.app';

/**
* Buscar a shape solicitada no servidor
* @param us_nome Nome do usuário de recursos hídricos.
* @param us_cpf_cnpj CPF ou CNPJ do usuário de recursos hídr
* @param doc_sei Número do documento no portal SEI.
* @param proc_sei Número do processo.
*
  */
async function getUsers(keyword) {

  console.log('fetch get Users')

  let response = await fetch(url + `/user/list-by-keyword?keyword=${keyword}`, {
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
* Buscar as demandas de vazões de acordo com o usuário solicitado.
*/
async function findDemands(end_id) {

    console.log('fetch find demands')

  let response = await fetch(url + `/interference/search-by-end-id?endId=${end_id}`, {
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

export { getUsers, findDemands }