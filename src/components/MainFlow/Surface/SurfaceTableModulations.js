import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';




/**
 * 
 * @returns Tabela de Dados Superificial
 */
export default function SurfaceTableModulations({ analyse }) {

    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    const [rows, setRows] = useState([]);

    useEffect(() => {

        if (analyse.alias === 'Tabela de ajuste das Horas de Bombeamento') {


            let _rows = [

                {
                    alias: analyse.h_bomb_requerida.alias,
                    values: analyse.h_bomb_requerida.values
                },
                {
                    alias: analyse.q_secao_m_h.alias,
                    values: analyse.q_secao_m_h.values

                },
                {
                    alias: analyse.q_secao_m_d.alias,
                    values: analyse.q_secao_m_d.values
                },
                {
                    alias: analyse.h_bomb_ajustada.alias,
                    values: analyse.h_bomb_ajustada.values
                }
            ];

            setRows(_rows)
        } else if (analyse.alias === 'Tabela final com HORA modulada') {

            let _rows = [

                {
                    alias: analyse.q_outorgada.alias,
                    values: analyse.q_outorgada.values
                },
                {
                    alias: analyse.h_bombeamento.alias,
                    values: analyse.h_bombeamento.values
                }

            ];

            setRows(_rows)

        } else {

            let _rows = [

                {
                    alias: analyse.q_outorgada.alias,
                    values: analyse.q_outorgada.values
                },
                {
                    alias: analyse.h_bombeamento.alias,
                    values: analyse.h_bombeamento.values
                }

            ];



            setRows(_rows)

        }

    }, [analyse]);

    return (
        <Paper id="paper" elevation={3} sx={{ my: 2, height: 121, overflow: 'auto' }}>

            {console.log(rows)}

            <Table id="table" size="small" >
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ padding: "0px", px: "5px", fontSize: "12px", width: "60rem", lineHeight: "1.1rem" }}>{analyse.alias}</TableCell>
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
                            <TableCell component="th" scope="row" sx={{ padding: "1px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", width: "100px" }}>
                                {row.alias}
                            </TableCell >

                            {
                                row.alias !== "Horas de bombeamento (Requerimento)" ?
                                    row.values.map((value, index) =>
                                        (<TableCell key={row.alias.substring(0, 5) + index} align="right" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem" }}>{value}</TableCell>)
                                    ) :
                                    row.values.map((value, index) =>
                                    (<TableCell key={row.alias.substring(0, 5) + index} align="right" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem" }}>
                                        <TextField
                                            key={'input' + row.alias.substring(0, 5) + index}
                                            value={value}
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
