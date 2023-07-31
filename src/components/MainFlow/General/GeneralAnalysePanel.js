import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AnalyseFlow from "./TableFlow";
import CoordPaper from "./CoordPaper";
import WellTypePaper from "./WellTypePaper";
import ChartPaper from "./ChartPaper";



export default function GeneralAnalysePanel() {


    return (
        <Box sx={{ width: "100%" }}>
            <CoordPaper />
            <WellTypePaper />
            <AnalyseFlow />
            <ChartPaper />
        </Box>
    );
}