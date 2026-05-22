'use client';

import React, { useSyncExternalStore } from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { BarGroup } from '@visx/shape';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';

const DEFAULT_COLORS = { emerald: '#10b981', emeraldLight: '#6ee7b7', emeraldPale: '#a7f3d0', muted: '#64748b', grid: '#e2e8f0', text: '#0f172a' };

function getColors() {
    if (typeof document === 'undefined') {
        return DEFAULT_COLORS;
    }
    const s = getComputedStyle(document.documentElement);
    return {
        emerald: '#10b981',
        emeraldLight: '#6ee7b7',
        emeraldPale: '#a7f3d0',
        muted: s.getPropertyValue('--muted-foreground').trim() || '#64748b',
        grid: s.getPropertyValue('--border').trim() || '#e2e8f0',
        text: s.getPropertyValue('--foreground').trim() || '#0f172a',
    };
}

const keys = ['applicants', 'assessments', 'interviews'];
const colorRange = ['#10b981', '#6ee7b7', '#a7f3d0'];

// Colors are read as a JSON string so the snapshot is stable between renders. The server snapshot is the
// default palette, which keeps hydration matching the server HTML; the real palette is read after mount.
const subscribeColors = (onChange) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
};
const getColorsSnapshot = () => JSON.stringify(getColors());
const getServerColorsSnapshot = () => JSON.stringify(DEFAULT_COLORS);

function InnerChart({ width, height, data, margin = { top: 10, right: 10, bottom: 40, left: 40 } }) {
    const colors = JSON.parse(useSyncExternalStore(subscribeColors, getColorsSnapshot, getServerColorsSnapshot));

    const innerW = Math.max(width - margin.left - margin.right, 10);
    const innerH = Math.max(height - margin.top - margin.bottom, 10);

    const dateScale = scaleBand({
        domain: data.map(d => d.label),
        padding: 0.2,
        range: [0, innerW],
    });

    const valueScale = scaleLinear({
        domain: [0, Math.max(...data.map(d => Math.max(d.applicants, d.assessments, d.interviews))) + 5],
        range: [innerH, 0],
        nice: true,
    });

    const colorScale = scaleOrdinal({
        domain: keys,
        range: colorRange,
    });

    return (
        <svg width={width} height={height}>
            <Group left={margin.left} top={margin.top}>
                {valueScale.ticks(5).map(tick => (
                    <line
                        key={tick}
                        x1={0}
                        x2={innerW}
                        y1={valueScale(tick)}
                        y2={valueScale(tick)}
                        stroke={colors.grid}
                        strokeWidth={1}
                        strokeDasharray="4"
                    />
                ))}
                <BarGroup
                    data={data}
                    keys={keys}
                    height={innerH}
                    x0={d => d.label}
                    x0Scale={dateScale}
                    x1Scale={scaleBand({ domain: keys, padding: 0.1, range: [0, dateScale.bandwidth()] })}
                    yScale={valueScale}
                    color={colorScale}
                >
                    {barGroups =>
                        barGroups.map(barGroup => (
                            <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
                                {barGroup.bars.map(bar => (
                                    <rect
                                        key={`${barGroup.index}-${bar.key}-${bar.value}`}
                                        x={bar.x}
                                        y={bar.y}
                                        width={bar.width}
                                        height={bar.height}
                                        fill={bar.color}
                                        rx={3}
                                        className="transition-opacity hover:opacity-80"
                                    />
                                ))}
                            </Group>
                        ))
                    }
                </BarGroup>
                <AxisBottom
                    scale={dateScale}
                    top={innerH}
                    tickLabelProps={() => ({
                        fill: colors.muted,
                        fontSize: 10,
                        fontWeight: 600,
                        textAnchor: 'middle',
                    })}
                    stroke={colors.grid}
                    tickStroke={colors.grid}
                />
                <AxisLeft
                    scale={valueScale}
                    tickLabelProps={() => ({
                        fill: colors.muted,
                        fontSize: 10,
                        fontWeight: 600,
                        dx: -4,
                    })}
                    stroke={colors.grid}
                    tickStroke={colors.grid}
                    numTicks={5}
                />
            </Group>
        </svg>
    );
}

export default function BarChart({ data }) {
    return (
        <ParentSize>
            {({ width, height }) => (
                <InnerChart width={width} height={height} data={data} />
            )}
        </ParentSize>
    );
}
