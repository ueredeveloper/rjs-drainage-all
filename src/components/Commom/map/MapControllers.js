import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Checkbox, FormControl, FormLabel, Paper, Tooltip } from '@mui/material';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { SystemContext } from '../../MainFlow/Analyse';
import { initialState } from '../../../initial-state';
import { fetchShape } from '../../../services/shapes';


export default function MapControllers() {

    const createCheckboxProps = (elem, checkBoxState) => {
       
        const _propertyName = elem.scope.split('/').pop();
        
        const _checked = checkBoxState.find(cbState => {
            if (cbState.name = _propertyName) {
                return cbState.checked
            }
        })
        /*
        let _checkBoxState;
        for (const propertyName in mapControllersSchema.data) {

            if (propertyName === _propertyName)
                _checkBoxState = mapControllersSchema.data[propertyName]
        }*/

        let chBoxProperties = {
            name: _propertyName,
            checked: _checked,
            onChange: () => { handleChange(_propertyName, false) },
        }

        return chBoxProperties;
    };
    const initializeCheckBoxState = (data) => {
        const initialState = [];
        // capturar o valor (true ou false), ex: hg_faturado = false
        for (const propertyName in data) {

            initialState.push({ name: propertyName, checked: data[propertyName] });
        }
        return initialState;
    };


    const [marker, setMarker, , , overlays, setOverlays] = useContext(SystemContext);
    const [checkBoxState, setCheckBoxState] = useState(initializeCheckBoxState(mapControllersSchema.data));
    const [shapes, setShapes] = useState([]);

    useEffect(() => {

        checkBoxState.map(ch => {
            if (ch.checked === true) {
                shapes.map(shape => {
                    if (shape.name = ch.name) {
                        console.log('sim')
                    } else {
                        console.log('não')
                    }
                })
                //fetchShape(ch.name).then(result => console.log(result));
            }
        })

    }, [checkBoxState])

    const handleChange = (propertyName) => {
        let _checkBoxState = checkBoxState.map((ch, i) => { if (ch.name === propertyName) { return { name: ch.name, checked: !ch.checked } } else { return ch } })
        setCheckBoxState(_checkBoxState)
    };

    const clearMapHandler = (event) => {
        // let _checkBoxState = checkBoxState.map(ch => ch = false)
        //  setCheckBoxState(_checked);
    };




    return (
        <FormControl style={{ display: "flex", flex: 1, flexDirection: 'column' }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Camadas</FormLabel>
            <Paper elevation={3} style={{ padding: 5, margin: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    {mapControllersSchema.uischema.elements.map((elem, i) =>
                        <Box key={'map-contr-ch-box-' + i}>
                            <Checkbox color="secondary"  {...createCheckboxProps(elem, checkBoxState)} />
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
            "bacias_hidrograficas": {
                "type": "boolean",
                "default": false
            },
            "unidades_hidrograficas": {
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
                "scope": "#/properties/bacias_hidrograficas"
            },
            {
                "type": "Control",
                "label": "Unidade Hidrográfica",
                "scope": "#/properties/unidades_hidrograficas"
            },
        ]
    },
    data: {
        hidrogeo_fraturado: false,
        hidrogeo_poroso: false,
        bacias_hidrograficas: false,
        unidades_hidrograficas: false
    }
}
