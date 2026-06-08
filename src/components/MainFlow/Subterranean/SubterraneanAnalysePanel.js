import { Box } from '@mui/material'
import React from 'react'
import SearchCoords from '../../Commom/SearchCoords'
import DataAnalyseTable from '../../Commom/Subterranean/DataAnalyseTable';
import DataAnalyseChart from '../../Commom/Subterranean/DataAnalyseChart';

/**
 * Painel de análise de dados subterrãneos
 * @component
 * @requires SearchCoords
 *
 */
function SubterraneanAnalysePanel() {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
            <SearchCoords tabNumber={1} />
            <DataAnalyseTable />
            <DataAnalyseChart />
        </Box>
    )
}

export default SubterraneanAnalysePanel;