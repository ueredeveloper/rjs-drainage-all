import React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MapContainer from "../../Commom/MapContainer";


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ height: "85%" }}
        >
            {value === index && (
                <Box sx={{ p: 2, height: "100%" }}>
                    <Box sx={{height: "100%"}}>{children}</Box>
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

/**
 * Componente que exibe um painel de mapa.
 * @component
 * @requires MapContainer
 *
 * @param {object} props - As propriedades do componente.
 * @param {number} props.height - A altura do painel de mapa.
 * @returns {JSX.Element} O elemento JSX que representa o painel de mapa.
 */
function MapPanel() {
    
    const [value, setValue] = React.useState(0);

    /**
     * Manipula a alteração de valor nas guias.
     *
     * @param {object} event - O evento de mudança.
     * @param {number} newValue - O novo valor da guia.
     */
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: "100%" }} >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Mapa" {...a11yProps(0)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0} >
                    <MapContainer />
            </TabPanel>
        </Box>
    );
}

export default MapPanel;