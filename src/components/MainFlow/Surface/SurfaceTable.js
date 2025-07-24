import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useData } from "../../../hooks/analyse-hooks";
import {
  calculateDemandaAjustada,
  calculateDisponibilidadeHidrica,
  calculateQIndividualSecao,
  calculateQSolicitadaMenorQDisponivel,
  calculateQSolicitadaMenorQIndividual,
  calculateSolicitataMenorDisponivel,
} from "../../../tools/surface-tools";
import IndividualFlowSelection from "./IndividualFlowSelection";

/**
 * Componente de tabela para análise de dados superficiais de recursos hídricos.
 * Exibe um quadro de vazões mensais com campos editáveis para QSOLICITADA-SEÇÃO
 * e cálculos automáticos de disponibilidade hídrica.
 *
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.q_solicitada - Objeto contendo os valores de vazão solicitada
 * @param {Array<number>} props.q_solicitada.values - Array com 12 valores mensais de vazão solicitada (L/s)
 * @param {Object} props.analyse - Objeto contendo dados da análise hídrica
 * @param {string} props.analyse.alias - Tipo da análise ("Análise na Seção de Captação" ou "Análise na Unidade Hidrográfica")
 * @param {Object} props.analyse.q_outorgada - Dados de vazão outorgada
 * @param {Object} props.analyse.q_referencia - Dados de vazão de referência
 * @param {Object} props.analyse.q_outorgavel - Dados de vazão outorgável
 * @param {Object} props.analyse.q_individual - Dados de vazão individual
 * @param {Object} props.analyse.q_disponivel - Dados de vazão disponível
 * @param {Object} props.analyse.q_sol_q_dis - Comparação vazão solicitada vs disponível
 * @param {Object} props.analyse.q_sol_q_ind - Comparação vazão solicitada vs individual
 * @param {Function} props.setSurfaceAnalyse - Função para atualizar o estado da análise superficial
 *
 * @returns {JSX.Element} Tabela renderizada com dados de vazão e campos editáveis
 *
 * @example
 * // Exemplo de uso básico
 * <SurfaceTable
 *   q_solicitada={{
 *     values: [10.5, 12.3, 15.0, 18.2, 20.1, 22.5, 25.0, 23.8, 21.2, 18.5, 15.3, 12.0]
 *   }}
 *   analyse={{
 *     alias: "Análise na Seção de Captação",
 *     q_outorgada: { alias: "Q Outorgada", values: [...] },
 *     q_referencia: { alias: "Q Referência", values: [...] },
 *     // ... outros dados da análise
 *   }}
 *   setSurfaceAnalyse={setAnalyseState}
 * />
 *
 * @since 1.0.0
 * @author Equipe de Desenvolvimento
 */
