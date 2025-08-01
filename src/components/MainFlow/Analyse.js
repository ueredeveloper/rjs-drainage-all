/**
 * @component
 * @description Este módulo contém o componente de análise geral.
 */

import React from "react";

import MapPanel from "./General/MapPanel";
import GrantsPanel from "./General/GrantsPanel";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import GeneralAnalysePanel from "./General/GeneralAnalysePanel";
import SubterraneanAnalysePanel from "./Subterranean/SubterraneanAnalysePanel";
import SurfaceAnalysePanel from "./Surface/SurfaceAnalysePanel";
import { DataProvider } from "../../hooks/analyse-hooks";


/**
 * Elemento para análise dos dados renderizados no mapa.
 * @component
 * @requires GeneralAnalysePanel
 * @requires SubterraneanAnalysePanel
 * @requires SurfaceAnalysePanel
 */
function Analyse() {

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

    // Estado do valor da tab selecionada (0: Geral, 1: Subterrâneo, 2: Superficial)
    const [tabValue, setTabValue] = React.useState(0);

    /**
     * Função para lidar com a mudança de valor da guia.
     * @param {object} event - O evento de mudança.
     * @param {number} newValue - O novo valor da guia.
     */
    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <DataProvider>
            <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
                <Box sx={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", flex: 1, minWidth: 200 }} >
                        <MapPanel />
                    </Box>
                    <Box sx={{ display: "flex", flex: 2, flexDirection: "column", minWidth: 200 }}>
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                            <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Geral" {...a11yProps(0)} />
                                <Tab label="Subterrâneo" {...a11yProps(1)} />
                                <Tab label="Superficial" {...a11yProps(2)} />
                            </Tabs>
                        </Box>
                        <TabPanel value={tabValue} index={0}>
                            <GeneralAnalysePanel />
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <SubterraneanAnalysePanel />
                        </TabPanel>
                        <TabPanel value={tabValue} index={2}>
                            <SurfaceAnalysePanel />
                        </TabPanel>
                    </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <GrantsPanel />
                </Box>
            </Box>
        </DataProvider>
    )
}

export default Analyse;