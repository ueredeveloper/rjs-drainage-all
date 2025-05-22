import React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
//import ElemGrant from './grant/elem-grant';
import { numberWithCommas } from '../../../tools';
//import { makeStyles } from '@mui/styles';
import { Paper, Typography } from '@mui/material';
import { useData } from '../../../hooks/analyse-hooks';
//import { SystemContext } from './elem-content';



function DataAnalyseTable() {
  /**
    * Dados sobre a disponibilidade.
    */

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
    <Box sx={{ display: "flex", flexDirection: 'column' }}>
      <FormControl >
        <Box sx={{ display: 'flex', flexDirection: 'flex-row', justifyContent: 'space-between' }}>
          <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Análise</FormLabel>
        </Box>

        <Paper elevation={3} sx={{ margin: 0, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', my: 1 }}>
            <Typography sx={{ fontSize: 14 }}>Bacia Hidrográfica: {hgAnalyse.bacia_nome}</Typography>
            <Typography sx={{ fontSize: 14 }}>Unidade Hidrográfica: {hgAnalyse.uh_nome} </Typography>
            <Typography sx={{ fontSize: 14 }}>{hgAnalyse.uh_label} </Typography>
          </Box>
          <Table sx={{ minWidth: 100, width: "100%" }} aria-label="simple table" size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ p: 2, fontSize: 12 }}>Sistema</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 12 }}>Código</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 12 }}>Q Explotável (m³/ano)</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 12 }}>N° Poços</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 12 }}>Q Total Outorgada (m³/ano)</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 12 }}>% UTILIZADA</TableCell>
                <TableCell align="center" sx={{ p: 2, fontSize: 12 }}>Vol. Disponível (m³/ano)</TableCell>
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