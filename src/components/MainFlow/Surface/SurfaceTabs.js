import * as React from 'react';
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
  const [tabValue, setTabValue] = React.useState("0");

  // Método de mudança de tab
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ p: 0 }}>
        {tabValue === "0" && <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>

            <Chip avatar={<WallpaperIcon />} label={`Área de Contribuição: ${ottoBasins.area.toFixed(4)} km²`} sx={{ m: 1, fontSize: "12px" }} />
            <Chip avatar={<LayersIcon />} label={`Unidade Hidrográfica: ${ottoBasins.uhLabel} - ${ottoBasins.unNome}`} sx={{ m: 1, fontSize: "12px" }} />
          </Box>
          <SurfaceChart />
          <SurfaceChart />
        </Box>}
        {tabValue === "1" && <Box>
          <SurfaceTable />
          <SurfaceTable />
        </Box>}
        {tabValue === "2" && <Box>
          <SurfaceTable />
          <SurfaceTable />
        </Box>}
      </Box>
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="wrapped label tabs example"
      >
        <Tab value="0" label="Gráficos" wrapped />
        <Tab value="1" label="Tabelas" wrapped />
        <Tab value="2" label="Modulações" wrapped />
      </Tabs>
    </Box>
  );
}
