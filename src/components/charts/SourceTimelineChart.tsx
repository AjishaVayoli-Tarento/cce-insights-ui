import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface TrendPoint {
  period: string;
  total: number;
}

interface SourceTimelineChartProps {
  sourceA: string;
  sourceB: string;
  trendsA: TrendPoint[];
  trendsB: TrendPoint[];
  height?: number;
}

export function SourceTimelineChart({ sourceA, sourceB, trendsA, trendsB, height = 320 }: SourceTimelineChartProps) {
  const periodMap = new Map<string, { period: string; a: number; b: number }>();

  for (const t of trendsA) {
    periodMap.set(t.period, { period: t.period, a: t.total, b: 0 });
  }
  for (const t of trendsB) {
    const existing = periodMap.get(t.period);
    if (existing) {
      existing.b = t.total;
    } else {
      periodMap.set(t.period, { period: t.period, a: 0, b: t.total });
    }
  }

  const merged = Array.from(periodMap.values()).sort((x, y) => x.period.localeCompare(y.period));

  if (merged.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No trend data available for the selected sources.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={merged} barGap={2} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="a" name={sourceA} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="b" name={sourceB} fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
