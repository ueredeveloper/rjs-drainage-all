import { useRadioGroup } from "@mui/material";

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

  //const njs_drainage_url = 'https://njs-drainage.ueredeveloper.repl.co';
  const njs_drainage_url = 'https://ec96a2d0-8ba3-41ec-9211-9dbcf7faee95-00-1dq8pdj62qrea.hacker.replit.dev'

  async function findByColumn (searchQuery) {

    const urlWithParams = `${njs_drainage_url}/findAllPoints?searchQuery=${searchQuery}`;

    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
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
  

  
  export { findUsers, findDemands, findByColumn };
  