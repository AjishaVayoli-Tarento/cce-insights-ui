import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '../../utils/colors';

interface ResourceTypeBarChartProps {
  data: { resourceType: string; count: number; percentage: number }[];
  height?: number;
}

export function ResourceTypeBarChart({ data, height = 300 }: ResourceTypeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="resourceType" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS.resourceTypes[i % CHART_COLORS.resourceTypes.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
