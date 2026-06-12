import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { TI_CATS } from './constants';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
);

export const chartOpts = (extra = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { bodyFont: { size: 10 }, titleFont: { size: 10 } },
    ...extra.plugins,
  },
  scales: {
    x: { ticks: { font: { size: 9 }, color: '#78909c' }, grid: { display: false } },
    y: { ticks: { font: { size: 9 }, color: '#78909c' }, grid: { color: '#f0f0f0' }, beginAtZero: true },
  },
  ...extra,
});

export const polarCenteredLabelsPlugin = {
  id: 'polarCenteredLabels',
  afterDraw(chart) {
    const { ctx, data } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta) return;
    ctx.save();
    meta.data.forEach((arc, i) => {
      // usa valor real armazenado em _rawData; senão reverte a transformação log1p
      const rawData = data.datasets[0]._rawData;
      const value   = rawData ? rawData[i] : Math.round(Math.expm1(data.datasets[0].data[i]));
      if (!value) return;
      const midAngle = (arc.startAngle + arc.endAngle) / 2;
      const r = arc.outerRadius * 0.58;
      const x = arc.x + r * Math.cos(midAngle);
      const y = arc.y + r * Math.sin(midAngle);
      const color = TI_CATS[i]?.color ?? '#455a64';

      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';

      // número dentro da barra, centralizado
      ctx.fillStyle = color;
      ctx.font      = 'bold 20px Roboto,Arial,sans-serif';
      ctx.fillText(value, x, y);

      // label fora da barra, em cinza
      const rLabel = arc.outerRadius + 26;
      const xLabel = arc.x + rLabel * Math.cos(midAngle);
      const yLabel = arc.y + rLabel * Math.sin(midAngle);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font      = '600 11px Roboto,Arial,sans-serif';
      ctx.fillText(TI_CATS[i]?.label ?? '', xLabel, yLabel);
    });
    ctx.restore();
  },
};
