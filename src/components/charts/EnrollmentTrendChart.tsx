import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../utils/colors';

interface EnrollmentTrendChartProps {
  data: { period: string; enrollments: number }[];
  height?: number;
}

export function EnrollmentTrendChart({ data, height = 260 }: EnrollmentTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip />
        <Line type="monotone" dataKey="enrollments" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
