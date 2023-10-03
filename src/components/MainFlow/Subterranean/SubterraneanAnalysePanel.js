import { Box } from '@mui/material'
import React from 'react'
import SearchCoords from '../../Commom/SearchCoords'
import WellTypeSelector from '../../Commom/Subterranean/WellTypeSelector';
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
        <Box>
            <SearchCoords value={1} />
            <DataAnalyseTable />
            <DataAnalyseChart />
        </Box>
    )
}

export default SubterraneanAnalysePanel;