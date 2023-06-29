import React, { useState, createContext, useEffect } from "react";
import { Box } from "@mui/material";
import TabPanel from "./AnalysePanel";
import MapPanel from "./MapPanel";
import AnalysePanel from "./AnalysePanel";
import GrantsPanel from "./GrantsPanel";
import { initialState } from "../../initial-state";


export const SystemContext = createContext({});

export default function Analyse() {

    const [marker, setMarker] = useState(initialState.marker);
    const [system, setSystem] = useState(initialState.system);
    const [overlays, setOverlays] = useState(initialState.overlays);
    
    return (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <Box sx={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", flex: 1, minWidth: 200 }} >
                    <SystemContext.Provider value={[marker, setMarker, system, setSystem, overlays, setOverlays]}>
                        <MapPanel />
                    </SystemContext.Provider>

                </Box>
                <Box sx={{ display: "flex", flex: 1, minWidth: 200 }}>
                    <AnalysePanel />
                </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
                <SystemContext.Provider value={[system, setSystem, overlays, setOverlays]}>
                    <GrantsPanel />
                </SystemContext.Provider>
            </Box>
        </Box>
    )
}