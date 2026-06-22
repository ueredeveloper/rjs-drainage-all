import {
  Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, BarElement,
  LineElement, PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { TI_CATS } from './constants';

ChartJS.register(
  CategoryScale, LinearScale, LogarithmicScale, BarElement, LineElement,
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

export const PT_SUFFIXES = [
  { value: 1e9, symbol: 'bi'  },
  { value: 1e6, symbol: 'mi'  },
  { value: 1e3, symbol: 'mil' },
  { value: 1,   symbol: ''    },
];

export function ptFormatter(num, unit = '') {
  const abs = Math.abs(num);
  const { value, symbol } = PT_SUFFIXES.find(s => abs >= s.value) ?? PT_SUFFIXES.at(-1);
  const divided = num / value;

  let number;
  if (symbol) {
    const truncated = Math.trunc(divided * 1000) / 1000;
    number = truncated.toFixed(3).replace('.', ',').replace(/0+$/, '').replace(/,$/, '');
  } else {
    number = divided.toFixed(1).replace('.', ',').replace(/,0$/, '');
  }

  const suffix = [symbol, unit].filter(Boolean).join(' ');
  return suffix ? `${number} ${suffix}` : number;
}

export function makeBarValuesPlugin(unit = '') {
  return {
    id: 'barValues',
    afterDatasetsDraw(chart) {
      const { ctx, data } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta) return;
      ctx.save();
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      meta.data.forEach((bar, i) => {
        const value = data.datasets[0].data[i];
        if (!value) return;
        const midY = (bar.y + bar.base) / 2;
        const text = ptFormatter(value, unit);
        const bc   = data.datasets[0].borderColor;
        const color = Array.isArray(bc) ? bc[i] : (bc ?? '#455a64');

        ctx.shadowColor   = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur    = 3;
        ctx.shadowOffsetY = 1;
        ctx.font          = 'bold 13px Roboto, Arial, sans-serif';
        ctx.lineWidth     = 3;
        ctx.strokeStyle   = 'rgba(255,255,255,0.7)';
        ctx.strokeText(text, bar.x, midY);
        ctx.shadowBlur    = 0;
        ctx.fillStyle     = color;
        ctx.fillText(text, bar.x, midY);
      });
      ctx.restore();
    },
  };
}

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
