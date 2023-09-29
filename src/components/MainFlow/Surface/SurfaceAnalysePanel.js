import { Box } from '@mui/material'
import React from 'react'
import CoordPaper from '../../Commom/CoordPaper'
/**
 * Painel de análise de dados superficiais.
 * @Component
 * @requires CoordPaper
 */
export default function SurfaceAnalysePanel() {
    return (
        <Box>
            <CoordPaper value={2}/>
        </Box>
    )
}