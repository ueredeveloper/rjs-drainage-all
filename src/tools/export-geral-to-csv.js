import * as XLSX from 'xlsx';

/**
 * Exporta os dados da tabela da aba Geral para um arquivo Excel (.xlsx).
 *
 * @param {object} params
 * @param {string[]} params.headers - Cabeçalhos das colunas.
 * @param {string[][]} params.rows - Linhas de dados (array de arrays de strings).
 * @param {string} [params.filename] - Nome do arquivo (sem extensão).
 */
export const exportGeralToCsv = ({ headers, rows, filename = 'outorgas' }) => {
  const wb = XLSX.utils.book_new();

  const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'E0E0E0' } } };
  const stripeStyle = { fill: { fgColor: { rgb: 'F5F5F5' } } };

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  const range = XLSX.utils.decode_range(ws['!ref']);

  // Estilo do cabeçalho
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const ref = XLSX.utils.encode_cell({ c: C, r: 0 });
    if (ws[ref]) ws[ref].s = headerStyle;
  }

  // Listras alternadas nas linhas de dados
  for (let R = 1; R <= range.e.r; ++R) {
    if (R % 2 === 0) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const ref = XLSX.utils.encode_cell({ c: C, r: R });
        if (ws[ref]) ws[ref].s = stripeStyle;
      }
    }
  }

  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
    return { wch: Math.min(maxLen + 2, 40) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Outorgas');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
