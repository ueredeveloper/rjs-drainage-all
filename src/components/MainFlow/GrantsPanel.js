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

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Subterrâneas" {...a11yProps(0)} />
                    <Tab label="Superficiais" {...a11yProps(1)} />
                    <Tab label="Lançamentos Pluviais" {...a11yProps(2)} />
                    <Tab label="Lançamentos Efluentes" {...a11yProps(3)} />
                    <Tab label="Barragens" {...a11yProps(4)} />
                </Tabs>
            </Box>
            {
                overlays.shapes.map((shape, i)=>{
                    return (
                        <div id="div-panel" key={i} style={{height: '500px'}}>
                            <TabPanel value={value} index={0}>
                                {console.log(shape.markers.subterranea)}
                                <GrantsTable markers={shape.markers.subterranea !== null ? shape.markers.subterranea : []} />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                                <GrantsTable markers={shape.markers.superficial !== null ? shape.markers.superficial : []} />
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                                <GrantsTable markers={shape.markers.lancamento_pluviais !== null ? shape.markers.lancamento_pluviais : []} />
                            </TabPanel>
                            <TabPanel value={value} index={3}>
                                <GrantsTable markers={shape.markers.lancamento_efluentes !== null ? shape.markers.lancamento_efluentes : []} />
                            </TabPanel>
                            <TabPanel value={value} index={4}>
                                <GrantsTable markers={shape.markers.barragem !== null ? shape.markers.barragem : []} />
                            </TabPanel>
                        </div>
                    )
                  })
            }


        </Box>
    );
}