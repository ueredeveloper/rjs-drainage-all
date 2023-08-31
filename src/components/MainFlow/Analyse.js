import React, { useState, createContext, useEffect, useCallback, memo } from "react";

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
import NumberOfGrantsChart from "../Commom/e-chart.js/Number-Of-Grants-Chart-1";


export const AnalyseContext = createContext({});

export default function Analyse() {

    const child = useCallback(() => <NumberOfGrantsChart />, []);

    const [marker, setMarker] = useState(initialState.marker);
    const [system, setSystem] = useState(initialState.system);
    const [overlays, setOverlays] = useState(initialState.overlays);

    const [shapesState, setShapesState] = useState([]);

    const [count, setCount] = useState(1)

    const [selectedShapes, setSelectedShapes] = useState(['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem']);

    const [params, setParams] = useState({
        "selected": {
            "Pluviais": true,
            "Subterrâneas": true,
            "Superficiais": true,
            "Efluentes": true,
            "Barragens": true
        }
    })

    const handleClickSetParams = useCallback((params) => {
        console.log('analyse , handle', params)
        setParams(params)
    }, []);

    function convertToShapeName(dataName) {
        switch (dataName) {
            case 'Subterrâneas':
                return 'subterranea';
            case 'Superficiais':
                return 'superficial';
            case 'Pluviais':
                return 'lancamento_pluviais';
            case 'Efluentes':
                return 'lancamento_efluentes';
            case 'Barragens':
                return 'barragem';
        }
    }


    useEffect(() => {
        if (params && params.selected) {
            let keys = Object.keys(params.selected)

            keys.forEach((key) => {
                //console.log(key, params.selected[key])

                let tableName = convertToShapeName(key);
                if (params.selected[key] === true) {

                    setSelectedShapes(prev => {
                        // verifica se existe o nome selecionado, se existir retira
                        const selecteds = prev.filter(s => s !== tableName)
                        // inclui nome selecionado
                        return [...selecteds, tableName]

                    })
                } else {
                    setSelectedShapes(prev => {
                        // filtra para retirar nome não selecionado
                        return [...prev.filter(prev => prev != tableName)]
                    })
                }
            })
        }

    }, [params])



    useEffect(() => {
        console.log('App', params)
    }, [params])


    useEffect(() => {
        // console.log(marker.position)
        // console.log('analyse overlays', overlays)
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
    const onClickHandler = useCallback(() => {
        console.log('button is clicked')
    }, [])

    return (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <div>count: {count}</div>
                         <GeneralAnalysePanel count={count} setCount={setCount}>
          <NumberOfGrantsChart source="performant" count={count} setCount={setCount}/>
        </GeneralAnalysePanel>
            <Box sx={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", flex: 1, minWidth: 200 }} >
                    <AnalyseContext.Provider value={[marker, setMarker, system, setSystem, overlays, setOverlays, shapesState, setShapesState]}>
                        <MapPanel />
                    </AnalyseContext.Provider>

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
                        
                      
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <AnalyseContext.Provider value={[marker, setMarker, overlays, setOverlays]}>
                            <SubterraneanAnalysePanel />
                        </AnalyseContext.Provider>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <AnalyseContext.Provider value={[marker, setMarker, overlays, setOverlays]}>
                            <SurfaceAnalysePanel />
                        </AnalyseContext.Provider>
                    </TabPanel>
                </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
                <AnalyseContext.Provider value={[system, setSystem, overlays, setOverlays]}>
                    <GrantsPanel />
                </AnalyseContext.Provider>
            </Box>
        </Box >
    )
}