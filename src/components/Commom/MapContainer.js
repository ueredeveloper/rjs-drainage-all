
import React, { useState } from "react";
import { Box } from "@mui/material";
import MapContent from "./map/MapContent";
import MapControllers from "./map/MapControllers";

export default function MapContainer() {


    return (
        <Box sx={{ height: "100%", width: "100%" }}>
            <Box>
                <MapContent />
                <MapControllers />
            </Box>
        </Box>
    )
}