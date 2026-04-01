import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HotspotChartProps {
  data: {
    facilityId: string;
    onTrack: { count: number; percentage: number };
    atRisk: { count: number; percentage: number };
    nonCompliant: { count: number; percentage: number };
  }[];
  height?: number;
}

export function RiskHotspotChart({ data, height = 250 }: HotspotChartProps) {
  const chartData = data.map((d) => ({
    facility: d.facilityId,
    'On Track': d.onTrack.count,
    'At Risk': d.atRisk.count,
    'Non-Compliant': d.nonCompliant.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="facility" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
        <Tooltip />
        <Legend />
        <Bar dataKey="On Track" stackId="a" fill="#22c55e" />
        <Bar dataKey="At Risk" stackId="a" fill="#f59e0b" />
        <Bar dataKey="Non-Compliant" stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
