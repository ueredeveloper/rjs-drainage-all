import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import SurfaceChart from './SurfaceChart';
import SufaceTable from './SurfaceTable';

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

export default function SurfaceTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box>
      {/* Tab Panels */}
      <CustomTabPanel value={value} index={0} >
        <SurfaceChart />
        <SurfaceChart />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1} >
        <SufaceTable />
        <br />
        <SufaceTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <SufaceTable />
        <br />
        <SufaceTable />
      </CustomTabPanel>

      {/* Tabs fixed at bottom */}
      <Box
        sx={{
          width: '100%',
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Tabs
          sx={{minHeight: 32}}
          value={value}
          onChange={handleChange}
          aria-label="bottom tabs"
          centered
     
        >
          <Tab label="Gráficos" sx={{ fontSize: "12px", minHeight: 32 }} {...a11yProps(0)} />
          <Tab label="Tabelas" sx={{ fontSize: "12px", minHeight: 32 }} {...a11yProps(1)} />
          <Tab label="Ajustes e Modulações" sx={{ fontSize: "12px", minHeight: 32 }} {...a11yProps(2)} />
        </Tabs>
      </Box>
    </Box>
  );
}
