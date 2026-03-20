import React from "react";
import Box from "@mui/material/Box";
import SearchCoords from "../../Commom/SearchCoords";
import BarrageForm from "./BarrageForm";


/**
 * Renderiza painel geral de análise de dados.
 * @component
 * 
 * @requires SearchCoords
 * @requires SearchPaper
 * @requires ElemGrantsChart
 */
function GeneralBarragePanel() {

    return (
        <Box sx={{ width: "100%" }}>
            <SearchCoords tabNumber={3} />
            <BarrageForm />
           
        </Box>
    );
}
export default GeneralBarragePanel;