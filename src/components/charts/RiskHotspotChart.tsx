import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HotspotChartProps {
  data: {
    facilityId: string;
    facilityName?: string;
    onTrack: { count: number; percentage: number };
    atRisk: { count: number; percentage: number };
    nonCompliant: { count: number; percentage: number };
  }[];
  height?: number;
}

export function RiskHotspotChart({ data, height = 250 }: HotspotChartProps) {
  const chartData = data.map((d) => ({
    facility: d.facilityName ?? d.facilityId,
    'Compliant': d.onTrack.count,
    'Non-Compliant': d.atRisk.count + d.nonCompliant.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="facility" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Compliant" stackId="a" fill="#22c55e" />
        <Bar dataKey="Non-Compliant" stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
