import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '../../utils/colors';

interface EventTrendChartProps {
  data: { period: string; total: number; byResourceType: Record<string, number> }[];
  height?: number;
}

export function EventTrendChart({ data, height = 280 }: EventTrendChartProps) {
  const [view, setView] = useState<'combined' | 'byType'>('combined');
  const resourceTypes = Array.from(
    new Set(data.flatMap((d) => Object.keys(d.byResourceType ?? {})))
  );

  return (
    <div>
      <div className="flex justify-end gap-1 mb-2">
        {(['combined', 'byType'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
              view === v
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {v === 'combined' ? 'Combined' : 'By Resource Type'}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
          <Tooltip />
          <Legend />
          {view === 'combined' ? (
            <Area
              type="monotone"
              dataKey="total"
              fill="#3b82f6"
              stroke="#2563eb"
              fillOpacity={0.3}
              strokeWidth={2}
              name="Total Events"
            />
          ) : (
            resourceTypes.map((rt, i) => (
              <Area
                key={rt}
                type="monotone"
                dataKey={`byResourceType.${rt}`}
                stackId="1"
                fill={CHART_COLORS.resourceTypes[i % CHART_COLORS.resourceTypes.length]}
                stroke={CHART_COLORS.resourceTypes[i % CHART_COLORS.resourceTypes.length]}
                fillOpacity={0.6}
                name={rt}
              />
            ))
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
