import React, { useContext, useEffect, useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { FormGroup, InputLabel, Paper, TableContainer, Tooltip, Typography } from '@mui/material';
import { Box, fontSize } from '@mui/system';
//import { SystemContext } from './elem-content';

/**
 * Componente para selecionar o tipo de poço.
 * @returns {JSX.Element} O componente de tipo de poço.
 */
function WellTypeSelector() {
  // Obtém o contexto do sistema
  // const [context, setContext] = useContext(SystemContext);

  /**
   * Manipulador de evento chamado quando o valor do rádio muda.
   * @param {Object} event O evento de mudança.
   */
  const handleChange = (event) => {
    // event.target.value = 1 || 2
    let value = Number(event.target.value);

    /*
    // Atualiza o contexto com o novo tipo de poço selecionado
    setContext(prev => {
      return {
        ...prev,
        point: {
          ...prev.point,
          tp_id: value
        }
      }
    })*/
  };

  return (
    <Box id="wts-content-box" sx={{ display: "flex", flexDirection: "row" }}>
      <RadioGroup
        id="wts-radio-group"
        value={'context.point.tp_id'}
        onChange={handleChange}
        sx={{ display: 'flex', flexFlow: 'row wrap', padding: 0, margin: 0 }}
      >
        <fieldset id="wts-fieldset" style={{ borderWidth: '0px', padding: '0px' }}>
          <legend style={{ fontSize: '12px'}}>Tipo de Poço</legend>
          <FormGroup sx={{ flexDirection: "row", mx: 4 }}>
            <FormControlLabel value="1" sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }} control={
              <Tooltip title="Manual/Tubular Raso">
                <Radio sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: 20,
                  },
                }} color="secondary" />
              </Tooltip>
            } label="Manual" />
            <FormControlLabel value="2" sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }} control={
              <Tooltip title="Tubular Profundo">
                <Radio sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: 20,
                  },
                }} color="secondary" />
              </Tooltip>} label="Tubular" />

          </FormGroup>
        </fieldset>

      </RadioGroup>
    </Box>

  );
}

export default WellTypeSelector;