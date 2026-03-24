import * as XLSX from 'xlsx';

export const exportBarrageToCsv = (data) => {
  const { marker, damData, operacao, result } = data;
  const wsData = [];

  // 1. Dados Gerais e da Barragem
  wsData.push(["DADOS GERAIS"]);
  wsData.push(["Latitude", marker?.int_latitude || ""]);
  wsData.push(["Longitude", marker?.int_longitude || ""]);
  
  if (result?.dbResult?.informacoes_adicionais) {
    wsData.push(["Área de Contribuição (km²)", result.dbResult.informacoes_adicionais.area_contribuicao]);
    wsData.push(["Unidade Hidrográfica", result.dbResult.informacoes_adicionais.uh_nome]);
    wsData.push(["Rótulo UH", result.dbResult.informacoes_adicionais.uh_rotulo]);
  }

  wsData.push([]);
  wsData.push(["DADOS DA BARRAGEM"]);
  wsData.push(["V. Máx (m³)", damData.Max_Volume]);
  wsData.push(["V. Mín (m³)", damData.Min_Volume]);
  wsData.push(["Área (m²)", damData.Tot_Area]);
  wsData.push(["Infilt. (m/d)", damData.M_Infiltration]);
  wsData.push(["Q Reg (m³/s)", damData.Q_Reg]);
  wsData.push(["Min Vol. Obs", damData.Min_Vol_Observed]);
  wsData.push(["Capt. (L/s)", damData.Q_Cap]);
  wsData.push([]);

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // 2. Tabela Operação
  wsData.push(["TABELA OPERAÇÃO"]);
  wsData.push(["Parâmetro", ...months]);
  
  wsData.push(["Vazão (L/s)", ...operacao.vazao_l_s]);
  wsData.push(["T. Cap (h)", ...operacao.tempDia]);
  wsData.push(["Dias", ...operacao.Dias]);
  wsData.push(["Evap. (mm)", ...operacao.Evaporacao]);
  wsData.push(["Qmm (Reg.) (m³/s)", ...operacao.qmm]);
  
  if (result?.dbResult?.operacao?.Q_defluente) {
    wsData.push(["Q Defluente (m³/s)", ...result.dbResult.operacao.Q_defluente]);
  }
  
  wsData.push([]);

  // 3. Tabela Planilha
  if (result?.resultadoCalculo?.planilha) {
    wsData.push(["TABELA PLANILHA"]);
    wsData.push(["Mês", "Qmm", "Entrada", "Infilt.", "Evap.", "Capt.", "V. Final", "Status"]);
    result.resultadoCalculo.planilha.forEach(row => {
      wsData.push([
        row.Mes,
        row.Qmmm_m3s,
        row.Entrada_m3_mes,
        row.Infiltracao_m3_mes,
        row.Evaporacao_m3_mes,
        row.Captacao_m3_mes,
        row.Vol_Final,
        row.CHECK
      ]);
    });
    wsData.push([]);
  }

  // 4. Tabela Bruta
  if (result?.resultadoCalculo?.bruta) {
    wsData.push(["TABELA BRUTA"]);
    wsData.push(["Mês", "Entr. Méd", "Evap.", "Infilt.", "QCap", "V. Final", "V. Prob", "Chk"]);
    const bruta = result.resultadoCalculo.bruta;
    if (bruta.meses) {
      bruta.meses.forEach((mes, idx) => {
        wsData.push([
          mes,
          bruta.entrada_media[idx],
          bruta.evaporacao_m3[idx],
          bruta.infiltracao[idx],
          bruta.qcap_total[idx],
          bruta.volume_final[idx],
          bruta.volume_prob[idx],
          bruta.CHECK[idx]
        ]);
      });
    }
  }

  // Cria o workbook e a worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Adiciona a planilha ao workbook e salva como CSV
  XLSX.utils.book_append_sheet(wb, ws, "Dados Barragem");
  XLSX.writeFile(wb, "dados_barragem.csv");
};