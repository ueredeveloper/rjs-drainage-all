import React, { useState } from "react";
import { Slider } from "@mui/material";
import { useData } from "../../hooks/analyse-hooks";

/**
 
 * Componente para ajustar o raio de pesquisa em metros.
 * @component
 * @returns {JSX.Element} O elemento React que representa o componente.
 */
function RadiusSelector() {

    // Obtém o estado do raio e a função para definir o raio do contexto compartilhado
    const { radius, setRadius } = useData();

    /**
     * Manipula a mudança no valor do Slider.
     * @param {Object} event - O evento de mudança.
     */
    function handleChange(event) {
        setRadius(event.target.value)
    }

    /**
     * Formata o valor do Slider para exibir em metros.
     * @param {number} value - O valor do Slider.
     * @returns {string} O valor formatado com a unidade "metros".
     */
    function valueLabelFormat(value) {
        return `${value} metros`;
    }

    return (
        <Slider sx={{ minWidth: 100, py: 3, mx: 2 }}
            size="small"
            getAriaValueText={valueLabelFormat}
            valueLabelFormat={valueLabelFormat}
            valueLabelDisplay="on"
            step={100}
            min={100}
            max={2000}
            value={radius}
            onChange={handleChange}
        />
    );
}

export default RadiusSelector;
