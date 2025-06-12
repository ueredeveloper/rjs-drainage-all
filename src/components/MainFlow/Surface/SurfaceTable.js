import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useData } from '../../../hooks/analyse-hooks';
import { calculateDemandaAjustada, calculateDisponibilidadeHidrica, calculateQIndividualSecao, calculateQSolicitadaMenorQDisponivel, calculateQSolicitadaMenorQIndividual, calculateSolicitataMenorDisponivel } from '../../../tools/surface-tools';
import IndividualFlowSelection from './IndividualFlowSelection';





/**
 * 
 * @returns Tabela de Dados Superificial
 */
export default function SurfaceTable({ q_solicitada, analyse, setSurfaceAnalyse }) {

  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  const [rows, setRows] = useState([]);


  useEffect(() => {

    if (analyse.alias === 'Análise na Seção de Captação') {

      let _rows = [
        {
          alias: "QSOLICITADA-SEÇÃO",
          values: q_solicitada.values
        },
        {
          alias: analyse.q_outorgada.alias,
          values: analyse.q_outorgada.values
        },
        {
          alias: analyse.q_referencia.alias,
          values: analyse.q_referencia.values

        },
        {
          alias: analyse.q_outorgavel.alias,
          values: analyse.q_outorgavel.values
        },
        {
          alias: analyse.q_individual.alias,
          values: analyse.q_individual.values,
          decimais: [
            {
              "alias": "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)",
              "decimal": 0.2
            },
            {
              "alias": "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (70% QOUTORGÁVEL-SEÇÃO)",
              "decimal": 0.7
            },
            {
              "alias": "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (80% QOUTORGÁVEL-SEÇÃO)",
              "decimal": 0.8
            },
            {
              "alias": "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (90% QOUTORGÁVEL-SEÇÃO)",
              "decimal": 0.9
            }
          ]
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
        }
      ];

      setRows(_rows)

    }
    else if (analyse.alias === 'Análise na Unidade Hidrográfica') {

      let _rows = [

        {
          alias: analyse.q_outorgada.alias,
          values: analyse.q_outorgada.values
        },
        {
          alias: analyse.q_referencia.alias,
          values: analyse.q_referencia.values
        },
        {
          alias: analyse.q_remanescente.alias,
          values: analyse.q_remanescente.values
        },
        {
          alias: analyse.q_outorgavel.alias,
          values: analyse.q_outorgavel.values
        },
        {
          alias: analyse.q_disponivel.alias,
          values: analyse.q_disponivel.values
        },
        {
          alias: analyse.q_sol_q_dis.alias,
          values: analyse.q_sol_q_dis.values
        }
        ,
        {
          alias: analyse.q_disponibilidade.alias,
          values: analyse.q_disponibilidade.values
        }
        ,
        {
          alias: analyse.q_demanda_ajustada.alias,
          values: analyse.q_demanda_ajustada.values
        }

      ]

      setRows(_rows)

    }
  }, [analyse, q_solicitada]);

  const handleOnTextFieldChange = (index, value) => {

    let updateQSolicitada = [...q_solicitada.values]
    updateQSolicitada[index] = Number(value);

    // Vazão solicitada menor que a disponível
    let q_sol_q_dis_secao = calculateQSolicitadaMenorQDisponivel(updateQSolicitada, analyse.q_disponivel.values)
    // Vazão solicitada menor que a individual
    let q_sol_q_ind_secao = calculateQSolicitadaMenorQIndividual(updateQSolicitada, analyse.q_individual.values)

    setSurfaceAnalyse((prev) => {

      let q_disponivel_uh = { ...prev.uh.q_disponivel };
      let q_sol_q_dis_uh = { ...prev.uh.q_sol_q_dis }
      let q_disponivel_secao = { ...prev.secao.q_disponivel };
      let q_outorgavel = {...prev.secao.q_outorgavel}
      let q_individual_secao = {
        ...prev.secao.q_individual,
        values: calculateQIndividualSecao(q_outorgavel.values, 0.2)
      };

      let q_sol_q_dis = calculateSolicitataMenorDisponivel(q_solicitada.values, q_disponivel_uh.values);
      let q_disponibilidade = calculateDisponibilidadeHidrica(q_sol_q_dis_uh.values, q_sol_q_ind_secao, q_sol_q_dis_secao)
      let q_demanda_ajustada = calculateDemandaAjustada(updateQSolicitada, q_disponivel_uh.values, q_disponivel_secao.values, q_individual_secao.values)

      return {
        ...prev,
        q_solicitada: {
          ...prev.q_solicitada,
          values: updateQSolicitada
        },
        secao: {
          ...prev.secao,

          q_sol_q_dis: {
            ...prev.secao.q_sol_q_dis,
            values: q_sol_q_dis_secao
          },
          q_sol_q_ind: {
            ...prev.secao.q_sol_q_ind,
            values: q_sol_q_ind_secao
          }

        },
        uh: {
          ...prev.uh,

          q_sol_q_dis: {
            ...prev.uh.q_sol_q_dis,
            values: q_sol_q_dis

          },
          q_disponibilidade: {
            ...prev.uh.q_disponibilidade,
            values: q_disponibilidade
          },
          q_demanda_ajustada: {
            ...prev.uh.q_demanda_ajustada,
            values: q_demanda_ajustada
          }

        }
      }

    });
  }

  const renderCells = (row) => {
    if (row.alias === "QSOLICITADA-SEÇÃO") {
      return row.values.map((value, index) => (
        <TableCell
          key={row.alias.substring(0, 5) + index}
          align="right"
          sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", textAlign: "center" }}
        >
          <TextField
            key={'input' + row.alias.substring(0, 5) + index}
            value={q_solicitada.values[index]}
            onChange={(e) => handleOnTextFieldChange(index, e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: false,
              sx: {
                padding: 0,
                fontSize: '12px',
                textAlign: 'center',
                input: {
                  textAlign: 'center',
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
        'QSOLICITADA-SEÇÃO ≤ QDISPONÍVEL-SEÇÃO',
        'QSOLICITADA-SEÇÃO ≤ QOUTORGÁVEL-INDIVIDUAL-SEÇÃO',
        'Há disponibilidade hídrica para o usuário?',
        'QSOLICITADA-SEÇÃO ≤ QDISPONÍVEL-UH',
      ].includes(row.alias)
    ) {
      return row.values.map((value, index) => (
        value === true ?
          <TableCell

            key={row.alias.substring(0, 5) + index}
            align="right"
            sx={{ backgroundColor: 'green', padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", textAlign: "center" }}
          >
            SIM
          </TableCell> :
          <TableCell
            key={row.alias.substring(0, 5) + index}
            align="right"
            sx={{ backgroundColor: 'red', padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", textAlign: "center" }}
          >
            NÃO
          </TableCell>
      ));
    }
    else {
      return row.values.map((value, index) => (
        <TableCell
          key={row.alias.substring(0, 5) + index}
          align="right"
          sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", textAlign: "center" }}
        >
          {parseFloat(value).toFixed(2)}
        </TableCell>
      ));
    }
  };


  return (
    <Paper id="paper" elevation={3} sx={{ my: 2, height: 190, overflow: 'auto' }}>
      <Table id="table" size="small" >
        <TableHead>
          <TableRow>
            <TableCell sx={{ padding: "0px", px: "5px", fontSize: "12px", width: "60rem", lineHeight: "1.1rem", textAlign: "center" }}>Quadro de Vazões (L/s)</TableCell>
            {months.map((value) => (
              <TableCell key={value} align="right" sx={{ lineHeight: "1.1rem" }}>{value}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.alias + index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {row.alias === 'QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)' ?
                (<IndividualFlowSelection key={row.alias.substring(0, 5) + index} setSurfaceAnalyse={setSurfaceAnalyse}/>)
                :
                (<TableCell  key={row.alias.substring(0, 5) + index} component="th" scope="row" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", width: "100px", textAlign: "center" }}>
                  {row.alias}
                </TableCell >)}

              {
                renderCells(row)
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}



