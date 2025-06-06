import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';



function formatValue(value) {
  if (value === true) {
    return "SIM";
  } else if (value === false) {
    return "NÃO";
  } else if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    return value;
  } else {
    return "";
  }
}
/**
 * 
 * @returns Tabela de Dados Superificial
 */
export default function SurfaceTable({ analyse }) {

  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  const [rows, setRows] = useState([]);

  useEffect(() => {

    if (analyse.alias === 'Análise na Seção de Captação') {
      let _rows = [
        {
          alias: "QSOLICITADA-SEÇÃO",
          values: [
            50,
            50,
            50,
            50,
            50,
            50,
            50,
            50,
            50,
            50,
            50,
            50
          ]
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

    } else if (analyse.alias === 'Análise na Unidade Hidrográfica') {

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
  }, [analyse]);

  return (
    <Paper id="paper" elevation={3} sx={{ my: 2, height: 190, overflow: 'auto' }}>

      {console.log(rows)}

      <Table id="table" size="small" >
        <TableHead>
          <TableRow>
            <TableCell sx={{ padding: "0px", px: "5px", fontSize: "12px", width: "60rem", lineHeight: "1.1rem" }}>Quadro de Vazões (L/s)</TableCell>
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
              <TableCell component="th" scope="row" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", width: "100px" }}>
                {row.alias}
              </TableCell >

              {
                row.alias !== "QSOLICITADA-SEÇÃO" ?
                  row.values.map((value, index) =>
                    (<TableCell key={row.alias.substring(0, 5) + index} align="right" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem" }}>{formatValue(value)}</TableCell>)
                  ) :
                  row.values.map((value, index) =>
                  (<TableCell key={row.alias.substring(0, 5) + index} align="right" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem" }}>
                    <TextField
                      key={'input' + row.alias.substring(0, 5) + index}
                      value={formatValue(value)}
                      variant="standard" // optional: to reduce default padding
                      InputProps={{
                        disableUnderline: false, // optional: removes underline if variant is standard
                        sx: {
                          padding: 0,           // removes internal padding
                          fontSize: '12px',     // optional: set desired font size
                          textAlign: 'center',       // centers text in input
                          input: {
                            textAlign: 'center',     // ensure inner <input> is centered
                          },

                        },
                      }}
                      sx={{
                        p: 0, // outer TextField padding
                        m: 0, // remove margin if any
                        minWidth: 0,

                      }}
                    />
                  </TableCell>)
                  )
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
