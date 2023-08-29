import React, { useContext, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { AnalyseContext } from '../../MainFlow/Analyse';

/**
 * Componente que exibe um gráfico de pizza com a contagem de concessões por tipo.
 * @component
 */


/* Melhorar os valores: 

  Subterrâneo -> na overlay subterranea...

  */
function NumberOfGrantsChart() {
  // Estado para armazenar informações do contexto de análise.
  const [, , overlays, setOverlays] = useContext(AnalyseContext);

  // Estado para armazenar a contagem de concessões por tipo.
  const [numberOfGrants, setNumberOfGrants] = useState([
    { value: 0, name: 'Subterrâneo' },
    { value: 0, name: 'Superficial' },
    { value: 0, name: 'Pluvial' },
    { value: 0, name: 'Efluente' },
    { value: 0, name: 'Barragem' }
  ]);

  useEffect(() => {
    // Cria uma instância do ECharts
    const myChart = echarts.init(document.getElementById('myChart'));

    // Configuração do ECharts e definição dos dados
    const options = {
      legend: {
        top: 'top'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true }
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
          data: numberOfGrants
        }
      ]
    };

    // Define as opções para o gráfico
    myChart.setOption(options);

    myChart.on('legendselectchanged', function (params) {
      console.log(params);
    });

    // Limpa a instância do gráfico quando o componente é desmontado
    return () => {
      myChart.dispose();
    };
  }, []);

  // Efeito para atualizar o gráfico com base no estado das caixas de seleção.
  useEffect(() => {
    overlays.shapes.map(shape => {
      let _numberOfGrants = ['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'].map(shapeName => {
        if (shape.markers[shapeName] !== null) {
          return { name: shapeName, value: shape.markers[shapeName].length };
        }
        return { name: shapeName, value: 0 };
      });
      setNumberOfGrants(_numberOfGrants);
      console.log('use eff', _numberOfGrants)
    });
  }, [overlays]);

  return (
    <div id="myChart" style={{ marginTop: 20, width: '100%', height: '300px' }}></div>
  );
}

export default NumberOfGrantsChart;
