import React, { useState, createContext, useEffect, useCallback } from "react";

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

export const AnalyseContext = createContext({});

/**
 * Função que representa o componente Analyse.
 * @returns {JSX.Element} O componente Analyse.
 */
export default function Analyse() {

    // Estado para o marcador
    const [marker, setMarker] = useState(initialState.marker);

    // Estado para o sistema
    const [system, setSystem] = useState(initialState.system);

    // Estado para sobreposições
    const [overlays, setOverlays] = useState(initialState.overlays);

    // Estado para os marcadores por tabelas (subterranea, superficial...)
    const [shapesState, setShapesState] = useState([]);

    // Estado para parâmetros selecionados no chart (Number-Of-Grants-Chart)
    const [selectedsCharts, setSelectedsCharts] = useState({
        "Pluviais": true,
        "Subterrâneas": true,
        "Superficiais": true,
        "Efluentes": true,
        "Barragens": true
    })

    // Estado para formas selecionadas. Renderizar marcadores de acordo com o que o usuário escolho no chart.
    const [selectedsShapes, setSelectedsShapes] = useState(['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'])

    /**
     * Função para converter um nome de dado em um nome de forma.
     * @param {string} dataName - O nome do dado.
     * @returns {string} O nome da forma correspondente.
     */
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

        let keys = Object.keys(selectedsCharts)
        keys.forEach((key) => {
            let tableName = convertToShapeName(key);
            if (selectedsCharts[key] === true) {
                setSelectedsShapes(prev => {
                    // Verifica se existe o nome selecionado, se existir retira
                    const selecteds = prev.filter(s => s !== tableName)
                    // Inclui o nome selecionado
                    return [...selecteds, tableName]
                })
            } else {
                setSelectedsShapes(prev => {
                    // Filtra para retirar nome não selecionado
                    return [...prev.filter(prev => prev != tableName)]
                })
            }
        });

    }, [selectedsCharts]);

    /**
     * Função para renderizar um painel de guias.
     * @param {object} props - As propriedades do painel.
     * @param {ReactNode} props.children - Os elementos filho do painel.
     * @param {number} props.value - O valor do painel.
     * @param {number} props.index - O índice do painel.
     * @returns {JSX.Element} O painel de guias renderizado.
     */
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

    /**
     * Função para obter propriedades de acessibilidade para uma guia.
     * @param {number} index - O índice da guia.
     * @returns {object} As propriedades de acessibilidade.
     */
    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            "aria-controls": `simple-tabpanel-${index}`,
        };
    }

    // Estado para o valor selecionado
    const [value, setValue] = React.useState(0);

    /**
     * Função para lidar com a mudança de valor da guia.
     * @param {object} event - O evento de mudança.
     * @param {number} newValue - O novo valor da guia.
     */
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <Box sx={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", flex: 1, minWidth: 200 }} >
                <AnalyseContext.Provider value={[marker, setMarker, system, setSystem, overlays, setOverlays, shapesState, setShapesState, selectedsShapes]}>
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
                    <AnalyseContext.Provider value={[marker, setMarker, overlays, setOverlays, selectedsCharts, setSelectedsCharts]}>
                        <GeneralAnalysePanel />
                    </AnalyseContext.Provider>
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
    </Box>
)
}