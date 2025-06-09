
/**
 * Calcula o somatório mensal das vazões (em L/s) de todas as demandas 
 * da seção da unidade hidrográfica com base nos dados do objeto `markers`.
 * 
 * A função percorre as interferências do tipo superficial, extrai suas demandas,
 * e soma as vazões correspondentes a cada mês do ano (janeiro a dezembro).
 *
 * @param {Object} markers - Objeto contendo os dados das interferências, 
 *                           com a propriedade `surface` (array de interferências).
 * @returns {number[]} Um array com 12 posições representando o total de vazão
 *                     mensal [jan, fev, ..., dez].
 */
function calculateQOutorgadaSecao(markers) {
  const monthlySum = new Array(12).fill(0);

  if (markers.superficial && Array.isArray(markers.superficial)) {
    markers.superficial.forEach((interference) => {
      const demands = interference.dt_demanda?.demandas || [];

      demands.forEach((demand) => {
        const monthIndex = demand.mes - 1; // month 1 = January → index 0
        const flow = parseFloat(demand.vazao);

        if (!isNaN(flow) && monthIndex >= 0 && monthIndex < 12) {
          monthlySum[monthIndex] += flow;
        }
      });
    });
  }
  return monthlySum;
};

/**
  * Calcula as vazões de referência (regionalizada)
  * @param uh {object} Unidade Hidrográfica
  * @param {number} area_mon Área de drenagem em Km² à montante de um ponto
  */
function calculateQReferenciaSecao(uh, area_contribuicao) {

  let months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

  let q_referencia_secao = [];

  months.forEach(m => {
    let qmm = 'qmm_' + m;
    q_referencia_secao.push((Number(uh[qmm]) / Number(uh.area_km_sq) * Number(area_contribuicao)).toFixed(2))
  })
  return q_referencia_secao;
}


/**
* Calcula a vazão outorgável, 80% da vazão de referência (regionalizada) com formatação de duas casas decimais.
* @param vr {number[]} Vazão de referência
*/
function calculateQOutorgavelSecao(q_referencia_secao) {
  let q_outorgavel_secao = q_referencia_secao.map(_vr => { return (Number(_vr) * 0.8).toFixed(2) });
  return q_outorgavel_secao;

}

/**
 * Calcula a vazão outorgável individual (20% da vazão outorgável) com formatação de duas casas decimais
 * @param {Number} percent Percentual de modificação (20%, 70% ou 80%), sendo que o cálculo principal é 20% (0.2)
 * @param q_outorgavel_secao {number[]} Vazão outorgável, 80% da vazão de referência.
 */
function calculateQIndividualSecao(q_outorgavel_secao, decimal) {
  let q_individual_secao = q_outorgavel_secao
    .map(_q_outorgavel_secao => {
      return (Number(_q_outorgavel_secao) * decimal).toFixed(2)
    });
  return q_individual_secao;
}

/**
* Calcula a vazão disponível
* @param q_outorgavel_secao {object} Vazão outorgada.
* @param q_outorgada_secao {object} Vazão outorgada à montante.
*/
function calculateQDisponivelSecao(q_outorgavel_secao, q_outorgada_secao) {
  let q_disponivel = q_outorgavel_secao.map((_q_outorgavel_secao, i) => { return (Number(_q_outorgavel_secao) - Number(q_outorgada_secao[i])).toFixed(2) })
  return q_disponivel;

}

// Unidade Hidrográfica

function calculateQOutorgadaUH(markers) {

  const monthlySum = new Array(12).fill(0);

  if (markers.superficial && Array.isArray(markers.superficial)) {
    markers.superficial.forEach((interference) => {
      const demands = interference.dt_demanda?.demandas || [];

      demands.forEach((demand) => {
        const monthIndex = demand.mes - 1; // month 1 = January → index 0
        const flow = parseFloat(demand.vazao);

        if (!isNaN(flow) && monthIndex >= 0 && monthIndex < 12) {
          monthlySum[monthIndex] += flow;
        }
      });
    });
  }
  return monthlySum;
};

/**
* Calcula as vazões de referência da Unidade Hidrográfica - UH.
* @param {uh} Unidade Hidrográfica.
*
*/
function calculateQReferenciaUH(uh) {

  let months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

  let q_referencia = []

  months.forEach(m => {
    let qmm = 'qmm_' + m;
    q_referencia.push((Number(uh[qmm])))
  })
  return q_referencia
}

