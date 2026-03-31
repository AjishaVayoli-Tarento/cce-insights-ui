import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '../../utils/colors';

interface EventTrendChartProps {
  data: { period: string; total: number; byResourceType: Record<string, number> }[];
  height?: number;
}

export function EventTrendChart({ data, height = 280 }: EventTrendChartProps) {
  const resourceTypes = data.length > 0
    ? Object.keys(data[0].byResourceType)
    : [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
        <Tooltip />
        <Legend />
        {resourceTypes.map((rt, i) => (
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
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
