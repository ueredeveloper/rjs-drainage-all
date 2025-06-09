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
        <Box>
            <SearchCoords tabNumber={2} />
            <SurfaceTabs />
        </Box>
    )
}