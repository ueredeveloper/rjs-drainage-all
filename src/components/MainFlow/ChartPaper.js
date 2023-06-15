import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

export default function ChartPaper() {
    return (
        <Box
            sx={{
                display: "flex",
                "& > :not(style)": {
                    my: 1,
                    width: "100vw",
                    height: 200,
                },
            }}
        >
            <Paper elevation={3} />

        </Box>
    );
}