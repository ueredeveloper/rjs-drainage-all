import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ElemOpenDemands } from './elem-open-demands';

function ElemShowUser({ user, setUser }) {

  //const { row } = props;
  const [open, setOpen] = useState(false);

  /*
  {
    "us_id": 2040,
    "us_nome": "Pedro José Martins Salgado",
    "us_cpf_cnpj": "28100336172",
    "us_doc_id": 6050,
    "doc_end": 1979,
    "doc_sei": "108675701",
    "proc_sei": "00197-00001118/2023-91",
    "end_id": 1979,
    "end_logradouro": "Área Rural do Paranoá, Fazenda Santo Antônio, Gleba A",
    "dt_demanda": {
        "demandas": [],
        "vol_anual_ma": "0"
    }
}
*/



  return (
    <React.Fragment>
      {/** main table */}
      <TableRow sx={{ '& .MuiTableCell-sizeMedium': { px: 1, py: 0 } }}>
        <TableCell>
          <IconButton
            color="secondary"
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {user.name}
        </TableCell>

        <TableCell>{user.us_nome}</TableCell>
        <TableCell>{user.us_cpf_cnpj}</TableCell>
        <TableCell>{user.doc_sei}</TableCell>
        <TableCell>{user.proc_sei}</TableCell>
        <TableCell>{user.end_logradouro}</TableCell>

      </TableRow>
      {/** collpsible table */}
      <ElemOpenDemands open={open} user={user} setUser={setUser} />
    </React.Fragment>
  );
}
export { ElemShowUser }