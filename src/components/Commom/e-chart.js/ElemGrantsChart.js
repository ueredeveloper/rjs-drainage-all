import React, { useCallback, useContext, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { AnalyseContext } from '../../MainFlow/Analyse';
import { useData } from '../../../hooks';

/**
 * Componente que exibe um gráfico de pizza com a contagem de concessões por tipo.
 * @component
 */

function ElemGrantsChart() {
  // Estado para armazenar informações do contexto de análise.
  const [marker, setMarker, overlays, setOverlays] = useContext(AnalyseContext);

  let options = {
    color: [
      "#5470c6",//blue -> subterrânea
      "#91cc75",//green -> superficial
      "#fac858",//orange -> pluviais
      "#ee6666",//red -> efluentes
      "#9a60b4",// purple -> barragem
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc",
    ],
    legend: {
      top: 'top',
      //selected: selectedCharts,
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

  const { selectedsCharts, setSelectedsCharts } = useData()

  let myChart = null;

  useEffect(() => {
    // Cria uma instância do ECharts
    myChart = echarts.init(document.getElementById('myChart'));


    // Define as opções para o gráfico
    myChart.setOption(options);

    myChart.on('legendselectchanged', function (event) {

      setSelectedsCharts(event.selected)

    });

    // Limpa a instância do gráfico quando o componente é desmontado
    return () => {
      myChart.dispose();
    };
  }, []);

  // Efeito para atualizar o gráfico com base no estado das caixas de seleção.
  useEffect(() => {

    const newOptions = { ...options }; // Create a copy of options
    let newOptionsData = []
    overlays.shapes.map((shape, i) => {

      let newData = ['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'].map((shapeName, i) => {
        let _data = options.series[0].data.find(item => item.name === convertOptionsDataName(shapeName))
        if (shape.markers[shapeName] !== null) {
          //console.log({ ..._data, value: shape.markers[shapeName].length })
          return { ..._data, value: shape.markers[shapeName].length };
        }
        return { ..._data, value: 0 };
      });

      newData.forEach(data => {
        newOptionsData.push(data)
      })
      newOptions.series[0].data = newOptionsData;
    });
    myChart.setOption(newOptions)

  }, [overlays]);

  return (
    <div id="myChart" style={{ marginTop: 20, width: '100%', height: '300px' }}>
      {console.log('chart render')}
    </div>
  );
}

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
  }
}

export default ElemGrantsChart;
