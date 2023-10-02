import { Box } from '@mui/material'
import React from 'react'
import CoordPaper from '../../Commom/CoordPaper'
import WellTypeSelector from '../../Commom/Subterranean/WellTypeSelector';
import DataAnalyseTable from '../../Commom/Subterranean/DataAnalyseTable';

/**
 * Painel de análise de dados subterrãneos
 * @component
 * @requires CoordPaper
 * 
 */
function SubterraneanAnalysePanel() {
    return (
        <Box>
            <CoordPaper value={1}/>
            <WellTypeSelector/>
            <DataAnalyseTable/>
        </Box>
    )
}

export default SubterraneanAnalysePanel;