import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ProcessingQuality } from '../../api/types';

interface ProcessingQualityChartProps {
  data: ProcessingQuality['bySource'];
  height?: number;
}

export function ProcessingQualityChart({ data, height = 300 }: ProcessingQualityChartProps) {
  const chartData = data.map((d) => ({
    source: d.source,
    Matched: d.breakdown?.matched?.count ?? 0,
    'Zero Match': d.breakdown?.zero_match?.count ?? 0,
    Duplicate: d.breakdown?.duplicate?.count ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Matched" stackId="a" fill="#22c55e" />
        <Bar dataKey="Zero Match" stackId="a" fill="#f59e0b" />
        <Bar dataKey="Duplicate" stackId="a" fill="#9ca3af" />
      </BarChart>
    </ResponsiveContainer>
  );
}
