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
            right: 20,
            top: 80,
            bottom: 40,
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
        const el = document.getElementById('e-grants-sub-chart');
        let subChart = echarts.init(el);

        subChart.setOption(options);

setsubChart(subChart);

        const ro = new ResizeObserver(() => {
            window.requestAnimationFrame(() => {
                if (!subChart.isDisposed()) subChart.resize();
            });
        });
        ro.observe(el);

        return () => {
            ro.disconnect();
            subChart.dispose();
        };
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

  //<Paper id="dac-paper-container" elevation={3} sx={{ display: "flex", flex: 1, height: '17rem' }}>

    return (
        <FormControl sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, m: 0 }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ mb: 0.5 }}>Gráfico</FormLabel>
            <Paper id="dac-paper-container" elevation={3} sx={{ display: "flex", flex: 1, minHeight: { xs: '17rem', md: '250px' }, p: 1 }}>
                <div id="e-grants-sub-chart" style={{ width: '100%', height: '100%' }}></div>
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