import React, { useCallback, useContext, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { AnalyseContext } from '../../MainFlow/Analyse';

/**
 * Componente que exibe um gráfico de pizza com a contagem de concessões por tipo.
 * @component
 */

function NumberOfGrantsChart() {
  // Estado para armazenar informações do contexto de análise.

  const [, , overlays, , params, setParams] = useContext(AnalyseContext);

  const [_params, _setParams] = useState(params)

  const [options, setOptions] = useState({
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
      selected: _params.selected,
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
  });

  useEffect(() => {
    // Cria uma instância do ECharts
    const myChart = echarts.init(document.getElementById('myChart'));

    // Define as opções para o gráfico
    myChart.setOption(options);

    myChart.on('legendselectchanged', function (event) {
      // atualizar variável ambiente
      _setParams(prevParams => ({
        ...prevParams,
        selected: {
          ...prevParams.selected,
          [event.name]: event.selected[event.name]
        }
      }));
      // atualizar vairável global (Analyse.js)
      setParams(prevParams => ({
        ...prevParams,
        selected: {
          ...prevParams.selected,
          [event.name]: event.selected[event.name]
        }
      }));

    });

    // Limpa a instância do gráfico quando o componente é desmontado
    return () => {
      myChart.dispose();
    };
  }, []);

  // Efeito para atualizar o gráfico com base no estado das caixas de seleção.
  useEffect(() => {

    overlays.shapes.map(shape => {
      let newData = ['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'].map((shapeName, i) => {
        let _data = options.series[0].data.find(item => item.name === convertOptionsDataName(shapeName))
        if (shape.markers[shapeName] !== null) {
          return { ..._data, value: shape.markers[shapeName].length };
        }
        return { ..._data, value: 0 };
      });
      const newOptions = { ...options }; // Create a copy of options
      newOptions.series[0].data = newData; // Update data with new values
      setOptions(newOptions); // Update state with new options

    });


  }, [overlays]);

  return (
    <div id="myChart" style={{ marginTop: 20, width: '100%', height: '300px' }}></div>
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
function convertToShapeName(dataName) {
  switch (dataName) {
    case 'Subterrâneas':
      return 'subterranea';
    case 'Superficiais':
      return 'superficial';
    case 'Pluviais':
      return 'lancamento_pluviais';
    case 'Efluentes':
      return 'lancamento_efluentes';
    case 'Barragens':
      return 'barragem';
  }
}

function getSelectedFalseKeys(data) {
  if (data && data.selected) {
    return Object.keys(data.selected).filter(key => data.selected[key] === false);
  } else {
    return [];
  }
}

export default NumberOfGrantsChart;
