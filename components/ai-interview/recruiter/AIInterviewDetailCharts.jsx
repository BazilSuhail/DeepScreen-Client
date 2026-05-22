'use client';

import { useEffect, useRef, useState } from 'react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { IconTile, hintClass } from './AIInterviewDetailUi';

// Five fixed, non-overlapping buckets. Scores are floored into them so 20.5 or 99.9 are never dropped.
const BUCKETS = [
  { label: '0–19', lo: 0, hi: 19 },
  { label: '20–39', lo: 20, hi: 39 },
  { label: '40–59', lo: 40, hi: 59 },
  { label: '60–79', lo: 60, hi: 79 },
  { label: '80–100', lo: 80, hi: 100 },
];

const bucketIndex = (score) => Math.min(BUCKETS.length - 1, Math.max(0, Math.floor(score / 20)));

export function ScoreDistributionChart({ sessions = [], passingScore = 65 }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.floor(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const counts = BUCKETS.map(() => 0);
  sessions.forEach((s) => {
    const score = Number(s?.score ?? s?.overall_score);
    if (Number.isFinite(score)) counts[bucketIndex(score)] += 1;
  });

  const height = 220;
  const margin = { top: 24, right: 8, bottom: 32, left: 32 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const xScale = scaleBand({ domain: BUCKETS.map((b) => b.label), range: [0, innerW], padding: 0.25 });
  const yScale = scaleLinear({ domain: [0, Math.max(...counts, 1)], range: [innerH, 0], nice: true });
  const summary = BUCKETS.map((b, i) => `${b.label}: ${counts[i]}`).join(', ');
  const label = `Candidates per score range. ${summary}`;

  return (
    <div>
      <div ref={containerRef} className="w-full text-emerald-800/70 dark:text-slate-400">
        <svg width={width} height={height} aria-label={label} className="block max-w-full">
          <title>{label}</title>
          <Group left={margin.left} top={margin.top}>
            {BUCKETS.map((b, i) => {
              const x = xScale(b.label);
              const y = yScale(counts[i]);
              const barW = xScale.bandwidth();
              const passes = b.hi >= passingScore;
              return (
                <g key={b.label}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={innerH - y}
                    rx={6}
                    className={passes ? 'fill-emerald-500' : 'fill-red-500'}
                    opacity={counts[i] ? 0.85 : 0.15}
                  />
                  <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={12} fill="currentColor" className="font-mono font-semibold">
                    {counts[i]}
                  </text>
                </g>
              );
            })}
            <AxisBottom
              scale={xScale}
              top={innerH}
              stroke="currentColor"
              strokeOpacity={0.2}
              tickStroke="currentColor"
              tickStrokeOpacity={0.2}
              tickLabelProps={() => ({ fontSize: 11, fill: 'currentColor', textAnchor: 'middle', fontWeight: 600 })}
            />
            <AxisLeft
              scale={yScale}
              numTicks={3}
              stroke="currentColor"
              strokeOpacity={0.2}
              tickStroke="currentColor"
              tickStrokeOpacity={0.2}
              tickLabelProps={() => ({ fontSize: 11, fill: 'currentColor', textAnchor: 'end', dx: -4, dy: 4 })}
            />
          </Group>
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-emerald-800/70 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" aria-hidden="true" /> Range reaches the pass mark ({passingScore}%)</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500" aria-hidden="true" /> Below the pass mark</span>
      </div>
    </div>
  );
}

export function ScoreDistributionCard({ sessions, passingScore }) {
  return (
    <section className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card lg:p-6">
      <div className="mb-5 flex items-center gap-3">
        <IconTile icon={HiOutlineChartBar} tone="emerald" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-emerald-950 dark:text-foreground">Score distribution</h2>
          <p className={hintClass}>How many candidates landed in each score range</p>
        </div>
      </div>
      <ScoreDistributionChart sessions={sessions} passingScore={passingScore} />
    </section>
  );
}

const scoreFill = (score, passingScore) => {
  if (score >= passingScore) return 'fill-emerald-500';
  if (score >= 40) return 'fill-amber-500';
  return 'fill-red-500';
};

export function CriteriaChart({ criteriaScores, passingScore = 65 }) {
  const entries = Object.entries(criteriaScores || {})
    .map(([key, value]) => [key, Number(value)])
    .filter(([, value]) => Number.isFinite(value));
  if (!entries.length) return null;

  const width = 600;
  const height = 260;
  const margin = { top: 24, right: 16, bottom: 56, left: 36 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const labelOf = (key) => key.replace(/_/g, ' ');
  const xScale = scaleBand({ domain: entries.map(([k]) => k), range: [0, innerW], padding: 0.3 });
  const yScale = scaleLinear({ domain: [0, 100], range: [innerH, 0] });
  const summary = entries.map(([k, v]) => `${labelOf(k)}: ${v}`).join(', ');
  const label = `Score for each criterion. ${summary}. Pass mark ${passingScore}.`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      aria-label={label}
      className="block h-auto w-full min-w-[320px] text-emerald-800/70 dark:text-slate-400"
    >
      <title>{label}</title>
      <Group left={margin.left} top={margin.top}>
        {entries.map(([key, score]) => {
          const x = xScale(key);
          const barW = xScale.bandwidth();
          const y = yScale(score);
          const name = labelOf(key);
          return (
            <g key={key}>
              <rect x={x} y={y} width={barW} height={innerH - y} rx={6} className={scoreFill(score, passingScore)} opacity={0.85} />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={13} fill="currentColor" className="font-mono font-semibold">{score}</text>
              <text x={x + barW / 2} y={innerH + 18} textAnchor="middle" fontSize={11} fill="currentColor" className="font-semibold capitalize">
                {name.length > 12 ? `${name.slice(0, 11)}…` : name}
              </text>
            </g>
          );
        })}
        <line
          x1={0}
          x2={innerW}
          y1={yScale(passingScore)}
          y2={yScale(passingScore)}
          stroke="currentColor"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          opacity={0.5}
        />
      </Group>
    </svg>
  );
}
