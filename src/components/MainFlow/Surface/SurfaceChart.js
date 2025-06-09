import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useData } from '../../../hooks/analyse-hooks';
import { useEffect, useState } from 'react';
import { FormControl, FormLabel, Paper } from '@mui/material';

// Register required components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);


/**
 * Chart Superficial
 * @returns 
 */
const SurfaceChart = ({ analyse }) => {

  const [data, setData] = useState({ labels: analyse.meses.values, datasets: [] })

  useEffect(() => {

    if (analyse.alias === "Análise na Unidade Hidrográfica") {
      let _data = { ...data }

      let datasets = [
        {
          label: analyse.q_outorgada.alias,
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(0,63,92,1.0)",
          borderColor: "rgba(0,63,92,0.2)",
          data: analyse.q_outorgada.values,
          updateData: 'analyse.q_outorgada.values'
        },
        {
          label: analyse.q_referencia.alias,
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(0,102,0,1.0)",
          borderColor: "rgba(0,102,0,0.2)",
          data: analyse.q_referencia.values
          ,
          updateData: 'analyse.q_referencia.values'
        },

        {
          label: analyse.q_outorgavel.alias,
          fill: false,
          lineTension: 0,
          //hidden: true - desabilitar linha
          hidden: true,
          backgroundColor: "rgba(255,99,97,1.0)",
          borderColor: "rgba(255,99,97,0.2)",
          data: analyse.q_outorgavel.values
          ,
          updateData: 'analyse.q_outorgavel.values'
        },
        {
          label: analyse.q_disponivel.alias,
          fill: false,
          lineTension: 0,
          //hidden: true - desabilitar linha
          hidden: true,
          backgroundColor: "rgba(255,166,0,1.0)",
          borderColor: "rgba(255,166,0,0.2)",
          data: analyse.q_disponivel.values
          ,
          updateData: 'analyse.q_disponivel.values'
        },
        {
          label: analyse.q_remanescente.alias,
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(128,0,128,1.0)",
          borderColor: "rgba(128,0,128,0.2)",
          data: analyse.q_remanescente.values,
          updateData: 'analyse.q_remanescente.values'
        }

      ]

      _data.datasets = datasets;

      setData(_data)


    } else {

      let _data = { ...data }

      let datasets = [
        {
          label: analyse.q_outorgada.alias,
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(0,63,92,1.0)",
          borderColor: "rgba(0,63,92,0.2)",
          data: analyse.q_outorgada.values,
          updateData: 'analyse.q_outorgada.values'
        },
        {
          label: analyse.q_referencia.alias,
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(0,102,0,1.0)",
          borderColor: "rgba(0,102,0,0.2)",
          data: analyse.q_referencia.values
          ,
          updateData: 'analyse.q_referencia.values'
        },

        {
          label: analyse.q_outorgavel.alias,
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(255,99,97,1.0)",
          borderColor: "rgba(255,99,97,0.2)",
          data: analyse.q_outorgavel.values
          ,
          updateData: 'analyse.q_outorgavel.values'
        },
        {
          label: analyse.q_disponivel.alias,
          fill: false,
          lineTension: 0,

          hidden: true, //delabilitar linha
          backgroundColor: "rgba(255,166,0,1.0)",
          borderColor: "rgba(255,166,0,0.2)",
          data: analyse.q_disponivel.values
          ,
          updateData: 'analyse.q_disponivel.values'
        },
        {
          label: analyse.q_individual.alias,
          fill: false,
          hidden: true,
          lineTension: 0,
          backgroundColor: "rgba(106,90,205,1.0)",
          borderColor: "rgba(106,90,205,0.2)",
          data: analyse.q_individual.values,
          updateData: 'analyse.q_individual.values'
        }

      ]

      _data.datasets = datasets;

      setData(_data)

    }


  }, [analyse]);


  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },

    },
  };

  return (<Line data={data} options={options} style={{ maxHeight: '185px' }} />);
};

export default SurfaceChart;
