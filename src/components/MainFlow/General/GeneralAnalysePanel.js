import React from "react";
import Box from "@mui/material/Box";
import SearchCoords from "../../Commom/SearchCoords";
import SearchPaper from "./SearchPaper";
import ElemGrantsChart from "../../Commom/General/ElemGrantsChart";

/**
 * Renderiza painel geral de análise de dados.
 * @component
 * @requires SearchCoords
 * @requires SearchPaper
 * @requires ElemGrantsChart
 */
function GeneralAnalysePanel() {

    return (
        <Box sx={{ width: "100%" }}>
            <SearchCoords value={0} />
            <SearchPaper value={0} />
            <ElemGrantsChart />
        </Box>
    );
}
export default GeneralAnalysePanel;