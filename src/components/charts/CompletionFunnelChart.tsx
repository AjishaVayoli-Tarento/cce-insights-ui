import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../utils/colors';

interface CompletionFunnelChartProps {
  data: { actionId: string; reachedCount: number; completedCount: number; completionRate: number }[];
  height?: number;
}

export function CompletionFunnelChart({ data, height = 280 }: CompletionFunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="actionId" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Bar dataKey="reachedCount" fill={CHART_COLORS.muted} name="Reached" radius={[0, 4, 4, 0]} />
        <Bar dataKey="completedCount" fill={CHART_COLORS.primary} name="Completed" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
