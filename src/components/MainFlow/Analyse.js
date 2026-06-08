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
import GeneralBarragePanel from "./Barrage/GeneralBarragePanel";

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
                style={{ flex: 1, overflow: "hidden", display: value === index ? "flex" : undefined, flexDirection: "column" }}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</Box>
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
            <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, overflow: "auto" }}>
                {/* Linha principal: lado a lado no desktop, empilhado no mobile */}
                <Box sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    height: { md: "82vh" },
                    minHeight: { xs: 0, md: "480px" },
                    flexShrink: 0,
                }}>
                    {/* Mapa: 1/3 no desktop, altura fixa no mobile */}
                    <Box sx={{
                        flex: { md: 1 },
                        height: { xs: "260px", sm: "320px", md: "100%" },
                        flexShrink: 0,
                    }}>
                        <MapPanel />
                    </Box>
                    {/* Painel de análise: 2/3 no desktop, abaixo no mobile */}
                    <Box sx={{
                        flex: { md: 2 },
                        display: "flex",
                        flexDirection: "column",
                        overflow: { md: "auto" },
                        flexShrink: 0,
                    }}>
                        <Box sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
                            <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example"
                                variant="scrollable" scrollButtons="auto">
                                <Tab label="Geral" {...a11yProps(0)} />
                                <Tab label="Subterrâneo" {...a11yProps(1)} />
                                <Tab label="Superficial" {...a11yProps(2)} />
                                <Tab label="Barragem" {...a11yProps(3)} />
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
                        <TabPanel value={tabValue} index={3}>
                            <GeneralBarragePanel />
                        </TabPanel>
                    </Box>
                </Box>
                {/* GrantsPanel sempre abaixo */}
                <Box sx={{ flexShrink: 0 }}>
                    <GrantsPanel />
                </Box>
            </Box>
        </DataProvider>
    )
}

export default Analyse;