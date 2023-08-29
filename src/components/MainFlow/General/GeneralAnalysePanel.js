import React, { useContext, useEffect } from "react";
import Box from "@mui/material/Box";
import CoordPaper from "../../Commom/CoordPaper";
import SearchPaper from "./SearchPaper";
import NumberOfGrantsChart from "../../Commom/e-chart.js/number-of-grants-chart";


export default function GeneralAnalysePanel() {

    return (
        <Box sx={{ width: "100%" }}>
            <CoordPaper value={0} />
            <SearchPaper value={0} />
            <NumberOfGrantsChart />
        </Box>
    );
}