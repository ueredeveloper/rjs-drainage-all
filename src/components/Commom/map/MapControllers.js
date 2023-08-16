import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Checkbox, FormControl, FormLabel, Paper, Tooltip } from '@mui/material';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { SystemContext } from '../../MainFlow/Analyse';
import { initialState } from '../../../initial-state';


export default function MapControllers() {

    const createCheckboxProps = (elem, index) => {
        const propertyName = elem.scope.split('/').pop();
        let chBoxProperties = {
            name: propertyName,
            checked: checked[index],
            onChange: () => { handleChange(index) },
        }

        return chBoxProperties;
    };
    const initializeCheckedState = (data) => {
        const initialState = [];
        // capturar o valor (true ou false), ex: hg_faturado = false
        for (const property in data) {
            initialState.push(data[property]);
        }
        return initialState;
    };

    const [marker, setMarker, , , overlays, setOverlays] = useContext(SystemContext);
    const [checked, setChecked] = useState(initializeCheckedState(mapControllersSchema.data));
    const [shapes, setShapes] = useState([]);

    const handleChange = (index) => {
        let _checked = checked.map((ch, i) => { if (i === index) { return !ch } else { return ch } })
        setChecked(_checked)
    };

    const clearMapHandler = (event) => {
        let _checked = checked.map(ch => ch = false)
        setChecked(_checked);
    };




    return (
        <FormControl style={{ display: "flex", flex: 1, flexDirection: 'column' }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Camadas</FormLabel>
            <Paper elevation={3} style={{ padding: 5, margin: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    {mapControllersSchema.uischema.elements.map((elem, i) =>
                        <Box key={'map-contr-ch-box-' + i}>
                            <Checkbox color="secondary"  {...createCheckboxProps(elem, i)} />
                            <FormLabel color="secondary" id="demo-controlled-radio-buttons-group">{elem.label}</FormLabel>
                        </Box>
                    )}
                    <Tooltip title="Limpar Mapa">
                        <Button sx={{ marginLeft: '1rem', marginRight: '1rem' }} onClick={clearMapHandler}><LayersClearIcon color="secondary" /></Button>
                    </Tooltip>
                </Box>
            </Paper>
        </FormControl>
    )
}

const mapControllersSchema = {
    schema: {
        "type": "object",
        "properties": {
            "hidrogeo_fraturado": {
                "type": "boolean",
                "default": false
            },
            "hidrogeo_poroso": {
                "type": "boolean",
                "default": false
            },
            "bacia_hidrografica": {
                "type": "boolean",
                "default": false
            },
            "unidade_hidrografica": {
                "type": "boolean",
                "default": false
            },
        }
    },
    uischema: {
        "type": "HorizontalLayout",
        "elements": [
            {
                "type": "Control",
                "label": "Fraturado",
                "scope": "#/properties/hidrogeo_fraturado"
            },
            {
                "type": "Control",
                "label": "Poroso",
                "scope": "#/properties/hidrogeo_poroso"
            },
            {
                "type": "Control",
                "label": "Bacia Hidrográfica",
                "scope": "#/properties/bacia_hidrografica"
            },
            {
                "type": "Control",
                "label": "Unidade Hidrográfica",
                "scope": "#/properties/unidade_hidrografica"
            },
        ]
    },
    data: {
        hidrogeo_fraturado: false,
        hidrogeo_poroso: false,
        bacia_hidrografica: false,
        unidade_hidrografica: false
    }
}
