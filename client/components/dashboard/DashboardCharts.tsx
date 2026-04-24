'use client';

import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './dashboard-charts.css';

export type ApplicationVolumeRange = '7d' | '30d' | '90d';

export type ApplicationVolumePoint = {
  label: string;
  candidates: number;
};

export type ShortlistRolePoint = {
  abbrev: string;
  roleTitle: string;
  shortlisted: number;
};

const ACCENT = '#6b4eff';

const RANGE_OPTIONS: ApplicationVolumeRange[] = ['7d', '30d', '90d'];

function AreaVolumeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: ApplicationVolumePoint }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="chart-tooltip chart-tooltip--area">
      <p className="chart-tooltip__line">{row.label}</p>
      <p className="chart-tooltip__line chart-tooltip__line--strong">
        {row.candidates} Candidates
      </p>
    </div>
  );
}

function ShortlistTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: ShortlistRolePoint }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="chart-tooltip chart-tooltip--bar">
      <p className="chart-tooltip__line chart-tooltip__line--strong">
        {row.roleTitle} {row.shortlisted}
      </p>
    </div>
  );
}

export function DashboardCharts({
  volumeSeries,
  shortlistByRole,
}: {
  volumeSeries: Record<ApplicationVolumeRange, ApplicationVolumePoint[]>;
  shortlistByRole: ShortlistRolePoint[];
}) {
  const [volumeRange, setVolumeRange] = useState<ApplicationVolumeRange>('7d');
  const volumeData = volumeSeries[volumeRange];

  const areaMax = useMemo(() => {
    if (!volumeData.length) return 40;
    const m = Math.max(10, ...volumeData.map((d) => d.candidates));
    return Math.ceil(m / 10) * 10;
  }, [volumeData]);

  return (
    <div className="charts-grid">
      <div className="chart-card chart-card--chart">
        <div className="chart-toolbar">
          <div>
            <h3 className="chart-title">Application Volume trend</h3>
            <p className="chart-subtitle">Candidates screened per day</p>
          </div>
          <div className="chart-range-toggle" role="tablist" aria-label="Time range">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={volumeRange === r}
                className={`chart-range-btn ${volumeRange === r ? 'is-active' : ''}`}
                onClick={() => setVolumeRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-recharts-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="applicationVolumeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[0, areaMax]}
                ticks={Array.from({ length: areaMax / 10 + 1 }, (_, i) => i * 10)}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                content={<AreaVolumeTooltip />}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="candidates"
                name="Candidates"
                stroke={ACCENT}
                strokeWidth={2}
                fill="url(#applicationVolumeFill)"
                activeDot={{ r: 5, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card chart-card--chart">
        <h3 className="chart-title">Shortlist volume by role</h3>
        <p className="chart-subtitle">Top candidates shortlisted per job.</p>
        <div className="chart-recharts-wrap chart-recharts-wrap--bar">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shortlistByRole} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="abbrev"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[0, 50]}
                ticks={[0, 10, 20, 30, 40, 50]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                content={<ShortlistTooltip />}
                cursor={{ fill: 'rgba(107, 78, 255, 0.06)' }}
                isAnimationActive={false}
              />
              <Bar dataKey="shortlisted" name="Shortlisted" fill={ACCENT} radius={[0, 0, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
