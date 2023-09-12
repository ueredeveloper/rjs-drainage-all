import React from "react";
import Box from "@mui/material/Box";
import CoordPaper from "../../Commom/CoordPaper";
import SearchPaper from "./SearchPaper";
import ElemGrantsChart from "../../Commom/e-chart.js/ElemGrantsChart";

export default function GeneralAnalysePanel() {

    return (
        <Box sx={{ width: "100%" }}>
            <CoordPaper value={0} />
            <SearchPaper value={0} />
            <ElemGrantsChart />
        </Box>
    );
}