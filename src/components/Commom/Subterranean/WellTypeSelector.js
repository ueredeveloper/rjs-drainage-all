
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Box } from '@mui/system';
import { useData } from '../../../hooks/analyse-hooks';

/**
 * Lista de tipos de poços.
 * @type {Array<Object>}
 */
const wellType = [
  {
    value: "1",
    label: 'Manual/Tubular Raso',
  },
  {
    value: "2",
    label: 'Tubular Profundo',
  }
];

/**
 * @component WellTypeSelector
 * Este componente rederiza os tipos de poços e atualiza a variável marker.
 * @requires useData from '../../../hooks/analyse-hooks'
 */
function WellTypeSelector() {

  // Especifica o tipo de poço (TpId), onde 1 representa Poço Manual/Tubular Raso e 2 representa Poço Tubular Profundo.
  const [tpId, setTpId] = useState(1);

  // Obtém a função setMarker do hook useData.
  const { setMarker } = useData();

  /**
   * Manipula o evento de alteração do input select e atualiza o estado tpId.
   * @param {Object} e - O objeto de evento
   */
  const onHandleChange = (e) => {
    let tpId = Number(e.target.value)
    setTpId(tpId)
  }

  /**
   * Atualiza a variável marker com o ID do tipo de poço selecionado (tpId) quando ele muda.
   */
  useEffect(() => {
    setMarker(prev => {
      return {
        ...prev,
        tp_id: tpId
      }
    })
  }, [tpId])

  return (
    <Box component="form"
      sx={{
        width: '100%',
        mx: 1,
        '& .MuiInputBase-root': { height: '2.5rem' },
      }}
      noValidate
      autoComplete="off">
      <TextField
        sx={{ width: '100%' }}
        select
        label="Tipo de Poço"
        defaultValue="1"
        onChange={onHandleChange}
      >
        {wellType.map((option) => (
          <MenuItem key={option.value} value={option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>

  );
}

export default WellTypeSelector;