export default function SurfaceTable({
  q_solicitada,
  analyse,
  setSurfaceAnalyse,
}) {
  /**
   * Array com os nomes abreviados dos meses do ano.
   * @type {Array<string>}
   * @constant
   */
  const months = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  /**
   * Estado para armazenar as linhas da tabela baseadas no tipo de análise.
   * @type {Array<Object>}
   */
  const [rows, setRows] = useState([]);

  /**
   * Estado local para armazenar valores temporários dos campos de entrada.
   * Permite que o usuário digite vírgulas sem quebrar a validação.
   * @type {Object<number, string>}
   */
  const [inputValues, setInputValues] = useState({});

  /**
   * Effect hook que constrói as linhas da tabela baseado no tipo de análise.
   * Reorganiza os dados conforme a análise seja "Seção de Captação" ou "Unidade Hidrográfica".
   *
   * @effect
   * @dependency {Object} analyse - Dados da análise
   * @dependency {Object} q_solicitada - Valores de vazão solicitada
   */
  useEffect(() => {
    if (analyse.alias === "Análise na Seção de Captação") {
      let _rows = [
        {
          alias: "QSOLICITADA-SEÇÃO",
          values: q_solicitada.values,
        },
        {
          alias: analyse.q_outorgada.alias,
          values: analyse.q_outorgada.values,
        },
        {
          alias: analyse.q_referencia.alias,
          values: analyse.q_referencia.values,
        },
        {
          alias: analyse.q_outorgavel.alias,
          values: analyse.q_outorgavel.values,
        },
        {
          alias: analyse.q_individual.alias,
          values: analyse.q_individual.values,
          decimais: [
            {
              alias: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)",
              decimal: 0.2,
            },
            {
              alias: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (70% QOUTORGÁVEL-SEÇÃO)",
              decimal: 0.7,
            },
            {
              alias: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (80% QOUTORGÁVEL-SEÇÃO)",
              decimal: 0.8,
            },
            {
              alias: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (90% QOUTORGÁVEL-SEÇÃO)",
              decimal: 0.9,
            },
          ],
        },
        {
          alias: analyse.q_disponivel.alias,
          values: analyse.q_disponivel.values,
        },
        {
          alias: analyse.q_sol_q_dis.alias,
          values: analyse.q_sol_q_dis.values,
        },
        {
          alias: analyse.q_sol_q_ind.alias,
          values: analyse.q_sol_q_ind.values,
        },
      ];

      setRows(_rows);
    } else if (analyse.alias === "Análise na Unidade Hidrográfica") {
      let _rows = [
        {
          alias: analyse.q_outorgada.alias,
          values: analyse.q_outorgada.values,
        },
        {
          alias: analyse.q_referencia.alias,
          values: analyse.q_referencia.values,
        },
        {
          alias: analyse.q_remanescente.alias,
          values: analyse.q_remanescente.values,
        },
        {
          alias: analyse.q_outorgavel.alias,
          values: analyse.q_outorgavel.values,
        },
        {
          alias: analyse.q_disponivel.alias,
          values: analyse.q_disponivel.values,
        },
        {
          alias: analyse.q_sol_q_dis.alias,
          values: analyse.q_sol_q_dis.values,
        },
        {
          alias: analyse.q_disponibilidade.alias,
          values: analyse.q_disponibilidade.values,
        },
        {
          alias: analyse.q_demanda_ajustada.alias,
          values: analyse.q_demanda_ajustada.values,
        },
      ];

      setRows(_rows);
    }
  }, [analyse, q_solicitada]);

  /**
   * Manipula mudanças nos campos de texto de vazão solicitada.
   * Converte vírgulas para pontos, valida entrada numérica e
   * recalcula automaticamente todos os valores dependentes.
   *
   * @function
   * @param {number} index - Índice do mês (0-11) que está sendo editado
   * @param {string|number} value - Valor inserido pelo usuário
   *
   * @description
   * Funcionalidades implementadas:
   * - Conversão de vírgula decimal para ponto (formato brasileiro para internacional)
   * - Suporte a números com separadores de milhar (ex: 1.234,56)
   * - Validação de entrada numérica
   * - Recálculo automático de vazões dependentes
   * - Atualização do estado global da análise
   *
   * @example
   * // Exemplos de conversão de entrada:
   * handleOnTextFieldChange(0, "12,5");     // Converte para 12.5
   * handleOnTextFieldChange(1, "1.234,56"); // Converte para 1234.56
   * handleOnTextFieldChange(2, "15.75");    // Mantém 15.75
   */
  const handleOnTextFieldChange = (index, value) => {
    // Trata o valor para aceitar vírgula ou ponto como separador decimal
    if (typeof value === "string") {
      // Se contém vírgula e ponto (ex: 1.234,56), remove pontos (milhar) e troca vírgula por ponto
      if (value.includes(",") && value.includes(".")) {
        value = value.replace(/\./g, "").replace(",", ".");
      }
      // Se contém só vírgula (ex: 12,5), troca por ponto
      else if (value.includes(",")) {
        value = value.replace(",", ".");
      }
    }

    const number = Number(value);

    // Só atualiza se for um número válido
    if (!isNaN(number)) {
      let updateQSolicitada = [...q_solicitada.values];
      updateQSolicitada[index] = number;

      // Vazão solicitada menor que a disponível
      let q_sol_q_dis_secao = calculateQSolicitadaMenorQDisponivel(
        updateQSolicitada,
        analyse.q_disponivel.values,
      );
      // Vazão solicitada menor que a individual
      let q_sol_q_ind_secao = calculateQSolicitadaMenorQIndividual(
        updateQSolicitada,
        analyse.q_individual.values,
      );

      setSurfaceAnalyse((prev) => {
        let q_disponivel_uh = { ...prev.uh.q_disponivel };
        let q_sol_q_dis_uh = { ...prev.uh.q_sol_q_dis };
        let q_disponivel_secao = { ...prev.secao.q_disponivel };
        let q_outorgavel = { ...prev.secao.q_outorgavel };
        let q_individual_secao = {
          ...prev.secao.q_individual,
          values: calculateQIndividualSecao(q_outorgavel.values, 0.2),
        };

        let q_sol_q_dis = calculateSolicitataMenorDisponivel(
          q_solicitada.values,
          q_disponivel_uh.values,
        );
        let q_disponibilidade = calculateDisponibilidadeHidrica(
          q_sol_q_dis_uh.values,
          q_sol_q_ind_secao,
          q_sol_q_dis_secao,
        );
        let q_demanda_ajustada = calculateDemandaAjustada(
          updateQSolicitada,
          q_disponivel_uh.values,
          q_disponivel_secao.values,
          q_individual_secao.values,
        );

        return {
          ...prev,
          q_solicitada: {
            ...prev.q_solicitada,
            values: updateQSolicitada,
          },
          secao: {
            ...prev.secao,
            q_sol_q_dis: {
              ...prev.secao.q_sol_q_dis,
              values: q_sol_q_dis_secao,
            },
            q_sol_q_ind: {
              ...prev.secao.q_sol_q_ind,
              values: q_sol_q_ind_secao,
            },
          },
          uh: {
            ...prev.uh,
            q_sol_q_dis: {
              ...prev.uh.q_sol_q_dis,
              values: q_sol_q_dis,
            },
            q_disponibilidade: {
              ...prev.uh.q_disponibilidade,
              values: q_disponibilidade,
            },
            q_demanda_ajustada: {
              ...prev.uh.q_demanda_ajustada,
              values: q_demanda_ajustada,
            },
          },
        };
      });
    }
  };

  /**
   * Renderiza as células de dados para cada linha da tabela.
   * Aplica diferentes tipos de renderização baseado no tipo de dados da linha.
   *
   * @function
   * @param {Object} row - Objeto da linha contendo alias e values
   * @param {string} row.alias - Nome/identificador da linha
   * @param {Array<number|boolean>} row.values - Array com 12 valores mensais
   *
   * @returns {Array<JSX.Element>} Array de elementos TableCell renderizados
   *
   * @description
   * Tipos de renderização suportados:
   * 1. **Campos Editáveis**: Para "QSOLICITADA-SEÇÃO" - campos de texto com validação numérica
   * 2. **Indicadores Booleanos**: Para comparações - células verdes (SIM) ou vermelhas (NÃO)
   * 3. **Valores Numéricos**: Para demais dados - números formatados com 2 casas decimais
   *
   * Validações implementadas nos campos editáveis:
   * - Aceita apenas números, vírgulas e pontos
   * - Remove letras e caracteres especiais automaticamente
   * - Controla múltiplas vírgulas/pontos
   * - Suporte a entrada no formato brasileiro (12,5) e internacional (12.5)
   * - Bloqueio de teclas inválidas via onKeyDown
   *
   * @example
   * // Para linha editável:
   * const editableRow = {
   *   alias: "QSOLICITADA-SEÇÃO",
   *   values: [10.5, 12.3, 15.0, ...]
   * };
   *
   * // Para linha de comparação:
   * const comparisonRow = {
   *   alias: "QSOLICITADA-SEÇÃO ≤ QDISPONÍVEL-SEÇÃO",
   *   values: [true, false, true, ...]
   * };
   *
   * // Para linha numérica:
   * const numericRow = {
   *   alias: "Q OUTORGÁVEL",
   *   values: [25.67, 30.12, 28.45, ...]
   * };
   */
  const renderCells = (row) => {
    if (row.alias === "QSOLICITADA-SEÇÃO") {
      return row.values.map((value, index) => (
        <TableCell
          key={row.alias.substring(0, 5) + index}
          align="right"
          sx={{
            padding: "0px",
            px: "5px",
            fontSize: "12px",
            lineHeight: "1.1rem",
            textAlign: "center",
          }}
        >
          <TextField
            key={"input-" + row.alias.substring(0, 5) + index}
            value={
              inputValues[index] !== undefined
                ? inputValues[index]
                : q_solicitada.values[index]
            }
            onChange={(e) => {
              let inputValue = e.target.value;

              // Remove letras e caracteres especiais, mantém apenas números, vírgula e ponto
              inputValue = inputValue.replace(/[^0-9.,]/g, "");

              // Permite apenas uma vírgula ou um ponto
              const commaCount = (inputValue.match(/,/g) || []).length;
              const dotCount = (inputValue.match(/\./g) || []).length;

              // Se há mais de uma vírgula, remove as extras
              if (commaCount > 1) {
                const firstCommaIndex = inputValue.indexOf(",");
                inputValue =
                  inputValue.slice(0, firstCommaIndex + 1) +
                  inputValue.slice(firstCommaIndex + 1).replace(/,/g, "");
              }

              // Se há apenas pontos múltiplos (sem vírgula), mantém apenas o último
              if (dotCount > 1 && commaCount === 0) {
                const lastDotIndex = inputValue.lastIndexOf(".");
                inputValue =
                  inputValue.replace(/\./g, "").slice(0, lastDotIndex) +
                  "." +
                  inputValue.slice(lastDotIndex + 1);
              }

              // Atualiza o estado local (permite vírgula temporariamente)
              setInputValues((prev) => ({
                ...prev,
                [index]: inputValue,
              }));

              // Converte e atualiza o estado principal
              handleOnTextFieldChange(index, inputValue);
            }}
            onKeyDown={(e) => {
              // Lista de teclas permitidas
              const allowedKeys = [
                "Backspace",
                "Delete",
                "Tab",
                "Escape",
                "Enter",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
              ];

              // Permite teclas de controle
              if (allowedKeys.includes(e.key)) {
                return;
              }

              // Permite números, vírgula e ponto
              if (!/^[0-9.,]$/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onBlur={() => {
              // Limpa o estado local quando sai do campo
              setInputValues((prev) => {
                const newState = { ...prev };
                delete newState[index];
                return newState;
              });
            }}
            variant="standard"
            InputProps={{
              disableUnderline: false,
              sx: {
                padding: 0,
                fontSize: "12px",
                textAlign: "center",
                input: {
                  textAlign: "center",
                },
              },
            }}
            sx={{
              p: 0,
              m: 0,
              minWidth: 0,
            }}
          />
        </TableCell>
      ));
    } else if (
      [
        "QSOLICITADA-SEÇÃO ≤ QDISPONÍVEL-SEÇÃO",
        "QSOLICITADA-SEÇÃO ≤ QOUTORGÁVEL-INDIVIDUAL-SEÇÃO",
        "Há disponibilidade hídrica para o usuário?",
        "QSOLICITADA-SEÇÃO ≤ QDISPONÍVEL-UH",
      ].includes(row.alias)
    ) {
      return row.values.map((value, index) =>
        value === true ? (
          <TableCell
            key={row.alias.substring(0, 5) + index}
            align="right"
            sx={{
              backgroundColor: "green",
              padding: "0px",
              px: "5px",
              fontSize: "12px",
              lineHeight: "1.1rem",
              textAlign: "center",
            }}
          >
            SIM
          </TableCell>
        ) : (
          <TableCell
            key={row.alias.substring(0, 5) + index}
            align="right"
            sx={{
              backgroundColor: "red",
              padding: "0px",
              px: "5px",
              fontSize: "12px",
              lineHeight: "1.1rem",
              textAlign: "center",
            }}
          >
            NÃO
          </TableCell>
        ),
      );
    } else {
      return row.values.map((value, index) => (
        <TableCell
          key={row.alias.substring(0, 5) + index}
          align="right"
          sx={{
            padding: "0px",
            px: "5px",
            fontSize: "12px",
            lineHeight: "1.1rem",
            textAlign: "center",
          }}
        >
          {parseFloat(value).toFixed(2)}
        </TableCell>
      ));
    }
  };

  return (
    <Paper
      id="paper"
      elevation={3}
      sx={{ my: 2, height: 190, overflow: "auto" }}
    >
      <Table id="table" size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                padding: "0px",
                px: "5px",
                fontSize: "12px",
                width: "60rem",
                lineHeight: "1.1rem",
                textAlign: "center",
              }}
            >
              Quadro de Vazões (L/s)
            </TableCell>
            {months.map((value) => (
              <TableCell
                key={value}
                align="right"
                sx={{ lineHeight: "1.1rem" }}
              >
                {value}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={"selection-" + row.alias + index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {row.alias ===
              "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)" ? (
                <IndividualFlowSelection
                  key={"selection-input" + row.alias.substring(0, 5) + index}
                  setSurfaceAnalyse={setSurfaceAnalyse}
                />
              ) : (
                <TableCell
                  key={row.alias.substring(0, 5) + index}
                  component="th"
                  scope="row"
                  sx={{
                    padding: "0px",
                    px: "5px",
                    fontSize: "12px",
                    lineHeight: "1.1rem",
                    width: "100px",
                    textAlign: "center",
                  }}
                >
                  {row.alias}
                </TableCell>
              )}

              {renderCells(row)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}