/**
  * Calcula o valore remanescente na Unidade Hidrográfica - UH.
  * @param {Objetct} q_referencia Vazões de referência da UH.
  *
  */
function calculateQRemanescenteUH(q_referencia) {
  let _q_20 = q_referencia.map(_q_ref => { return (Number(_q_ref) * 0.2).toFixed(2) });
  return _q_20;
}

/**
* Calcula vazão outorgável na Unidade Hidrográfica - UH.
* @param {Object} q_referencia Vazão de referência da UH.
*
*/
function calculateQOutorgavelUH(q_referencia) {
  // Percentual de 80% da vazão de referência
  let _q_80 = q_referencia.map(_q_ref => { return (Number(_q_ref) * 0.8).toFixed(2) });
  return _q_80;
}


/**
* Calcula vazão disponível na Unidade Hidrográfica - UH.
* @param {Object} q_outorgavel_80 80% da vazão de referência da UH. 
* @param {Object} q_outorgada Soma das vazões outorgadas na UH.
*/
function calcularQDisponivelUH(q_outorgavel_80, q_outorgada) {
  let _q_disponivel = q_outorgavel_80.map((_q_80, i) => {
    return (Number(_q_80) - Number(q_outorgada[i])).toFixed(2)
  })
  return _q_disponivel;

}


/***
 * Calcula se a vazão solicitada (vs) é maior que a vazão disponível (vd)
 *
 */
function calculateQSolicitadaMenorQDisponivel(q_solicitada, q_disponivel_secao) {

  let q_sol_q_dis = q_solicitada.map((_qs, i) => {
    return (Number(_qs) <= Number(q_disponivel_secao[i]))
  });
  return q_sol_q_dis;

}

/**
  * Calcula se a vazão solicitada (vs) é maior que a vazão individual (v_20)
  */
function calculateQSolicitadaMenorQIndividual(q_solicitada, q_individual_secao) {
  let q_sol_q_ind = q_solicitada.map((_qs, i) => {
    return Number(_qs) <= Number(q_individual_secao[i])
  })
  return q_sol_q_ind;
}

/**
  * Calcula se a vazão solicitada é menor ou igual à vazão disponível na Unidade Hidrográfica - UH.
  * @param {Object} q_solicitada Vazão solicitada pelo usuário mês a mês.
  * @param {Object} q_disponivel_uh Vazão disponível na UH.
  */
function calculateSolicitataMenorDisponivel(q_solicitada, uh_q_disponivel) {
  let q_sol_dis = q_solicitada.map((_qs, i) => {
    return Number(_qs) <= Number(uh_q_disponivel[i])
  })
  return q_sol_dis;

}

/**
* Calcular se há disponibilidade hídrica.
* @param
* @param
* @param
* @param
*/
function calculateDisponibilidadeHidrica(secao_q_sol_q_dis, secao_q_sol_q_ind, uh_q_sol_q_dis) {
  let q_disponibilidade = secao_q_sol_q_dis.map((_qs_qd, i) => {
    return _qs_qd === true && secao_q_sol_q_ind[i] === true && uh_q_sol_q_dis[i] === true
  })
  console.log(q_disponibilidade)
  return q_disponibilidade;


}


/**
* Ajustar demanda
* @param
* @param
* @param
* @param
*/

function calculateDemandaAjustada(q_solicitada, uh_disponivel, secao_q_disponivel, secao_q_individual) {
  let _dem_ajus = q_solicitada.map((q_sol, i) => {
    let _disp = Math.min(
      Number(q_sol),
      Number(uh_disponivel[i]),
      Number(secao_q_disponivel[i]),
      Number(secao_q_individual[i]));
    return _disp > 0 ? _disp : 0;
  })
  return _dem_ajus;
}



export {
  // Seção
  calculateQOutorgadaSecao, calculateQReferenciaSecao, calculateQOutorgavelSecao,
  calculateQIndividualSecao, calculateQDisponivelSecao,
  // Seção - Cálculos
  calculateQSolicitadaMenorQDisponivel, calculateQSolicitadaMenorQIndividual,
  // Unidade Hidrográfica
  calculateQOutorgadaUH, calculateQReferenciaUH, calculateQRemanescenteUH,
  calculateQOutorgavelUH, calcularQDisponivelUH,
  // UH - Cálculos
  calculateSolicitataMenorDisponivel, calculateDisponibilidadeHidrica, calculateDemandaAjustada
}