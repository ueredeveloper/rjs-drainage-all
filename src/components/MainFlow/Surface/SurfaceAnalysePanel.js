import { Box } from '@mui/material'
import SearchCoords from '../../Commom/SearchCoords'
import SurfaceTabs from './SurfaceTabs'

/**
 * Painel de análise de dados superficiais.
 * @Component
 * @requires SearchCoords
 */
export default function SurfaceAnalysePanel() {

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, minHeight: 0 }}>
            <SearchCoords tabNumber={2} />
            <SurfaceTabs />
        </Box>
    )
}