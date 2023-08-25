/**
 * @file Componente MapControllers para gerenciar camadas de mapa e caixas de seleção.
 * @module MapControllers
 */

import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Checkbox, FormControl, FormLabel, Paper, Tooltip } from '@mui/material';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { AnalyseContext } from '../../MainFlow/Analyse';
import { initialState } from '../../../initial-state';
import { fetchShape } from '../../../services/shapes';
import { ChatSharp } from '@mui/icons-material';
import { converterPostgresToGmaps } from '../../../tools';
/**
 * Componente MapControllers responsável por gerenciar camadas de mapa usando caixas de seleção.
 * @returns {JSX.Element} JSX do componente MapControllers.
 */
export default function MapControllers({ updateCheckBoxState }) {


    /**
     * Inicializa o estado das caixas de seleção com base nos dados.
     * @param {Object} data - Dados para inicialização das caixas de seleção.
     * @returns {Array} Estado inicial das caixas de seleção.
     */
    const initializeCheckBoxState = (data) => {
        const initialState = [];
        for (const propertyName in data) {
            initialState.push({ name: propertyName, checked: data[propertyName] });
        }

        return initialState;
    };

    const [checkBoxState, setCheckBoxState] = useState(initializeCheckBoxState(mapControllersSchema.data));
    const [, , , , overlays, setOverlays, shapesState, setShapesState] = useContext(AnalyseContext)


    /**
     * Cria um objeto de propriedades para a caixa de seleção.
     * @param {Object} elem - Elemento da caixa de seleção.
     * @returns {Object} Propriedades da caixa de seleção.
     */
    const createCheckboxProps = (elem) => {
        let chBoxProperties = {
            name: elem.name,
            checked: elem.checked,
            onChange: () => { handleChange(elem) },
        };
        return chBoxProperties;
    };

    /**
     * Obtém o texto do rótulo com base no índice dos elementos da interface do usuário.
     * @param {number} index - Índice do elemento.
     * @returns {string} Texto do rótulo.
     */
    const createLabelText = (index) => {
        return mapControllersSchema.uischema.elements[index].label;
    }

    useEffect(() => {

        checkBoxState.map(async cbState => {
            if (cbState.checked === true) {
                // verificar se shapesState está vazio
                if (shapesState.length === 0) {
                    const shape = await fetchShape(cbState.name).then(shape => {
                        // converter posgress para gmaps. ex: [-47.000, -15.000] => {lat: -15.000, lng: -47.000}
                        return shape.map(sh => {
                            return { ...sh, shapeName: cbState.name, shape: { coordinates: converterPostgresToGmaps(sh) } }
                        })
                    });
                    setShapesState(prev => [...prev, { name: cbState.name, shape: shape }]);
                } else {
                    let searchShapeState = shapesState.find(st => st.name === cbState.name);
                    // verificar se a shapeState já foi solicitada, bacias_hidorograficas ou outra, se não, solicitar.
                    // Assim, não se repete solicitação de camada no servidor.]
                    if (searchShapeState === undefined) {
                        const shape = await fetchShape(cbState.name).then(shape => {
                            return shape.map(sh => {

                                return { ...sh, shapeName: cbState.name, shape: { coordinates: converterPostgresToGmaps(sh) } }
                            })
                        });
                        setShapesState(prev => [...prev, { name: cbState.name, shape: shape }]);
                    }
                }
            }
        });

    }, [checkBoxState]);

    /**
     * Manipula o evento de mudança da caixa de seleção.
     * @param {Object} elem - Elemento da caixa de seleção.
     */
    const handleChange = (elem) => {
        let _checkBoxState = checkBoxState.map((ch, i) => {
            if (ch.name === elem.name) {
                return { name: ch.name, checked: !ch.checked };
            } else {
                return ch;
            }
        });
        setCheckBoxState(_checkBoxState);
        updateCheckBoxState(_checkBoxState)
    };

    /**
     * Limpa o mapa e o estado da caixa de seleção.
     * @param {Event} event - Evento de clique.
     */
    const clearMapHandler = (event) => {
        // let _checkBoxState = checkBoxState.map(ch => ch = false)
        setCheckBoxState(initializeCheckBoxState(mapControllersSchema.data));
        updateCheckBoxState(initializeCheckBoxState(mapControllersSchema.data));
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
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    {checkBoxState.map((elem, index) =>
                        <Box key={'map-contr-ch-box-' + index}>
                            <Checkbox color="secondary"  {...createCheckboxProps(elem)} />
                            <FormLabel color="secondary" id="demo-controlled-radio-buttons-group">{
                                createLabelText(index)
                            }</FormLabel>
                        </Box>
                    )}
                    <Tooltip title="Limpar Mapa">
                        <Button sx={{ marginLeft: '1rem', marginRight: '1rem' }} onClick={clearMapHandler}><LayersClearIcon color="secondary" /></Button>
                    </Tooltip>
                </Box>
            </Paper>
        </FormControl>
    );
}

/**
 * Esquema de configuração para MapControllers.
 * @type {Object}
 */
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
