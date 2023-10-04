import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { FormControl, FormLabel, Paper } from '@mui/material';

/**
 * Componente para renderizar um gráfico de análise de dados usando ECharts.
 * @component
 */
const DataAnalyseChart = () => {

     /**
     * Estado para armazenar a instância do gráfico ECharts.
     * @type {echarts.ECharts | null}
     */
    const [myChart, setMyChart] = useState(null)

    useEffect(() => {
         /**
         * Inicializa uma instância do gráfico ECharts no elemento com ID 'chart-container'.
         * @type {echarts.ECharts}
         */
        let myChart = echarts.init(document.getElementById('chart-container'));

        // Your ECharts options here...
        const xAxisData = [];

        const emphasisStyle = {
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0,0,0,0.3)',
            },
        };

        /**
         * Configuração das opções do gráfico ECharts.
         * @type {echarts.EChartOption}
         */

        const option = {
            legend: {
                data: ['Q explotável', 'Q Explotável', 'Q Disponível', 'Q Usuário'],
                left: '10%',
            },
            brush: {
                toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
                xAxisIndex: 0,
            },
            toolbox: {
                feature: {
                    magicType: {
                        type: ['stack'],
                    },
                    dataView: {},
                },
            },
            tooltip: {},
            xAxis: {
                data: xAxisData,
                name: 'Vazões',
                axisLine: { onZero: true },
                splitLine: { show: false },
                splitArea: { show: false },
            },
            yAxis: {},
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
                    data: [10],
                },
                {
                    name: 'Q Explotável',
                    type: 'bar',
                    stack: '2',
                    emphasis: emphasisStyle,
                    data: [2],
                },
                {
                    name: 'Q Disponível',
                    type: 'bar',
                    stack: '3',
                    emphasis: emphasisStyle,
                    data: [4],
                },
                {
                    name: 'Q Usuário',
                    type: 'bar',
                    stack: '4',
                    emphasis: emphasisStyle,
                    data: [5],
                },
            ],
        };

        myChart.setOption(option);

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
                    text: 'SELECTED DATA INDICES: \n' + brushed.join('\n'),
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

    return (
        <FormControl sx={{ display: "flex", flex: 1, height: 200 }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Gráfico</FormLabel>
            <Paper id="dac-paper-container" elevation={3} sx={{ display: "flex", flex: 1 }}>
                <div id="chart-container" style={{width: '100%', height: '100%' }}></div>
            </Paper>
        </FormControl>

    );
};

export default DataAnalyseChart;
