import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ajustarHoraBombAjustada, ajustarQSecaoMD, ajustarSecaoMH, modularHoraQ, modularVazaoH } from '../../../tools/surface-tools';




/**
 * 
 * @returns Tabela de Dados Superificial
 */
export default function SurfaceTableModulations({ analyse, setSurfaceAnalyse }) {

    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    const [rows, setRows] = useState([]);

    /** 
     * Renderização inicial, ao selcionar esta tab.
     */
    useEffect(() => {

        if (analyse.alias === 'Tabela de ajuste das Horas de Bombeamento') {

            setSurfaceAnalyse((prev) => {

                let uh_q_demanda_ajustada = { ...prev.uh.q_demanda_ajustada };
                let h_ajuste = { ...prev.h_ajuste }
                let q_solicitada = { ...prev.q_solicitada }
                let q_outorgada = { ...prev.q_modula.q_outorgada }

                let q_secao_m_h = ajustarSecaoMH(uh_q_demanda_ajustada);
                let q_secao_m_d = ajustarQSecaoMD(h_ajuste);
                let h_bomb_ajustada = ajustarHoraBombAjustada(h_ajuste, q_solicitada);

                let h_bombeamento = modularVazaoH(q_outorgada, h_ajuste);

                let h_modula_q_outorgada = modularHoraQ(h_ajuste, uh_q_demanda_ajustada, q_solicitada);

                return {
                    ...prev,
                    h_ajuste: {
                        ...prev.h_ajuste,
                        q_secao_m_h: {
                            ...prev.h_ajuste.q_secao_m_h,
                            values: q_secao_m_h
                        },
                        q_secao_m_d: {
                            ...prev.h_ajuste.q_secao_m_d,
                            values: q_secao_m_d
                        },
                        h_bomb_ajustada: {
                            ...prev.h_ajuste.h_bomb_ajustada,
                            values: h_bomb_ajustada
                        }
                    },
                    q_modula: {
                        ...prev.q_modula,
                        q_outorgada: {
                            ...prev.q_modula.q_outorgada,
                            values: uh_q_demanda_ajustada.values
                        },
                        h_bombeamento: {
                            ...prev.q_modula.h_bombeamento,
                            values: h_bombeamento
                        }

                    },
                    h_modula: {
                        ...prev.h_modula,
                        q_outorgada: {
                            ...prev.h_modula.q_outorgada,
                            values: h_modula_q_outorgada
                        },
                        h_bombeamento: {
                            ...prev.h_modula.h_bombeamento,
                            values: h_ajuste.h_bomb_ajustada.values
                        }

                    }
                }
            });

        }

    }, [])

    /**
     * Renderização ao ser modificada a variável analyse.
     */
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

            setRows(_rows);

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

            setRows(_rows);

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



            setRows(_rows);

        }

    }, [analyse]);


    const handleOnTextFieldChange = (index, value) => {
        // Atualiza valores digitados
        let update_h_bomb_requerida = [...analyse.h_bomb_requerida.values]
        update_h_bomb_requerida[index] = Number(value);

        setSurfaceAnalyse((prev) => {

            let h_ajuste = {
                ...prev.h_ajuste,
                h_bomb_requerida: {
                    ...prev.h_ajuste.h_bomb_requerida,
                    // Atualiza os valores em tempo real na tabela
                    values: update_h_bomb_requerida
                }
            }
            let q_solicitada = { ...prev.q_solicitada }
            let q_outorgada = { ...prev.q_modula.q_outorgada }

            let uh_q_demanda_ajustada = { ...prev.uh.q_demanda_ajustada };
            let q_secao_m_h = ajustarSecaoMH(uh_q_demanda_ajustada);
            let q_secao_m_d = ajustarQSecaoMD(h_ajuste);
            let h_bomb_ajustada = ajustarHoraBombAjustada(h_ajuste, q_solicitada);

            let h_bombeamento = modularVazaoH(q_outorgada, h_ajuste);

            let h_modula_q_outorgada = modularHoraQ(h_ajuste, uh_q_demanda_ajustada, q_solicitada);


            return {
                ...prev,
                h_ajuste: {
                    ...prev.h_ajuste,
                    h_bomb_requerida: {
                        ...prev.h_ajuste.h_bomb_requerida,
                        values: update_h_bomb_requerida
                    },
                    q_secao_m_h: {
                        ...prev.h_ajuste.q_secao_m_h,
                        values: q_secao_m_h
                    },
                    q_secao_m_d: {
                        ...prev.h_ajuste.q_secao_m_d,
                        values: q_secao_m_d
                    },
                    h_bomb_ajustada: {
                        ...prev.h_ajuste.h_bomb_ajustada,
                        values: h_bomb_ajustada
                    }
                },
                q_modula: {
                    ...prev.q_modula,
                    q_outorgada: {
                        ...prev.q_modula.q_outorgada,
                        values: uh_q_demanda_ajustada.values
                    },
                    h_bombeamento: {
                        ...prev.q_modula.h_bombeamento,
                        values: h_bombeamento
                    }

                },
                h_modula: {
                    ...prev.h_modula,
                    q_outorgada: {
                        ...prev.h_modula.q_outorgada,
                        values: h_modula_q_outorgada
                    },
                    h_bombeamento: {
                        ...prev.h_modula.h_bombeamento,
                        values: h_ajuste.h_bomb_ajustada.values
                    }

                }
            }
        });

    }

    return (
        <Paper id="paper" elevation={3} sx={{ my: 2, height: 121, overflow: 'auto' }}>
            <Table id="table" size="small" >
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ padding: "0px", px: "5px", fontSize: "12px", width: "60rem", lineHeight: "1.1rem", textAlign: "center" }}>{analyse.alias}</TableCell>
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
                            <TableCell component="th" scope="row" sx={{ padding: "1px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", width: "100px", textAlign: "center" }}>
                                {row.alias}
                            </TableCell >

                            {
                                row.alias !== "Horas de bombeamento (Requerimento)" ?
                                    row.values.map((value, index) =>
                                        (<TableCell key={row.alias.substring(0, 5) + index} align="right" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", textAlign: "center" }}>{value}</TableCell>)
                                    ) :
                                    row.values.map((value, index) =>
                                    (<TableCell key={row.alias.substring(0, 5) + index} align="right" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", textAlign: "center" }}>
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
                                            onChange={(e) => handleOnTextFieldChange(index, e.target.value)}
                                            autoComplete="off"
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
