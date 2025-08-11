/**
 * @file SurfaceTableModulations.js
 * @description Componente React para exibição e edição de tabelas de modulação de horas de bombeamento.
 * Permite ao usuário informar as horas de bombeamento por mês, valida os valores e atualiza os cálculos relacionados.
 * Utiliza Material UI para renderização da tabela e campos de entrada.
 */

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import {
  ajustarHoraBombAjustada,
  ajustarQSecaoMD,
  ajustarSecaoMH,
  modularHoraQ,
  modularVazaoH,
} from "../../../tools/surface-tools";

/**
 * Componente SurfaceTableModulations
 *
 * @param {Object} props
 * @param {Object} props.analyse - Objeto de análise contendo dados e aliases das tabelas.
 * @param {Function} props.setSurfaceAnalyse - Função para atualizar o estado da análise superficial.
 * @returns {JSX.Element} Tabela de modulação de horas de bombeamento.
 */
export default function SurfaceTableModulations({
  analyse,
  setSurfaceAnalyse,
}) {
  /**
   * Meses do ano para exibição nas colunas da tabela.
   * @type {string[]}
   */
  const months = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];

  /**
   * Estado das linhas da tabela.
   * @type {[Object[], Function]}
   */
  const [rows, setRows] = useState([]);

  /**
   * Estado de erros de validação dos campos de entrada.
   * @type {[boolean[], Function]}
   */
  const [inputErrors, setInputErrors] = useState(Array(12).fill(false));

  /**
   * Estado para destacar células alteradas recentemente.
   * @type {[boolean[], Function]}
   */
  const [highlighted, setHighlighted] = useState(Array(12).fill(false));

  /**
   * Efeito para atualizar os cálculos e o estado da análise ao montar o componente,
   * caso o alias seja "Tabela de ajuste das Horas de Bombeamento".
   */
  useEffect(() => {
    if (analyse.alias === "Tabela de ajuste das Horas de Bombeamento") {
      setSurfaceAnalyse((prev) => {
        let uh_q_demanda_ajustada = { ...prev.uh.q_demanda_ajustada };
        let h_ajuste = { ...prev.h_ajuste };
        let q_solicitada = { ...prev.q_solicitada };
        let q_outorgada = { ...prev.q_modula.q_outorgada };

        let q_secao_m_h = ajustarSecaoMH(uh_q_demanda_ajustada);
        let q_secao_m_d = ajustarQSecaoMD(h_ajuste);
        let h_bomb_ajustada = ajustarHoraBombAjustada(
          q_secao_m_d,
          q_solicitada
        );
        let h_bombeamento = modularVazaoH(q_outorgada, h_ajuste);
        let h_modula_q_outorgada = modularHoraQ(
          h_ajuste,
          uh_q_demanda_ajustada,
          q_solicitada
        );

        return {
          ...prev,
          h_ajuste: {
            ...prev.h_ajuste,
            q_secao_m_h: {
              ...prev.h_ajuste.q_secao_m_h,
              values: q_secao_m_h,
            },
            q_secao_m_d: {
              ...prev.h_ajuste.q_secao_m_d,
              values: q_secao_m_d,
            },
            h_bomb_ajustada: {
              ...prev.h_ajuste.h_bomb_ajustada,
              values: h_bomb_ajustada,
            },
          },
          q_modula: {
            ...prev.q_modula,
            q_outorgada: {
              ...prev.q_modula.q_outorgada,
              values: uh_q_demanda_ajustada.values,
            },
            h_bombeamento: {
              ...prev.q_modula.h_bombeamento,
              values: h_bombeamento,
            },
          },
          h_modula: {
            ...prev.h_modula,
            q_outorgada: {
              ...prev.h_modula.q_outorgada,
              values: h_modula_q_outorgada,
            },
            h_bombeamento: {
              ...prev.h_modula.h_bombeamento,
              values: h_ajuste.h_bomb_ajustada.values,
            },
          },
        };
      });
    }
  }, []);

  /**
   * Efeito para atualizar as linhas da tabela conforme o tipo de análise.
   */
  useEffect(() => {
    if (analyse.alias === "Tabela de ajuste das Horas de Bombeamento") {
      let _rows = [
        {
          alias: analyse.h_bomb_requerida.alias,
          values: analyse.h_bomb_requerida.values,
        },
        {
          alias: analyse.q_secao_m_h.alias,
          values: analyse.q_secao_m_h.values,
        },
        {
          alias: analyse.q_secao_m_d.alias,
          values: analyse.q_secao_m_d.values,
        },
        {
          alias: analyse.h_bomb_ajustada.alias,
          values: analyse.h_bomb_ajustada.values,
        },
      ];
      setRows(_rows);
    } else if (analyse.alias === "Tabela final com HORA modulada") {
      let _rows = [
        {
          alias: analyse.q_outorgada.alias,
          values: analyse.q_outorgada.values,
        },
        {
          alias: analyse.h_bombeamento.alias,
          values: analyse.h_bombeamento.values,
        },
      ];
      setRows(_rows);
    } else {
      let _rows = [
        {
          alias: analyse.q_outorgada.alias,
          values: analyse.q_outorgada.values,
        },
        {
          alias: analyse.h_bombeamento.alias,
          values: analyse.h_bombeamento.values,
        },
      ];
      setRows(_rows);
    }
  }, [analyse]);

  /**
   * Manipula a alteração dos campos de horas de bombeamento.
   * Valida o valor (apenas inteiros de 0 a 24), atualiza os cálculos dependentes e destaca a célula alterada.
   *
   * @param {number} index - Índice do mês/coluna alterado.
   * @param {string} value - Valor informado pelo usuário.
   */
  const handleOnTextFieldChange = (index, value) => {
    // Aceita apenas inteiros entre 0 e 24
    let parsedValue = value === "" ? "" : parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(parsedValue)) parsedValue = "";

    let errors = [...inputErrors];
    let highlights = [...highlighted];

    if (parsedValue === "" || (parsedValue >= 0 && parsedValue <= 24)) {
      errors[index] = false;
    } else {
      errors[index] = true;
    }
    setInputErrors(errors);

    if (errors[index]) return;

    let update_h_bomb_requerida = [...analyse.h_bomb_requerida.values];
    update_h_bomb_requerida[index] = parsedValue;

    setSurfaceAnalyse((prev) => {
      const h_bomb_requerida = {
        ...prev.h_ajuste.h_bomb_requerida,
        values: update_h_bomb_requerida,
      };

      const q_solicitada = { ...prev.q_solicitada };
      const q_outorgada = { ...prev.q_modula.q_outorgada };
      const uh_q_demanda_ajustada = { ...prev.uh.q_demanda_ajustada };

      const update_h_ajuste = {
        ...prev.h_ajuste,
        h_bomb_requerida,
      };

      const q_secao_m_h = ajustarSecaoMH(uh_q_demanda_ajustada);
      const q_secao_m_d = ajustarQSecaoMD(update_h_ajuste);
      const h_bomb_ajustada = ajustarHoraBombAjustada(
        q_secao_m_d,
        q_solicitada
      );
      const h_bombeamento = modularVazaoH(q_outorgada, update_h_ajuste);
      const h_modula_q_outorgada = modularHoraQ(
        update_h_ajuste,
        uh_q_demanda_ajustada,
        q_solicitada
      );

      const h_ajuste = {
        ...update_h_ajuste,
        q_secao_m_h: {
          ...prev.h_ajuste.q_secao_m_h,
          values: q_secao_m_h,
        },
        q_secao_m_d: {
          ...prev.h_ajuste.q_secao_m_d,
          values: q_secao_m_d,
        },
        h_bomb_ajustada: {
          ...prev.h_ajuste.h_bomb_ajustada,
          values: h_bomb_ajustada,
        },
      };

      const q_modula = {
        ...prev.q_modula,
        q_outorgada: {
          ...prev.q_modula.q_outorgada,
          values: uh_q_demanda_ajustada.values,
        },
        h_bombeamento: {
          ...prev.q_modula.h_bombeamento,
          values: h_bombeamento,
        },
      };

      const h_modula = {
        ...prev.h_modula,
        q_outorgada: {
          ...prev.h_modula.q_outorgada,
          values: h_modula_q_outorgada,
        },
        h_bombeamento: {
          ...prev.h_modula.h_bombeamento,
          values: h_bomb_ajustada,
        },
      };

      return {
        ...prev,
        h_ajuste,
        q_modula,
        h_modula,
      };
    });

    highlights[index] = true;
    setHighlighted(highlights);
    setTimeout(() => {
      highlights[index] = false;
      setHighlighted([...highlights]);
    }, 800);
  };

  // Renderização da tabela de modulação
  return (
    <Paper
      id="paper"
      elevation={3}
      sx={{ my: 2, height: 120, overflow: "auto" }}
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
              {analyse.alias}
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
          {rows.map((row, rowIndex) => (
            <TableRow
              key={row.alias + rowIndex}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{
                  padding: "1px",
                  px: "5px",
                  fontSize: "12px",
                  lineHeight: "1.1rem",
                  width: "100px",
                  textAlign: "center",
                }}
              >
                {row.alias}
              </TableCell>
              {row.alias !== "Horas de bombeamento (Requerimento)"
                ? row.values.map((value, index) => (
                    <TableCell
                      key={row.alias.substring(0, 5) + index}
                      align="right"
                      sx={{
                        padding: "0px",
                        px: "5px",
                        fontSize: "12px",
                        lineHeight: "1.1rem",
                        textAlign: "center",
                        backgroundColor: highlighted[index] && rowIndex === 0 ? "#e3f2fd" : "inherit",
                      }}
                    >
                      {typeof value === "number" && !isNaN(value)
                        ? value
                        : value}
                    </TableCell>
                  ))
                : row.values.map((value, index) => (
                    <TableCell
                      key={row.alias.substring(0, 5) + index}
                      align="right"
                      sx={{
                        padding: "0px",
                        px: "5px",
                        fontSize: "12px",
                        lineHeight: "1.1rem",
                        textAlign: "center",
                        backgroundColor: highlighted[index] ? "#ffe082" : (inputErrors[index] ? "#ffcdd2" : "inherit"),
                        transition: "background-color 0.5s",
                      }}
                    >
                      <Tooltip title="Informe as horas de bombeamento (0 a 24)">
                        <TextField
                          type="number"
                          inputProps={{
                            min: 0,
                            max: 24,
                            step: 1,
                            pattern: "[0-9]*",
                            maxLength: 2,
                            placeholder: "0-24",
                          }}
                          value={value}
                          variant="standard"
                          error={inputErrors[index]}
                          helperText={inputErrors[index] ? "Valor inválido" : ""}
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
                          onChange={(e) =>
                            handleOnTextFieldChange(index, e.target.value)
                          }
                          autoComplete="off"
                          sx={{
                            p: 0,
                            m: 0,
                            minWidth: 0,
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
