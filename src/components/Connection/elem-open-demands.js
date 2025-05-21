import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { ElemDemand } from './elem-demand';
import { findDemands } from '../../services/connection';

function ElemOpenDemands({ open, user, setUser }) {

  const [demands, setDemands] = useState([{ dt_demanda: { demandas: [] } }]);

  function updateDemands(end_id) {

    if (end_id != null) {

      findDemands(end_id).then(demands => {

        let _demands = demands?.map((res) => {

          return {
            // Usuário
            us_nome: user.us_nome,
            us_cpf_cnpj: user.us_cpf_cnpj,
            proc_sei: user.proc_sei,
            // Dados de vazão, interferência, ...
            ind_id: res.ind_id,
            end_id: res.end_id,
            end_logradouro: res.end_logradouro,
            int_latitude: res.int_latitude,
            int_longitude: res.int_longitude,
            // Organiza as demandas por mês com a função sort().
            dt_demanda: { demandas: res.dt_demanda.sort((a, b) => a.mes - b.mes), vol_anual_ma: res.vol_anual_ma },
            sub_tp_id: res.sub_tp_id,
          };
        });

        setDemands(_demands);

      });

    }

  }

  useEffect(() => {
    if (open) {
      updateDemands(user.end_id)
    }

  }, [open]);

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1 }}>
            <Typography variant="p" gutterBottom component="div">Finalidades Autorizadas</Typography>
            <Table size="small" aria-label="purchases">
              <TableHead>
                <TableRow sx={{ p: 3 }}>
                  <TableCell>Latitude</TableCell>
                  <TableCell>Longitude</TableCell>

                  <TableCell>Vazão Jan (L/H)</TableCell>
                  <TableCell>Vazão Jan (L/Dia)</TableCell>

                  <TableCell>Duplicar</TableCell>
                  <TableCell>Inserir</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {
                  demands?.map((demand, i) => (
                    <ElemDemand key={"elem_demand_" + i} demand={demand} user={user} setUser={setUser} />)
                  )
                }
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  )
}
export { ElemOpenDemands }