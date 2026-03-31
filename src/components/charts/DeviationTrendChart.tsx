import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS } from '../../utils/colors';

interface TrendSparklineProps {
  data: { period: string; overdue: number; missed: number; total: number }[];
  height?: number;
}

export function DeviationTrendChart({ data, height = 280 }: TrendSparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="overdue" stackId="1" fill={CHART_COLORS.warning} stroke={CHART_COLORS.warning} fillOpacity={0.6} name="Overdue" />
        <Area type="monotone" dataKey="missed" stackId="1" fill={CHART_COLORS.danger} stroke={CHART_COLORS.danger} fillOpacity={0.6} name="Missed" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
