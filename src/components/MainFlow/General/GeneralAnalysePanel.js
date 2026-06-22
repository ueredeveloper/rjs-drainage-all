import React from "react";
import Box from "@mui/material/Box";
import SearchCoords from "../../Commom/SearchCoords";
import SearchPaper from "./SearchPaper";
import NumberOfGrantsChart from "../../Commom/General/NumberOfGrantsChart";

/**
 * Renderiza painel geral de análise de dados.
 * @component
 * @requires SearchCoords
 * @requires SearchPaper
 * @requires ElemGrantsChart
 */
function GeneralAnalysePanel() {

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5, flex: 1, minHeight: 0 }}>
            <SearchCoords tabNumber={0} />
            {/*
              * Área rolável: overflow:"auto" ativa scrollbar quando conteúdo ultrapassa a altura.
              * Ambos os filhos têm flexShrink:0 — sem isso o flex-shrink comprime a tabela
              * para caber no chart, e o overflow nunca ocorre.
              */}
            <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 1.5, minHeight: 0 }}>
                <Box sx={{ flexShrink: 0 }}>
                    <SearchPaper value={0} />
                </Box>
                <Box sx={{ flexGrow: 1, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 300 }}>
                    <NumberOfGrantsChart />
                </Box>
            </Box>
        </Box>
    );
}
export default GeneralAnalysePanel;
