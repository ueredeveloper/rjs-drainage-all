
const url = 'https://njs-drainage.ueredeveloper.repl.co';

async function findPointsInsidePolygon(polygon) {
  let points = await fetch(url + '/findPointsInsidePolygon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(polygon)
  }).then(response => {
    return response.json();
  })

  return points;
}
async function findPointsInsideCircle(circle) {

  let points = await fetch(url + '/findPointsInsideCircle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(circle)
  }).then(response => {
    return response.json();
  })

  return points;
}
async function findPointsInsideRectangle(rectangle) {
  let points = await fetch(url + '/findPointsInsideRectangle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rectangle)
  }).then(response => {
    return response.json();
  })

  return points;
}
/**
* Buscar a shape solicitada no servidor
* @param shape Pode ser os valores 'hidrogeo_fraturado' ou 'hidrogeo_poroso'
*
  */
async function fetchShape(shape) {

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
/**
* Através de uma coordenada buscar todos os pontos no sistema ao qual pertence a coordenada. url eg: `https://njs-adasa-postgres.ueredeveloper.repl.co/findPointsInASystem?tp_id=1&lat=-15.5334786&lng=-48.1537762`.
* @param {integer} tp_id Tipo de poço em análise, se tubular ou manual.
* @param {float} lat Latitude.
* @para {float} lng Longitue.
*
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
  })
  return response;
}

const njs_azure_url = `https://njs-azure.ueredeveloper.repl.co`;
/**
* Buscar a shape solicitada no servidor
* @param shape Pode ser os valores 'hidrogeo_fraturado' ou 'hidrogeo_poroso'
*
  */
async function getUsers(us_nome, us_cpf_cnpj, doc_sei, proc_sei) {

  let response = await fetch(njs_azure_url + `/getUsuarios?us_nome=${us_nome}&us_cpf_cnpj=${us_cpf_cnpj}&doc_sei=${doc_sei}&proc_sei=${proc_sei}`, {
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

async function findDemands(end_id) {

  let response = await fetch(njs_azure_url + `/getDemandas?end_id=${end_id}`, {
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


export { findPointsInsidePolygon, findPointsInsideRectangle, findPointsInsideCircle, findPointsInASystem, getUsers, findDemands, fetchShape}