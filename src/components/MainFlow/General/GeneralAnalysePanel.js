import React, { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AnalyseFlow from "./TableFlow";
import CoordPaper from "../../Commom/CoordPaper";
import WellTypePaper from "./WellTypePaper";
import ChartPaper from "./ChartPaper";
import SearchPaper from "./SearchPaper";
import MapControllers from "../../Commom/map/MapControllers";
import { ElemPolarAreaChart } from "../../Commom/chart-js/elem-polar-area-chart";
import { AnalyseContext } from "../Analyse";



export default function GeneralAnalysePanel() {

    

    return (
        <Box sx={{ width: "100%" }}>
            <CoordPaper value={0} />
            <SearchPaper value={0} />
            <ElemPolarAreaChart />
        </Box>
    );
}