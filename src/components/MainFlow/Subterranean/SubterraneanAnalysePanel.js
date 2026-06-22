import { Box } from '@mui/material'
import React from 'react'
import SearchCoords from '../../Commom/SearchCoords'
import DataAnalyseTable from '../../Commom/Subterranean/DataAnalyseTable';
import DataAnalyseChart from '../../Commom/Subterranean/DataAnalyseChart';

/**
 * Painel de análise de dados subterrâneos
 * @component
 * @requires SearchCoords
 */
function SubterraneanAnalysePanel() {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, minHeight: 0 }}>
            <SearchCoords tabNumber={1} />
            {/*
              * Área rolável: overflow:"auto" ativa scrollbar quando conteúdo ultrapassa a altura.
              * Ambos os filhos têm flexShrink:0 — sem isso o flex-shrink comprime a tabela
              * para caber no chart, e o overflow nunca ocorre.
              */}
            <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 1.5, minHeight: 0 }}>
                <Box sx={{ flexShrink: 0 }}>
                    <DataAnalyseTable />
                </Box>
                <Box sx={{ flexGrow: 1, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 300 }}>
                    <DataAnalyseChart />
                </Box>
            </Box>
        </Box>
    )
}

export default SubterraneanAnalysePanel;
