import React, { useContext, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import CoordPaper from "../../Commom/CoordPaper";
import SearchPaper from "./SearchPaper";
import NumberOfGrantsChart from "../../Commom/e-chart.js/Number-Of-Grants-Chart";
import { SelectedShapesProvider } from "../../../context/selected-shapes-provider";
import ChildComponent from "../../Commom/e-chart.js/Number-Of";
import { AnalyseContext } from "../Analyse";
import { useScrollTrigger } from "@mui/material";


const GeneralAnalysePanel = ({ children }) => {
    return (
        <div>
            <div> GeneralAnalysePanel</div>
            {children}
        </div>
    );
};

export default GeneralAnalysePanel;