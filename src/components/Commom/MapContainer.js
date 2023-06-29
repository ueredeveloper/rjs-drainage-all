import { Box } from "@mui/material";
import React from "react";
import MapContent from "./map/MapContent";

export default function MapContainer() {
    return (
        <Box sx={{ minHeight: 300, height: "100%"}}>
            <MapContent/>
        </Box>
    )
}