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


const fetchAddressesByPolygon = async (polygon) => {

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("geometry", JSON.stringify(polygon));
  urlencoded.append("geometryType", "esriGeometryPolygon");
  urlencoded.append("inSR", "4674");
  urlencoded.append("spatialRel", "esriSpatialRelIntersects");
  urlencoded.append("outFields", "*"); https://www.geoservicos.ide.df.gov.br
  urlencoded.append("returnGeometry", "true");
  urlencoded.append("outSR", "4674");
  urlencoded.append("f", "json");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,

  };

  let results = fetch("https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Aplicacoes/ENDERECAMENTO_ATIVIDADES_LUOS_PPCUB/FeatureServer/0/query", requestOptions)
    .then((response) => response.json())
    .then((results) => results)
    .catch((error) => console.error(error));

  return results;

}


const fetchAddressesByPosition = async (position) => {

  console.log('fetch fetch address by position')

  let { lat, lng } = position;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  // Objeto de parâmetros
  const params = {
    f: "json",
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: "esriGeometryPoint",
    inSR: "4674",
    spatialRel: "esriSpatialRelIntersects",
    // distância de busca
    distance: "200",
    // unidade da distância de busca em metros
    units: "esriSRUnit_Meter",
    outFields: "*",
    returnGeometry: "true",
    where: "1=1",
    outSR: "4674"
  };

  // Converte o objeto em URLSearchParams
  const urlencoded = new URLSearchParams(params);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded
  };

  let results = await fetch("https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Aplicacoes/ENDERECAMENTO_ATIVIDADES_LUOS_PPCUB/FeatureServer/0/query", requestOptions)
    .then((response) => response.json())
    .then((results) => results)
    .catch((error) => console.error(error));

  return results;

}

const fetchHydroByPolygon = async (polygon) => {

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("geometry", JSON.stringify(polygon));
  urlencoded.append("geometryType", "esriGeometryPolygon");
  urlencoded.append("inSR", "4674");
  urlencoded.append("spatialRel", "esriSpatialRelIntersects");
  urlencoded.append("distance", "100")
  urlencoded.append("units", "esriSRUnit_Meter")
  urlencoded.append("units", "esriSRUnit_Meter")
  urlencoded.append("outFields", "*");
  urlencoded.append("returnGeometry", "true");
  urlencoded.append("outSR", "4674");
  urlencoded.append("f", "json");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,

  };

  let results = fetch("https://atlas.caesb.df.gov.br/server/rest/services/INTEGRACAO_GDF/SistemaAbastecimentoAguaDF/FeatureServer/92/query", requestOptions)
    .then((response) => response.json())
    .then((results) => results)
    .catch((error) => console.error(error));

  return results;

}

const fetchSuplySystemByPosition = async (position) => {

  console.log('fetch fetch supply system by position')
  const { lat, lng } = position;

  const requestOptions = {
    method: "GET"
  };

  const baseUrl = "https://atlas.caesb.df.gov.br/server/rest/services/INTEGRACAO_GDF/SistemaAbastecimentoAguaDF/FeatureServer/92/query";

  const params = {
    geometry: JSON.stringify({ x: lng, y: lat }),
    geometryType: "esriGeometryPoint",
    inSR: "4674",
    spatialRel: "esriSpatialRelIntersects",
    distance: "1000",
    units: "esriSRUnit_Meter",
    outFields: "*",
    returnGeometry: "true",
    outSR: "4674",
    f: "json"
  };

  // Monta a query string a partir do objeto
  const queryString = new URLSearchParams(params).toString();

  // URL completa
  const url = `${baseUrl}?${queryString}`;

  let results = await fetch(url, requestOptions)
    .then(response => response.json())
    .then(results => results)
    .catch(error => console.error(error));

  return results;

}

const fetchAdministrativeRegions = async () => {

  console.log('fetch administrative regions')
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  const params = {
    where: "1=1",
    geometryType: "esriGeometryEnvelope",
    outSR: 4674,
    spatialRel: "esriSpatialRelIntersects",
    units: "esriSRUnit_Foot",
    outFields: "objectid,ra_cira,ra_codigo,ra_nome,ra_areakm2",
    returnGeometry: true,
    f: "json"
  };

  const baseUrl = "https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Aplicacoes/HISTORICO_RA/FeatureServer/7/query";
  const url = `${baseUrl}?${new URLSearchParams(params).toString()}`;

  let results = await fetch(url, requestOptions)
    .then((response) => response.json()) // melhor já transformar em JSON
    .then((results) => results)
    .catch((error) => console.error(error));

  return results;

}

async function fetchAddressByKeyword(keyword) {

  let where = `pu_end_usual LIKE '%${keyword.toUpperCase()}%'`

  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  const params = {
    where: where,
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    units: "esriSRUnit_Foot",
    returnGeometry: true,
    returnDistinctValues: false,
    returnIdsOnly: false,
    returnCountOnly: false,
    returnExtentOnly: false,
    returnZ: false,
    returnM: false,
    multipatchOption: "xyFootprint",
    returnTrueCurves: false,
    returnExceededLimitFeatures: false,
    returnCentroid: false,
    sqlFormat: "none",
    featureEncoding: "esriDefault",
    f: "json",
    outFields: "*"
  };

  // monta a query string
  const queryString = new URLSearchParams(params).toString();

  // monta a URL final
  const url = `https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Aplicacoes/ENDERECAMENTO_ATIVIDADES_LUOS_PPCUB/FeatureServer/0/query?${queryString}`;

  let results = await fetch(url, requestOptions)
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => console.error(error));


  /* example: 
  [
      {
          "objectid": 1389,
          "pu_ciu": "00135I1C0107",
          "pu_end_cart": "SETOR G NORTE QNG AE 30",
          "pu_end_usual": "SETOR G NORTE QNG AE 30",
          "pu_cep": "72130002",
          "x": 172283.92420000024,
          "y": 8251091.5246,
          "pn_norma_vg": "LC 948/2019 alterada pela LC 1007/2022",
          "pn_uso": "CSIIR 3",
          "pn_alt_max": 29.5,
          "pu_cipu": 67218,
          "pu_ra": 3
      },
      ...
  ]
  */
  return results.features.map((f) => ({
    ...f.attributes,
    geometry: f.geometry, // se precisar da geometria também
  }));

}


export { getUsers, findDemands, fetchSuplySystemByPosition, fetchAddressesByPosition, fetchAdministrativeRegions, fetchAddressByKeyword }