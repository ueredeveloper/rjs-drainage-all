import React from "react";
import Box from "@mui/material/Box";
import CoordPaper from "../../Commom/CoordPaper";
import SearchPaper from "./SearchPaper";
import ElemGrantsChart from "../../Commom/e-chart.js/ElemGrantsChart";

/**
 * Renderiza painel geral de análise de dados.
 * @component
 * @requires CoordPaper
 * @requires SearchPaper
 * @requires ElemGrantsChart
 */
function GeneralAnalysePanel() {

    return (
        <Box sx={{ width: "100%" }}>
            <CoordPaper value={0} />
            <SearchPaper value={0} />
            <ElemGrantsChart />
        </Box>
    );
}
export default GeneralAnalysePanel;