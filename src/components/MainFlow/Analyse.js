import React, { useState, createContext, useEffect } from "react";

import MapPanel from "./General/MapPanel";
import GrantsPanel from "./General/GrantsPanel";
import { initialState } from "../../initial-state";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import GeneralAnalysePanel from "./General/GeneralAnalysePanel";
import SubterraneanAnalysePanel from "./Subterranean/SubterraneanAnalysePanel";
import SurfaceAnalysePanel from "./Surface/SurfaceAnalysePanel";


export const SystemContext = createContext({});

export default function Analyse() {

    const [marker, setMarker] = useState(initialState.marker);
    const [system, setSystem] = useState(initialState.system);
    const [overlays, setOverlays] = useState(initialState.overlays);

    useEffect(() => {
       // console.log(marker.position)
       console.log('analyse overlays', overlays)
    }, [overlays])

    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 2 }}>
                        <Box>{children}</Box>
                    </Box>
                )}
            </div>
        );
    }

    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            "aria-controls": `simple-tabpanel-${index}`,
        };
    }

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <Box sx={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", flex: 1, minWidth: 200 }} >
                    <SystemContext.Provider value={[marker, setMarker, system, setSystem, overlays, setOverlays]}>
                        <MapPanel />
                    </SystemContext.Provider>

                </Box>
                <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minWidth: 200 }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Geral" {...a11yProps(0)} />
                            <Tab label="Subterrâneo" {...a11yProps(1)} />
                            <Tab label="Superficial" {...a11yProps(2)} />
                        </Tabs>
                    </Box>
                    <TabPanel value={value} index={0}>
                        <SystemContext.Provider value={[marker, setMarker, overlays, setOverlays]}>
                            <GeneralAnalysePanel />
                        </SystemContext.Provider>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <SystemContext.Provider value={[marker, setMarker, overlays, setOverlays]}>
                            <SubterraneanAnalysePanel />
                        </SystemContext.Provider>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <SystemContext.Provider value={[marker, setMarker, overlays, setOverlays]}>
                            <SurfaceAnalysePanel />
                        </SystemContext.Provider>
                    </TabPanel>
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