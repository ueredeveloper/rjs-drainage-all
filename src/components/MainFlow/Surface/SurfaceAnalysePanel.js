import { Box } from '@mui/material'
import React from 'react'
import SearchCoords from '../../Commom/SearchCoords'
/**
 * Painel de análise de dados superficiais.
 * @Component
 * @requires SearchCoords
 */
export default function SurfaceAnalysePanel() {
    return (
        <Box>
            <SearchCoords value={2} />
        </Box>
    )
}