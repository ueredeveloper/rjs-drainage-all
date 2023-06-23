import React, { useContext } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AnalyseFlow from "./TableFlow";
import TableGrants from "./TableGrants";
import GrantsTable from "../Commom/GrantsTable";
import { SystemContext } from './Analyse';

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
                <Box sx={{ p: 3 }}>
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

export default function GrantsPanel() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [system, setSystem, overlays, setOverlays] = useContext(SystemContext);

   // console.log(overlays.markers)


    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Superficial" {...a11yProps(0)} />
                    <Tab label="Subterrânea" {...a11yProps(1)} />
                    <Tab label="Lançamento" {...a11yProps(2)} />
                    <Tab label="Barragem" {...a11yProps(3)} />
                </Tabs>
            </Box>
            {
                overlays.markers.map((markers, i) => {
                    return (
                        <div key={i}>
                            <TabPanel value={value} index={0}>
                                <GrantsTable markers={markers.superficial_json !== null ? markers.superficial_json : []} />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <GrantsTable markers={markers.subterranea_json !== null ? markers.subterranea_json : []} />
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                                <GrantsTable markers={markers.lancamento_json !== null ? markers.lancamento_json : []} />
                            </TabPanel>
                            <TabPanel value={value} index={3}>
                                <GrantsTable markers={markers.barragem_json !== null ? markers.barragem_json : []} />
                            </TabPanel>
                        </div>
                    )
                })
            }


        </Box>
    );
}