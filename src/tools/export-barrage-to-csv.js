import * as XLSX from 'xlsx';

/**
 * Exporta os dados da análise da barragem para um arquivo Excel (.xlsx) com formatação.
 * A função compila dados do formulário, operação e resultados do cálculo em múltiplas abas,
 * com estilização (cores alternadas, cabeçalhos) e cálculo de médias para facilitar a análise.
 *
 * @param {object} data - Objeto contendo todos os dados a serem exportados.
 * @param {object} data.marker - Informações do marcador (latitude, longitude).
 * @param {object} data.damData - Dados do formulário da barragem (volumes, área, etc.).
 * @param {object} data.operacao - Dados da tabela de operação (vazões, dias, evaporação, etc.).
 * @param {object} data.result - Objeto com os resultados do cálculo do balanço hídrico, incluindo as tabelas 'planilha' e 'bruta'.
 */
export const exportBarrageToCsv = (data) => {
  const { marker, damData, operacao, result } = data;
  const wb = XLSX.utils.book_new();

  // --- Estilos ---
  const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } } }; // Cinza claro
  const stripeStyle = { fill: { fgColor: { rgb: "F5F5F5" } } }; // Cinza bem claro (quase branco)
  const avgStyle = { font: { bold: true } };

  // --- Aba 1: Dados de Entrada ---
  const wsDataForm = [];
  wsDataForm.push(["DADOS GERAIS"]);
  wsDataForm.push(["Parâmetro", "Valor"]);
  wsDataForm.push(["Latitude", marker?.int_latitude || ""]);
  wsDataForm.push(["Longitude", marker?.int_longitude || ""]);
  
  if (result?.dbResult?.informacoes_adicionais) {
    wsDataForm.push(["Área de Contribuição (km²)", result.dbResult.informacoes_adicionais.area_contribuicao]);
    wsDataForm.push(["Unidade Hidrográfica", result.dbResult.informacoes_adicionais.uh_nome]);
    wsDataForm.push(["Rótulo UH", result.dbResult.informacoes_adicionais.uh_rotulo]);
  } else {
    wsDataForm.push(["Área de Contribuição (km²)", ""]);
    wsDataForm.push(["Unidade Hidrográfica", ""]);
    wsDataForm.push(["Rótulo UH", ""]);
  }

  wsDataForm.push([]); // Linha vazia para espaçamento
  wsDataForm.push(["DADOS DA BARRAGEM"]);
  wsDataForm.push(["Parâmetro", "Valor"]);
  wsDataForm.push(["V. Máx (m³)", damData.Max_Volume]);
  wsDataForm.push(["V. Mín (m³)", damData.Min_Volume]);
  wsDataForm.push(["Área (m²)", damData.Tot_Area]);
  wsDataForm.push(["Infilt. (m/d)", damData.M_Infiltration]);
  wsDataForm.push(["Anos", operacao.anos]);

  const wsForm = XLSX.utils.aoa_to_sheet(wsDataForm);
  // Aplica estilos manualmente para esta aba específica
  const headerRowsForm = [0, 1, 5, 6];
  const dataRowsForm = [2, 3, 4, 7, 8, 9, 10, 11];
  headerRowsForm.forEach(r => {
    ['A', 'B'].forEach(c => {
      const cellRef = `${c}${r + 1}`;
      if (wsForm[cellRef]) wsForm[cellRef].s = headerStyle;
    });
  });
  dataRowsForm.forEach((r, i) => {
    if (i % 2 !== 0) { // Linhas de dados ímpares no array (segunda, quarta, etc.)
      ['A', 'B'].forEach(c => {
        const cellRef = `${c}${r + 1}`;
        if (wsForm[cellRef]) wsForm[cellRef].s = stripeStyle;
      });
    }
  });
  wsForm['!cols'] = Array(2).fill({ wch: 25 }); // Ajustado para melhor visualização dos títulos
  XLSX.utils.book_append_sheet(wb, wsForm, "Dados de Entrada");

  // --- Aba 2: Operação ---
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const wsDataOperacao = [];
  wsDataOperacao.push(["Parâmetro", ...months, "Média"]);

  const createRowWithAvg = (label, values) => {
    const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
    const avg = numericValues.length > 0 ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length) : 0;
    return [label, ...values, avg.toFixed(2)];
  };

  wsDataOperacao.push(createRowWithAvg("Vazão (L/s)", operacao.vazao_l_s));
  wsDataOperacao.push(createRowWithAvg("T. Cap (h)", operacao.tempDia));
  wsDataOperacao.push(createRowWithAvg("Dias", operacao.Dias));
  wsDataOperacao.push(createRowWithAvg("Evap. (mm)", operacao.Evaporacao));
  wsDataOperacao.push(createRowWithAvg("Qmm (Reg.) (m³/s)", operacao.qmm));
  
  if (result?.dbResult?.operacao?.Q_defluente) {
    wsDataOperacao.push(createRowWithAvg("Q Defluente (m³/s)", result.dbResult.operacao.Q_defluente));
  }
  
  const wsOperacao = XLSX.utils.aoa_to_sheet(wsDataOperacao);
  const rangeOperacao = XLSX.utils.decode_range(wsOperacao['!ref']);
  for (let C = rangeOperacao.s.c; C <= rangeOperacao.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ c: C, r: 0 });
    if (wsOperacao[cellRef]) wsOperacao[cellRef].s = headerStyle;
  }
  for (let R = 1; R <= rangeOperacao.e.r; ++R) {
    if (R % 2 !== 0) { // Linha de dados ímpar (1, 3, 5...)
      for (let C = rangeOperacao.s.c; C <= rangeOperacao.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        if (wsOperacao[cellRef]) wsOperacao[cellRef].s = stripeStyle;
      }
    }
  }
  wsOperacao['!cols'] = Array(14).fill({ wch: 15 });
  XLSX.utils.book_append_sheet(wb, wsOperacao, "Operação");

  // --- Aba 3: Planilha ---
  if (result?.resultadoCalculo?.planilha) {
    const dataRows = result.resultadoCalculo.planilha;
    const headers = ["Mês", "Qmm (m³/s)", "Entrada (m³/mês)", "Infiltração (m³/mês)", "Evaporação (m³/mês)", "Captação (m³/mês)", "Volume Final (m³)", "Status"];
    const wsDataPlanilha = [headers, ...dataRows.map(row => Object.values(row))];

    const avgRow = ["Média"];
    const numericIndices = [1, 2, 3, 4, 5, 6];
    numericIndices.forEach(idx => {
        const total = dataRows.reduce((sum, row) => sum + Number(Object.values(row)[idx] || 0), 0);
        avgRow[idx] = (total / dataRows.length).toFixed(2);
    });
    wsDataPlanilha.push(avgRow);

    const wsPlanilha = XLSX.utils.aoa_to_sheet(wsDataPlanilha);
    const rangePlanilha = XLSX.utils.decode_range(wsPlanilha['!ref']);
    for (let C = 0; C <= rangePlanilha.e.c; ++C) {
        if (wsPlanilha[XLSX.utils.encode_cell({c:C, r:0})]) wsPlanilha[XLSX.utils.encode_cell({c:C, r:0})].s = headerStyle;
    }
    for (let R = 1; R < rangePlanilha.e.r; ++R) {
        if (R % 2 !== 0) {
            for (let C = 0; C <= rangePlanilha.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
                if (wsPlanilha[cellRef]) wsPlanilha[cellRef].s = stripeStyle;
            }
        }
    }
    for (let C = 0; C <= rangePlanilha.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: rangePlanilha.e.r });
        if (wsPlanilha[cellRef]) wsPlanilha[cellRef].s = avgStyle;
    }
    wsPlanilha['!cols'] = Array(headers.length).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, wsPlanilha, "Planilha");
  }

  // --- Aba 4: Bruta ---
  if (result?.resultadoCalculo?.bruta) {
    const bruta = result.resultadoCalculo.bruta;
    const headers = ["Mês", "Entrada Média (m³)", "Evaporação (m³)", "Infiltração (m³)", "QCap Total (m³)", "Volume Final (m³)", "Volume Probabilidade", "Check"];
    const dataRows = bruta.meses.map((mes, idx) => [
        mes, bruta.entrada_media[idx], bruta.evaporacao_m3[idx], bruta.infiltracao[idx],
        bruta.qcap_total[idx], bruta.volume_final[idx], bruta.volume_prob[idx], bruta.CHECK[idx]
    ]);
    const wsDataBruta = [headers, ...dataRows];

    const avgRowBruta = ["Média"];
    const numericIndicesBruta = [1, 2, 3, 4, 5, 6];
    numericIndicesBruta.forEach(idx => {
        const total = dataRows.reduce((sum, row) => sum + Number(row[idx] || 0), 0);
        avgRowBruta[idx] = (total / dataRows.length).toFixed(2);
    });
    wsDataBruta.push(avgRowBruta);

    const wsBruta = XLSX.utils.aoa_to_sheet(wsDataBruta);
    const rangeBruta = XLSX.utils.decode_range(wsBruta['!ref']);
    for (let C = 0; C <= rangeBruta.e.c; ++C) {
        if (wsBruta[XLSX.utils.encode_cell({c:C, r:0})]) wsBruta[XLSX.utils.encode_cell({c:C, r:0})].s = headerStyle;
    }
    for (let R = 1; R < rangeBruta.e.r; ++R) {
        if (R % 2 !== 0) {
            for (let C = 0; C <= rangeBruta.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
                if (wsBruta[cellRef]) wsBruta[cellRef].s = stripeStyle;
            }
        }
    }
    for (let C = 0; C <= rangeBruta.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: rangeBruta.e.r });
        if (wsBruta[cellRef]) wsBruta[cellRef].s = avgStyle;
    }
    wsBruta['!cols'] = Array(headers.length).fill({ wch: 15 });
    XLSX.utils.book_append_sheet(wb, wsBruta, "Bruta");
  }

  // Salva o arquivo como .xlsx
  XLSX.writeFile(wb, "dados_barragem.xlsx");
};