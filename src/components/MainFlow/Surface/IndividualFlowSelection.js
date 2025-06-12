import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { calculateDemandaAjustada, calculateDisponibilidadeHidrica, calculateQIndividualSecao, calculateQOutorgadaSecao, calculateQSolicitadaMenorQDisponivel, calculateQSolicitadaMenorQIndividual, calculateSolicitataMenorDisponivel } from '../../../tools/surface-tools';


let options = [
    {
        name: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)",
        value: 0.2,
    },
    {
        name: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (70% QOUTORGÁVEL-SEÇÃO)",
        value: 0.7,
    },
    {
        name: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (80% QOUTORGÁVEL-SEÇÃO)",
        value: 0.8,
    },
    {
        name: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (90% QOUTORGÁVEL-SEÇÃO)",
        value: 0.9,
    },
];

export default function IndividualFlowSelection({ setSurfaceAnalyse }) {

    const [selected, setselected] = React.useState({
        name: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)",
        value: 0.2,
    });

    const handleChange = (event) => {
        let { name, value } = event.target;
        setselected({ name: name, value: value });

    };

    useEffect(() => {

        setSurfaceAnalyse((prev) => {

            let outorgas_secao =   {...prev.secao.outorgas}

            let q_outorgada_secao = {
                ...prev.q_outogada, 
                values: calculateQOutorgadaSecao(outorgas_secao)
            }

            let q_referencia_secao = {

            }

            let q_outorgavel_secao = {

            }
            let q_individual_secao = {

            }

            let q_disponivel_secao = {

            }
            let q_sol_q_dis_secao = {

            }

            let q_sol_q_ind_secao = {

            }


            let q_solicitada = { ...prev.q_solicitada }
            let q_disponviel_secao = { ...prev.secao.q_disponivel }
            let q_outorgavel = { ...prev.secao.q_outorgavel }
            let q_individual_secao = {
                ...prev.secao.q_individual,
                values: calculateQIndividualSecao(q_outorgavel.values, selected.value)
            };


            // Vazão solicitada menor que a disponível
            let q_sol_q_dis_secao = calculateQSolicitadaMenorQDisponivel(q_solicitada.values, q_disponviel_secao.values)
            // Vazão solicitada menor que a individual
            let q_sol_q_ind_secao = calculateQSolicitadaMenorQIndividual(q_solicitada.values, q_individual_secao.values)


            let q_disponivel_uh = { ...prev.uh.q_disponivel };
            let q_sol_q_dis_uh = { ...prev.uh.q_sol_q_dis }
            let q_disponivel_secao = { ...prev.secao.q_disponivel };



            let q_sol_q_dis = calculateSolicitataMenorDisponivel(q_solicitada.values, q_disponivel_uh.values);
            let q_disponibilidade = calculateDisponibilidadeHidrica(q_sol_q_dis_uh.values, q_sol_q_ind_secao, q_sol_q_dis_secao)
            let q_demanda_ajustada = calculateDemandaAjustada(q_solicitada.values, q_disponivel_uh.values, q_disponivel_secao.values, q_individual_secao.values)


            return {
                ...prev,

                secao: {
                    ...prev.secao,

                    q_sol_q_dis: {
                        ...prev.secao.q_sol_q_dis,
                        values: q_sol_q_dis_secao
                    },
                    q_sol_q_ind: {
                        ...prev.secao.q_sol_q_ind,
                        values: q_sol_q_ind_secao
                    },
                    q_individual: q_individual_secao

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

    }, [selected])



    return (
        <Box>
            <FormControl fullWidth>

                <Select
                    id="demo-simple-select"
                    name={selected.name}
                    value={selected.value}
                    onChange={handleChange}
                    sx={{ height: 20, fontSize: 12 }}
                >
                    {options.map((option) => (
                        <MenuItem key={'menu' + option.value} value={option.value} sx={{ fontSize: 12 }}>
                            {option.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
