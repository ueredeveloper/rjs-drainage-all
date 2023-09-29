import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

/**
 * Componente que renderiza um papel (Paper) para gráficos.
 * @component
 */
function ChartPaper() {
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
export default ChartPaper;
