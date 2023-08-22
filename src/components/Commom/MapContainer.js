
import React, { useState } from "react";
import { Box } from "@mui/material";
import MapContent from "./map/MapContent";
import MapControllers from "./map/MapControllers";

export default function MapContainer() {


    const [checkBoxState, setCheckBoxState] = useState([])

    const updateCheckBoxState = (newState) => {
        setCheckBoxState(newState)
    }

    return (
        <Box sx={{ height: "100%", width: "100%" }}>
            <Box>
                <MapContent checkBoxState={checkBoxState}/>
                <MapControllers updateCheckBoxState={updateCheckBoxState}/>
            </Box>
        </Box>
    )
}