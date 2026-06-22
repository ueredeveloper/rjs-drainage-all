import React from "react";
import Box from "@mui/material/Box";
import SearchCoords from "../../Commom/SearchCoords";
import BarrageForm from "./BarrageForm";

/**
 * Renderiza painel geral de análise de dados de barragem.
 * @component
 * @requires SearchCoords
 * @requires BarrageForm
 */
function GeneralBarragePanel() {

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <SearchCoords tabNumber={3} />
            {/*
              * Área rolável: flexShrink:0 no wrapper impede que o BarrageForm
              * seja comprimido pelo flex — garante que o conteúdo use sua altura
              * natural e ative o scroll quando necessário no notebook.
              */}
            <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <Box sx={{ flexGrow: 1, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 500 }}>
                    <BarrageForm />
                </Box>
            </Box>
        </Box>
    );
}
export default GeneralBarragePanel;
