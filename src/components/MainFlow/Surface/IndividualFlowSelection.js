import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { calculateDemandaAjustada, calculateDisponibilidadeHidrica, calculateQIndividualSecao, calculateQOutorgadaSecao, calculateQReferenciaSecao, calculateQSolicitadaMenorQDisponivel, calculateQSolicitadaMenorQIndividual, calculateSolicitataMenorDisponivel } from '../../../tools/surface-tools';
import { TableCell } from "@mui/material";



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

/**
 * Componente React para seleção da porcentagem de vazão outorgável individual por seção.
 *
 * Este componente permite ao usuário escolher uma fração da vazão outorgável da seção (ex: 20%)
 * e recalcula diversos indicadores hidrológicos com base na seleção, incluindo:
 * - Vazão individual da seção (`q_individual`)
 * - Comparação entre vazão solicitada e disponível/individual
 * - Ajustes de demanda (`q_demanda_ajustada`)
 * - Disponibilidade hídrica (`q_disponibilidade`)
 *
 * As mudanças impactam diretamente a análise da superfície (`setSurfaceAnalyse`) usada no sistema.
 *
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.setSurfaceAnalyse - Função que atualiza os dados da análise de superfície conforme a seleção.
 *
 * @returns {JSX.Element} Elemento JSX que renderiza um campo de seleção com opções de porcentagem de vazão.
 */
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

            let secao = { ...prev.secao }
            let uh = { ...prev.uh }

            let q_solicitada = { ...prev.q_solicitada }
            let q_disponviel_secao = { ...secao.q_disponivel }
            let q_outorgavel = { ...secao.q_outorgavel }
            let q_disponivel_uh = { ...uh.q_disponivel };
            let q_sol_q_dis_uh = { ...uh.q_sol_q_dis }
            let q_disponivel_secao = { ...secao.q_disponivel };
            let q_individual_secao = {
                ...secao.q_individual,
                values: calculateQIndividualSecao(q_outorgavel.values, selected.value)
            };

            // Vazão solicitada menor que a disponível
            let q_sol_q_dis_secao = calculateQSolicitadaMenorQDisponivel(q_solicitada.values, q_disponviel_secao.values)
            // Vazão solicitada menor que a individual
            let q_sol_q_ind_secao = calculateQSolicitadaMenorQIndividual(q_solicitada.values, q_individual_secao.values)

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
                    ...uh,

                    q_sol_q_dis: {
                        ...uh.q_sol_q_dis,
                        values: q_sol_q_dis

                    },
                    q_disponibilidade: {
                        ...uh.q_disponibilidade,
                        values: q_disponibilidade
                    },
                    q_demanda_ajustada: {
                        ...uh.q_demanda_ajustada,
                        values: q_demanda_ajustada
                    }

                }
            }

        });

    }, [selected])



    return (
        <TableCell sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", width: "100px" }}>
            <FormControl fullWidth>
                <Select
                    id="select-percentage"
                    name={selected.name}
                    value={selected.value}
                    onChange={handleChange}
                    sx={{ height: 20, fontSize: 12 }}
                >
                    {options.map((option) => (
                        <MenuItem key={'menu-' + option.value} value={option.value} sx={{ fontSize: 12 }}>
                            {option.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </TableCell>
    );
}
