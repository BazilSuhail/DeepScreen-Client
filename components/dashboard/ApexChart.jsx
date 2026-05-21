'use client';

import dynamic from 'next/dynamic';

// apexcharts reads `window` on import, so the chart only renders in the browser.
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const CHART_COLORS = ['#10b981', '#34d399', '#2dd4bf', '#6ee7b7', '#a7f3d0', '#0d9488'];

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Recursive merge: plain objects merge key by key, anything else (arrays, values) from `over` wins.
const deepMerge = (base, over) => {
  const out = { ...base };
  for (const key of Object.keys(over)) {
    out[key] = isPlainObject(base[key]) && isPlainObject(over[key]) ? deepMerge(base[key], over[key]) : over[key];
  }
  return out;
};

// Series can be a number[] (pie), an array of numbers, or [{ name, data }] (objects may carry { y }).
const hasData = (series) =>
  (series || []).some((s) => {
    const values = typeof s === 'number' ? [s] : Array.isArray(s) ? s : s?.data || [];
    return values.some((v) => Number(isPlainObject(v) ? v.y : v));
  });

const darkDefaults = (type) => ({
  chart: {
    background: 'transparent',
    foreColor: '#94a3b8',
    fontFamily: 'inherit',
    toolbar: { show: false },
    animations: { enabled: true },
  },
  colors: CHART_COLORS,
  grid: { borderColor: 'rgba(148,163,184,0.12)' },
  tooltip: { theme: 'dark' },
  dataLabels: { enabled: false },
  legend: { labels: { colors: '#94a3b8' } },
  stroke: type === 'line' || type === 'area' ? { curve: 'smooth' } : {},
});

export default function ApexChart({ type, series, options = {}, height = 280 }) {
  return (
    <div style={{ height }} className="w-full">
      {hasData(series) && (
        <Chart type={type} series={series} options={deepMerge(darkDefaults(type), options)} height={height} width="100%" />
      )}
    </div>
  );
}
