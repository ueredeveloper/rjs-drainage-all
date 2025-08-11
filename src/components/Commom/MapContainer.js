
import React, { useState } from "react";
import { Box } from "@mui/material";
import MapContent from "./map/MapContent";
import MapControllers from "./map/MapControllers";


/**
 * @description Organiza a renderização do mapa.
 * @component
 * @requires MapContent
 * @requires MapControllers
 */
function MapContainer() {

    const [checkboxes, setCheckboxes] = useState({})

    return (
        <Box sx={{ height: "100%", width: "100%" }}>
            <Box sx={{ position: "relative", height: "100%" }}>
                <MapContent checkboxes={checkboxes} setCheckboxes={setCheckboxes} />
              </Box>
        </Box>
    )
}

export default MapContainer;