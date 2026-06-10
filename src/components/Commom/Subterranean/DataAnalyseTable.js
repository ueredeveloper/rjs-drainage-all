import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { numberWithCommas } from '../../../tools';
import { Avatar, Chip, Paper } from '@mui/material';
import { useData } from '../../../hooks/analyse-hooks';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import LayersIcon from '@mui/icons-material/Layers';
import TagIcon from '@mui/icons-material/Tag';
//import { SystemContext } from './elem-content';




function DataAnalyseTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /*
  const [hgAnalyse, setHGAnalyse ] = useState({
    "bacia_nome": "Bacia Hidrográfica do Rio Paranoá",
    "uh_label": "UH 7",
    "uh_nome": "Ribeirão Bananal",
    "sistema": "P1",
    "cod_plan": "022_07_P1",
    "q_ex": 36326792,
    "n_points": 8,
    "q_points": 2959.5,
    "q_points_per": "0.0081",
    "vol_avaiable": "36323832.5000"
  })*/

  const { hgAnalyse } = useData();
  

  return (
    <Box sx={{ display: "flex", flexDirection: 'column'}}>
      <FormControl >
        <Box sx={{ display: 'flex', flexDirection: 'flex-row', justifyContent: 'space-between' }}>
          <FormLabel id="demo-controlled-radio-buttons-group" sx={{ mb: 0.5 }}>Análise</FormLabel>
        </Box>

        <Paper elevation={3} sx={{ margin: 0, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, py: 1 }}>
            <Chip
              avatar={<Avatar sx={{ bgcolor: 'transparent', width: 24, height: 24 }}><WallpaperIcon sx={{ fontSize: 18 }} /></Avatar>}
              sx={{ fontSize: '12px' }}
              label={`Bacia Hidrográfica: ${hgAnalyse.bacia_nome || ""}`}
            />
            <Chip
              avatar={<Avatar sx={{ bgcolor: 'transparent', width: 24, height: 24 }}><LayersIcon sx={{ fontSize: 18 }} /></Avatar>}
              sx={{ fontSize: '12px' }}
              label={`Unidade Hidrográfica: ${hgAnalyse.uh_nome || ""}`}
            />
            <Chip
              avatar={<Avatar sx={{ bgcolor: 'transparent', width: 24, height: 24 }}><TagIcon sx={{ fontSize: 18 }} /></Avatar>}
              sx={{ fontSize: '12px' }}
              label={hgAnalyse.uh_label || ""}
            />
          </Box>
          <Table sx={{ minWidth: 100, width: "100%" }} aria-label="simple table" size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ p: 2, fontSize: 10 }}>Sistema</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 10 }}>Código</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 10 }}>Q Explotável (m³/ano)</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 10 }}>N° Poços</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 10 }}>{isMobile ? "Q. Total Out. (m³/ano)" : "Q Total Outorgada (m³/ano)"}</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 10 }}>% UTILIZADA</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 10 }}>Vol. Disponível (m³/ano)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center" sx={{ p: 2 }}>{hgAnalyse.sistema}</TableCell>
                <TableCell align="center" sx={{ p: 2 }}>{hgAnalyse.cod_plan}</TableCell>
                <TableCell align="center" sx={{ p: 2 }}>{numberWithCommas(hgAnalyse.q_ex)}</TableCell>
                <TableCell align="center" sx={{ p: 2 }}>{hgAnalyse.n_points}</TableCell>
                <TableCell align="center" sx={{ p: 2 }}>{numberWithCommas(hgAnalyse.q_points)}</TableCell>
                <TableCell align="center" sx={{ p: 2 }}>{numberWithCommas(hgAnalyse.q_points_per)}</TableCell>
                <TableCell align="center" sx={{ p: 2 }}>{numberWithCommas(hgAnalyse.vol_avaiable)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </FormControl>
    </Box>
  )
}
export default DataAnalyseTable;