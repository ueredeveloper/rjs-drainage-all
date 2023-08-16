import React, { useContext, useState } from 'react';
import { Box, Button, Checkbox, FormControl, FormLabel, Paper, Tooltip } from '@mui/material';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { SystemContext } from '../../MainFlow/Analyse';
import { initialState } from '../../../initial-state';


export default function MapControllers() {

    const [marker, setMarker, , , overlays, setOverlays] = useContext(SystemContext);
    const [checked, setChecked] = useState([false, false]);

    const handleChange1 = (event) => {
        setChecked([event.target.checked, checked[1]]);
        //_setDataChecked(event.target.name, event.target.checked)
    };

    const handleChange2 = (event) => {

        setChecked([checked[0], event.target.checked]);
        // _setDataChecked(event.target.name, event.target.checked)

    };

    const clearMapHandler = (event) => {
        setChecked([false, false]);
        overlays.shapes.map(shape => {
            if (shape.draw !== null)
                shape.draw.setMap(null)
        });

        setOverlays(initialState.overlays)
    };

    return (
        <FormControl style={{ display: "flex", flex: 1, flexDirection: 'column' }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Camadas</FormLabel>
            <Paper elevation={3} style={{ padding: 5, margin: 1 }}>
                <Box>
                    <Checkbox color="secondary" name="poroso" checked={checked[0]} onChange={handleChange1} />
                    <FormLabel color="secondary" id="demo-controlled-radio-buttons-group">Poroso</FormLabel>
                    <Checkbox color="secondary" name="fraturado" checked={checked[1]} onChange={handleChange2} />
                    <FormLabel id="demo-controlled-radio-buttons-group">Fraturado</FormLabel>
                    {/** limpar */}
                    <Tooltip title="Limpar Mapa">
                        <Button sx={{ marginLeft: '1rem', marginRight: '1rem' }} onClick={clearMapHandler}><LayersClearIcon color="secondary" /></Button>
                    </Tooltip>
                </Box>
            </Paper>
        </FormControl>
    )
}
