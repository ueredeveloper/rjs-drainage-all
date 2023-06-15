import { Box } from "@mui/material";
import React from "react";
import MapContent from "./map/MapContent";

export default function MapContainer() {
    return (
        <Box sx={{ height: "100%"}}>
            <MapContent/>

        </Box>
    )
}