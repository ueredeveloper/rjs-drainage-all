
import React, { useContext, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { AnalyseContext } from '../../MainFlow/Analyse';
import { Box, Button, Checkbox, FormControl, FormLabel, Paper } from '@mui/material';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { CenterFocusWeakTwoTone } from '@mui/icons-material';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

/**
 * Componente de gráfico de área polar.
 * @returns {JSX.Element} Elemento JSX que exibe o gráfico de área polar.
 */
export function ElemPolarAreaChart() {

    // Cores de fundo para os segmentos do gráfico.
    const backgroundColor = [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)'
    ];

    // Estado para armazenar informações do contexto de análise.
    const [marker, setMarker, overlays, setOverlays] = useContext(AnalyseContext);

    // Estado para o número de concessões em diferentes categorias.
    const [numberOfGrants, setNumberOfGrants] = useState({
        labels: ['Subterrânea', 'Superficial', 'Pluviais', 'Efluentes', 'Barragem'],
        datasets: [
            {
                label: 'Valor',
                data: [0, 0, 0, 0, 0],
                backgroundColor: backgroundColor
            },
        ],
    });

    // Opções de configuração do gráfico.
    const options = {
        legend: {
            display: false,
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const originalValue = numberOfGrants.datasets[0].data[context.dataIndex];
                        return `Qt: ${originalValue}`;
                    },
                },
            },
            legend: {
                display: false
            }
        },
    }

    // Estado para o controle das caixas de seleção.
    const [checkBoxState, setCheckBoxState] = useState([
        { label: "Subterrâneas", name: 'subterranea', checked: true },
        { label: "Superficiais", name: 'superficial', checked: true },
        { label: "Pluviais", name: 'lancamento_pluviais', checked: true },
        { label: "Efluentes", name: 'lancamento_efluentes', checked: true },
        { label: "Barragens", name: 'barragem', checked: true },
    ]);

    // Efeito para atualizar o gráfico com base nas sobreposições.
    useEffect(() => {
        overlays.shapes.map(shape => {
            let newDataSets = [
                {
                    label: '',
                    data: numberOfGrants.datasets[0].data,
                    backgroundColor: backgroundColor
                },
            ];
            setNumberOfGrants(prevState => ({
                ...prevState,
                datasets: newDataSets
            }));
        });
    }, [overlays]);

    // Efeito para atualizar o gráfico com base no estado das caixas de seleção.
    useEffect(() => {
        overlays.shapes.map(shape => {
            let newData = ['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'].map(shapeName => {
                let cbState = checkBoxState.find(cb => cb.name === shapeName);
                if (cbState !== null && cbState !== undefined) {
                    if (shape.markers[shapeName] !== null && cbState.checked !== false) {
                        return shape.markers[shapeName].length;
                    }
                    return null;
                }
                return null;
            });
            let newDataSets = [
                {
                    label: '',
                    data: newData,
                    backgroundColor: backgroundColor
                },
            ];

            setNumberOfGrants(prevState => ({
                ...prevState,
                datasets: newDataSets
            }));
        });
    }, [checkBoxState]);

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
        return checkBoxState[index].label;
    }

    /**
     * Manipula a mudança de estado da caixa de seleção.
     * @param {Object} elem - Elemento da caixa de seleção.
     */
    const handleChange = (elem) => {
        let _checkBoxState = checkBoxState.map(cb => {
            if (cb.name === elem.name) {
                return { ...elem, checked: !elem.checked }
            }
            return cb;
        });
        setCheckBoxState(_checkBoxState);
    };

    return <FormControl style={{ display: "flex", flex: 1, flexDirection: 'column' }}>
        <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Gráfico</FormLabel>
        <Paper elevation={3} style={{ display: 'flex', flexDirection: 'row', padding: 5, margin: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {checkBoxState.map((elem, index) =>
                    <Box key={'map-contr-ch-box-' + index} sx={{ width: 150 }}>
                        <Checkbox color="secondary"  {...createCheckboxProps(elem)} sx={{ '& .MuiSvgIcon-root': { fontSize: 15 } }} />
                        <FormLabel color="secondary" id="demo-controlled-radio-buttons-group">{
                            createLabelText(index)
                        }</FormLabel>
                    </Box>
                )}
            </Box>
            <PolarArea style={{ maxHeight: 270 }}
                data={{
                    ...numberOfGrants,
                    datasets: [{ ...numberOfGrants.datasets[0], data: numberOfGrants.datasets[0].data.map((value) => Math.log10(value)) }],
                }}
                options={options} />
        </Paper>
    </FormControl>

}
