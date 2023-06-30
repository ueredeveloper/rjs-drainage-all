
const njs_azure_url = `https://njs-azure.ueredeveloper.repl.co`;

/**
 * Encontra usuários com base nos parâmetros fornecidos.
 *
 * @param {string} us_nome O nome do usuário.
 * @param {string} us_cpf_cnpj O CPF ou CNPJ do usuário.
 * @param {string} doc_sei O número do documento SEI do usuário.
 * @param {string} proc_sei O número do processo SEI do usuário.
 * @returns {Promise<Object>} Uma Promise que resolve para os usuários encontrados.
 */
async function findUsers(us_nome, us_cpf_cnpj, doc_sei, proc_sei) {
    let response = await fetch(njs_azure_url + `/getUsuarios?us_nome=${us_nome}&us_cpf_cnpj=${us_cpf_cnpj}&doc_sei=${doc_sei}&proc_sei=${proc_sei}`, {
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
   * Encontra demandas com base no ID do endereço.
   *
   * @param {number} end_id O ID do endereço.
   * @returns {Promise<Object>} Uma Promise que resolve para as demandas encontradas.
   */
  async function findDemands(end_id) {
    let response = await fetch(njs_azure_url + `/getDemandas?end_id=${end_id}`, {
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
  
  export { findUsers, findDemands };
  