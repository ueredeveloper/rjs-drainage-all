import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { useData } from '../../../hooks/analyse-hooks';
import { FormControl, FormLabel, Paper } from '@mui/material';

/**
 * Componente que exibe um gráfico com contagem de concessões de outorga por tipo.
 * @component
 */
function NumberOfGrantsChart() {
  

  
  // Estado para armazenar informações do contexto de análise.
  const { overlays, setSelectedsCharts } = useData();

  /**
   * Converte o nome de uma forma (shape) em um nome mais legível.
   *
   * @param {string} shapeName - O nome da forma a ser convertido.
   * @returns {string} O nome legível da forma.
   */
  function convertOptionsDataName(shapeName) {
    switch (shapeName) {
      case 'subterranea':
        return 'Subterrâneas';

      case 'superficial':
        return 'Superficiais';

      case 'lancamento_pluviais':
        return 'Pluviais';

      case 'lancamento_efluentes':
        return 'Efluentes';

      case 'barragem':
        return 'Barragens';
     
      default:
        return 'Desconhecido';
    }
  }

  // Opções iniciais para o gráfico.
  let options = {
    color: [
      "#5470c6", // azul -> subterrânea
      "#91cc75", // verde -> superficial
      "#fac858", // laranja -> pluviais
      "#BD1A8E", // vermelho -> efluentes
      "#9a60b4", // roxo -> barragem
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc",
    ],
    legend: {
      top: 'top',
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: false },
        saveAsImage: { show: false }
      }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: [50, 100],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        data: [
          { value: 0, name: 'Subterrâneas' },
          { value: 0, name: 'Superficiais' },
          { value: 0, name: 'Pluviais' },
          { value: 0, name: 'Efluentes' },
          { value: 0, name: 'Barragens' }
        ]

      }
    ]
  };

  const [myChart, setMyChart] = useState(null)

  useEffect(() => {
    // Cria uma instância do ECharts
    let myChart = echarts.init(document.getElementById('e-grants-chart'));

    // Define as opções para o gráfico
    myChart.setOption(options);

    myChart.on('legendselectchanged', function (event) {

      setSelectedsCharts(event.selected)

    });

    setMyChart(myChart)

    // Limpa a instância do gráfico quando o componente é desmontado
    return () => {
      myChart.dispose();
    };
  }, []);

  // Efeito para atualizar o gráfico com base no estado das caixas de seleção.
  useEffect(() => {

    const newOptions = { ...options }; // Cria uma cópia das opções
    let newOptionsData = [];

    overlays.shapes.map((shape, i) => {
      

      let newData = ['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'].map((shapeName, i) => {
        let _data = options.series[0].data.find(item => item.name === convertOptionsDataName(shapeName))
        if (shape.markers !== undefined && shape.markers[shapeName] !== null) {
          return { ..._data, value: shape.markers[shapeName].length };
        }
        return { ..._data, value: 0 };
      });

      newData.forEach(data => {
        newOptionsData.push(data)
      })
      newOptions.series[0].data = newOptionsData;
    });

    if (myChart) {
      myChart.setOption(newOptions)
    }

  }, [overlays]);

  return (

    <FormControl sx={{ display: "flex", flex: 1 }}>
      <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Gráfico</FormLabel>
      <Paper id="dac-paper-container" elevation={3} sx={{ display: "flex", flex: 1, height: '22rem' }}>
        <div id="e-grants-chart" style={{ margin: 10, width: '100%', height: '18rem' }}></div>
      </Paper>
    </FormControl>

  );
}

export default NumberOfGrantsChart;
