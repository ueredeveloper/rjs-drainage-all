

import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, FormControl, FormLabel, Paper, Tooltip } from '@mui/material';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { initialsStates } from '../../../initials-states';
import { fetchShape } from '../../../services/shapes';
import { converterPostgresToGmaps } from '../../../tools';
import { useData } from '../../../hooks/analyse-hooks';


/**
 * Componente MapControllers responsável por gerenciar camadas de mapa usando caixas de seleção.
 * @component
 * @requires converterPostgresToGmaps
 * @requires useData
 * @requires fetchShape
 * @requires initialsStates
 * @returns {JSX.Element} JSX do componente MapControllers.
 */
function MapControllers({ updateCheckBoxState }) {

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
    const { overlays, setOverlays, shapesFetched, setShapesFetched, setSubsystem, setHgAnalyse } = useData();

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
                // verificar se shapesFetched está vazio
                if (shapesFetched.length === 0) {

                    console.log(cbState.name)
                    const _shape = await fetchShape(cbState.name).then(__shape => {
                        // converter posgress para gmaps. ex: [-47.000, -15.000] => {lat: -15.000, lng: -47.000}
                        return __shape.map(sh => {
                            return { ...sh, shapeName: cbState.name, shape: { coordinates: converterPostgresToGmaps(sh) } }
                        })
                    });

                    setShapesFetched(prev => [...prev, { name: cbState.name, shape: _shape }]);
                } else {
                    // verifica se a shape está presente na array shapesFetched
                    let searchShapesFetched = shapesFetched.find(st => st.name === cbState.name);
                    // verificar se a shapeState já foi solicitada, bacias_hidorograficas ou outra, se não, solicitar.
                    // Assim, não se repete solicitação de camada no servidor.]
                    if (searchShapesFetched === undefined) {
                        const _shape = await fetchShape(cbState.name).then(__shape => {
                            return __shape.map(sh => {

                                return { ...sh, shapeName: cbState.name, shape: { coordinates: converterPostgresToGmaps(sh) } }
                            })
                        });
                        setShapesFetched(prev => [...prev, { name: cbState.name, shape: _shape }]);
                    }
                }
            }
        });

    }, [checkBoxState, setShapesFetched, shapesFetched]);

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

        setSubsystem(initialsStates.subsystem);
        setHgAnalyse(initialsStates.subsystem.hg_analyse);
        overlays.shapes.forEach(shape => {
            shape?.draw?.setMap(null)
        });
        setOverlays(initialsStates.overlays);
    };

    return (
        <FormControl style={{ display: "flex", flex: 1, flexDirection: 'column' }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Camadas</FormLabel>
            <Paper elevation={3} style={{ padding: 0, margin: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    {checkBoxState.map((elem, index) =>
                        <Box key={'map-contr-ch-box-' + index}>
                            <Checkbox color="secondary"  {...createCheckboxProps(elem)} sx={{ px: 1 }} />
                            <FormLabel sx={{ wordBreak: "break-all", fontSize: "12px", px: 0 }} color="secondary" id="demo-controlled-radio-buttons-group">{
                                createLabelText(index)
                            }</FormLabel>
                        </Box>
                    )}
                    <Tooltip title="Limpar Mapa">
                        <Button sx={{ mx: '0rem' }} onClick={clearMapHandler}><LayersClearIcon color="secondary" /></Button>
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

export default MapControllers;
