import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { FormControl, FormLabel, Paper, Switch, Tooltip } from '@mui/material';
import { useData } from '../../../hooks/analyse-hooks';

/**
 * Componente para renderizar um gráfico de análise de dados usando ECharts.
 * @component
 */
const DataAnalyseChart = () => {
    


    /**
    * Estado para armazenar a instância do gráfico ECharts.
    * @type {echarts.ECharts | null}
    */
    const [subChart, setsubChart] = useState(null);

    const { subsystem } = useData();

    const [checked, setChecked] = useState(false);

    const emphasisStyle = {
        itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
        },
    };

    const options = {
        legend: {
            data: ['Q explotável', 'Q outorgada', 'Q Disponível', 'Q Usuário'],
            left: '5%',
        },
        brush: {
            // toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
            //xAxisIndex: 0,
        },
        
        tooltip: {},
        xAxis: {
            data: [],
            name: 'Vazões',
            axisLine: { onZero: true },
            splitLine: { show: false },
            splitArea: { show: false },
        },
        yAxis: {
            type: 'value'
        },
        grid: {
            left: 30,
            top: 150,
            bottom: 110,
        },
        series: [
            {
                name: 'Q explotável',
                type: 'bar',
                stack: '1',
                emphasis: emphasisStyle,
                data: [subsystem.hg_analyse.q_ex],
            },
            {
                name: 'Q outorgada',
                type: 'bar',
                stack: '2',
                emphasis: emphasisStyle,
                data: [subsystem.hg_analyse.q_points],
            },
            {
                name: 'Q Disponível',
                type: 'bar',
                stack: '3',
                emphasis: emphasisStyle,
                data: [subsystem.hg_analyse.q_ex - subsystem.hg_analyse.q_points],
            },
            {
                name: 'Q Usuário',
                type: 'bar',
                stack: '4',
                emphasis: emphasisStyle,
                data: [subsystem.markers.length !== 0 ? subsystem.markers[0].dt_demanda.vol_anual_ma : 0],
            },
        ]
    };

    useEffect(() => {
        if (subChart) {
            subChart.setOption({
                yAxis: {
                    type: checked ? 'log' : 'value'
                }
            });
        }
    }, [checked, subChart]);


    useEffect(() => {

        /**
        * Inicializa uma instância do gráfico ECharts no elemento com ID 'e-grants-sub-chart'.
        * @type {echarts.ECharts}
        */
        let subChart = echarts.init(document.getElementById('e-grants-sub-chart'));

        subChart.setOption(options);

        // manipulação das opções no gráfico 
        subChart.on('brushSelected', function (params) {
            var brushed = [];
            var brushComponent = params.batch[0];
            for (var sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
                var rawIndices = brushComponent.selected[sIdx].dataIndex;
                brushed.push('[Series ' + sIdx + '] ' + rawIndices.join(', '));
            }
            subChart.setOption({
                title: {
                    backgroundColor: '#333',
                    // text: 'SELECTED DATA INDICES: \n' + brushed.join('\n'),
                    bottom: 0,
                    right: '10%',
                    width: 100,
                    textStyle: {
                        fontSize: 12,
                        color: '#fff',
                    },
                },
            });
        });
        // Define a instância do gráfico no estado
        setsubChart(subChart)
    }, []);

    useEffect(() => {

        setChecked(false)

        let newOptions = { ...options };
        let series = [
            {
                name: 'Q explotável',
                type: 'bar',
                stack: '1',
                emphasis: emphasisStyle,
                data: [subsystem.hg_analyse.q_ex],
            },
            {
                name: 'Q outorgada',
                type: 'bar',
                stack: '2',
                emphasis: emphasisStyle,
                data: [subsystem.hg_analyse.q_points],
            },
            {
                name: 'Q Disponível',
                type: 'bar',
                stack: '3',
                emphasis: emphasisStyle,
                data: [subsystem.hg_analyse.q_ex - subsystem.hg_analyse.q_points],
            },
            {
                name: 'Q Usuário',
                type: 'bar',
                stack: '4',
                emphasis: emphasisStyle,
                // resolver quando inserir a busca de items cadastrados no outro sistema
                data: [subsystem.markers.length !== 0 ? subsystem.markers[0].dt_demanda.vol_anual_ma : 0],

            },
        ];

        newOptions.series = series;


        if (subChart) {

            subChart.setOption(newOptions)
        }

    }, [subsystem]);

    /**
   * Função chamada quando o valor do Switch é alterado.
   *
   * @param {Object} event - Objeto do evento de alteração.
   */
  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

    return (
        <FormControl sx={{ display: "flex", flex: 1 , m:0}}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Gráfico</FormLabel>
            <Paper id="dac-paper-container" elevation={3} sx={{ display: "flex", flex: 1}}>
                <div id="e-grants-sub-chart" style={{ margin: 10, width: '100%', height: '10rem' }}></div>
                
            </Paper>
            <Tooltip title="Escala logarítimica">
                    <Switch
                        checked={checked}
                        size="small"
                        onChange={handleChange}
                        color="secondary"
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                </Tooltip>
        </FormControl>

    );
};

export default DataAnalyseChart;