import React from "react";
import Box from "@mui/material/Box";
import SearchCoords from "../../Commom/SearchCoords";
import SearchPaper from "./SearchPaper";
import NumberOfGrantsChart from "../../Commom/General/NumberOfGrantsChart";



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
            <SearchCoords tabNumber={0} />
            <SearchPaper value={0} />
            <NumberOfGrantsChart />
        </Box>
    );
}
export default GeneralAnalysePanel;