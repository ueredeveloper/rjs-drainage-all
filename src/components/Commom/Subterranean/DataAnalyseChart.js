import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { FormControl, FormLabel, Paper } from '@mui/material';
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
    const [myChart, setMyChart] = useState(null);

    const { hgAnalyse } = useData();

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
        toolbox: {
            feature: {
                /*  magicType: {
                      type: ['stack'],
                  },*/
                dataView: {},
            },
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
            type: 'log' 
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
                data: [hgAnalyse.qExploitable],
            },
            {
                name: 'Q outorgada',
                type: 'bar',
                stack: '2',
                emphasis: emphasisStyle,
                data: [hgAnalyse.qTotalAnnual],
            },
            {
                name: 'Q Disponível',
                type: 'bar',
                stack: '3',
                emphasis: emphasisStyle,
                data: [hgAnalyse.volAvailable],
            },
            {
                name: 'Q Usuário',
                type: 'bar',
                stack: '4',
                emphasis: emphasisStyle,
                data: [hgAnalyse.qUserAnnual],
            },
        ]
    };

    useEffect(() => {
        /**
        * Inicializa uma instância do gráfico ECharts no elemento com ID 'chart-container'.
        * @type {echarts.ECharts}
        */
        let myChart = echarts.init(document.getElementById('chart-container'));

        myChart.setOption(options);

        // manipulação das opções no gráfico 
        myChart.on('brushSelected', function (params) {
            var brushed = [];
            var brushComponent = params.batch[0];
            for (var sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
                var rawIndices = brushComponent.selected[sIdx].dataIndex;
                brushed.push('[Series ' + sIdx + '] ' + rawIndices.join(', '));
            }
            myChart.setOption({
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
        setMyChart(myChart)
    }, []);

    useEffect(() => {

        let newOptions = { ...options };
        let series = [
            {
                name: 'Q explotável',
                type: 'bar',
                stack: '1',
                emphasis: emphasisStyle,
                data: [hgAnalyse.qExploitable],
            },
            {
                name: 'Q outorgada',
                type: 'bar',
                stack: '2',
                emphasis: emphasisStyle,
                data: [hgAnalyse.qTotalAnnual],
            },
            {
                name: 'Q Disponível',
                type: 'bar',
                stack: '3',
                emphasis: emphasisStyle,
                data: [hgAnalyse.volAvailable],
            },
            {
                name: 'Q Usuário',
                type: 'bar',
                stack: '4',
                emphasis: emphasisStyle,
                // resolver quando inserir a busca de items cadastrados no outro sistema
                data: [hgAnalyse.qUserAnnual],
            },
        ];

        newOptions.series = series;


        if (myChart) {

            myChart.setOption(newOptions)
        }

    }, [hgAnalyse])

    return (
        <FormControl sx={{ display: "flex", flex: 1 }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Gráfico</FormLabel>
            <Paper id="dac-paper-container" elevation={3} sx={{ display: "flex", flex: 1 }}>
                <div id="chart-container" style={{ margin: 10, width: '100%', height: '10rem' }}></div>
            </Paper>
        </FormControl>

    );
};

export default DataAnalyseChart;
