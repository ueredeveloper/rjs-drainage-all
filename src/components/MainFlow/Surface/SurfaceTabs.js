import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import SurfaceChart from './SurfaceChart';
import SurfaceTable from './SurfaceTable';
import Chip from "@mui/material/Chip";
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import LayersIcon from "@mui/icons-material/Layers";
import { useData } from '../../../hooks/analyse-hooks';
import { Avatar, FormControl, FormLabel, Paper } from '@mui/material';
import SurfaceTableModulations from './SurfaceTableModulations';


/**
 * Componente auxiliar para renderizar o conteúdo de uma aba (`Tab`) condicionalmente,
 * com suporte a acessibilidade (ARIA).
 *
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Conteúdo interno da aba.
 * @param {number} props.value - Índice da aba atualmente selecionada.
 * @param {number} props.index - Índice desta aba.
 * @returns {JSX.Element} Componente que mostra ou oculta seu conteúdo com base na aba ativa.
 */
function CustomTabPanel(props) {

  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1.5 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

/**
 * Tabs 
 * @returns 
 */
export default function SurfaceTabs() {

  const { ottoBasins } = useData(); // Hook para estado global

  // Estado do valor da tab selecionada (0: Gráficos, 1: Tabelas, 2: Ajustes e Modulações)
  const [tabValue, setTabValue] = useState("0");


  const { surfaceAnalyse, setSurfaceAnalyse} = useData(); // Hook para estado global

  // Método de mudança de tab
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <FormControl sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, m: 0 }}>
      <FormLabel id="demo-controlled-radio-buttons-group" sx={{ mb: 0.5, flexShrink: 0 }}>Análise</FormLabel>
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        {/* Conteúdo da aba ativa — cresce até o limite */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          {tabValue === "0" && <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <Chip
                avatar={<Avatar sx={{ bgcolor: 'transparent', width: 24, height: 24 }}><WallpaperIcon sx={{ fontSize: 18 }} /></Avatar>}
                sx={{ m: 1, fontSize: "12px" }}
                label={`Área de Contribuição: ${ottoBasins.area.toFixed(4)} km²`}
              />
              <Chip
                avatar={<Avatar sx={{ bgcolor: 'transparent', width: 24, height: 24 }}><LayersIcon sx={{ fontSize: 18 }} /></Avatar>}
                sx={{ m: 1, fontSize: "12px" }}
                label={`Unidade Hidrográfica: ${ottoBasins.uhNome || ""} - UH ${ottoBasins.uhRotulo || ""}`}
              />
            </Box>
            <Paper elevation={3} sx={{ height: '220px', flexShrink: 0, overflow: "hidden" }}>
              <SurfaceChart analyse={surfaceAnalyse.secao} />
            </Paper>
            <Paper elevation={3} sx={{ height: '220px', flexShrink: 0, overflow: "hidden" }}>
              <SurfaceChart analyse={surfaceAnalyse.uh} />
            </Paper>
          </Box>}
          {tabValue === "1" && <Box>
            <SurfaceTable q_solicitada={surfaceAnalyse.q_solicitada} analyse={surfaceAnalyse.secao} setSurfaceAnalyse={setSurfaceAnalyse} />
            <SurfaceTable q_solicitada={surfaceAnalyse.q_solicitada} analyse={surfaceAnalyse.uh} setSurfaceAnalyse={setSurfaceAnalyse} />
          </Box>}
          {tabValue === "2" && <Box>
            <SurfaceTableModulations analyse={surfaceAnalyse.h_ajuste} setSurfaceAnalyse={setSurfaceAnalyse} />
            <SurfaceTableModulations analyse={surfaceAnalyse.h_modula} setSurfaceAnalyse={setSurfaceAnalyse} />
            <SurfaceTableModulations analyse={surfaceAnalyse.q_modula} setSurfaceAnalyse={setSurfaceAnalyse} />
          </Box>}
        </Box>
        {/* Abas de navegação fixas no rodapé */}
        <Tabs
          value={tabValue}
          onChange={handleChange}
          aria-label="wrapped label tabs example"
          sx={{ flexShrink: 0, borderTop: 1, borderColor: "divider" }}
        >
          <Tab value="0" label="Gráficos" wrapped />
          <Tab value="1" label="Tabelas" wrapped />
          <Tab value="2" label="Modulações" wrapped />
        </Tabs>
      </Box>
    </FormControl>
  );
}
