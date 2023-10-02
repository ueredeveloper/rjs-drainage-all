import React, { useContext, useEffect, useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Paper, TableContainer } from '@mui/material';
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
    <FormControl style={{ display: "flex", flexDirection: 'column' }}>
      <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Tipo do Poço</FormLabel>
      <Paper elevation={3} style={{ margin: 3 }}>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={'context.point.tp_id'}
          onChange={handleChange}
          sx={{ display: 'flex', flexFlow: 'row wrap', ml: 2, my: 1 }}
        >
          <FormControlLabel value="1" control={<Radio sx={{
            '& .MuiSvgIcon-root': {
              fontSize: 20,
            },
          }} color="secondary" />} label="Manual/Tubular Raso" />
          <FormControlLabel value="2" control={<Radio sx={{
            '& .MuiSvgIcon-root': {
              fontSize: 20,
            },
          }} color="secondary" />} label="Tubular Profundo" />
        </RadioGroup>
      </Paper>
    </FormControl>
  );
}

export default WellTypeSelector;