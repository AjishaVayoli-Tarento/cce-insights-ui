import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface IngestionFunnelChartProps {
  data: { status: string; count: number; percentage: number }[];
  height?: number;
}

const STATUS_COLORS: Record<string, string> = {
  accepted: '#22c55e',
  rejected: '#ef4444',
  duplicate: '#9ca3af',
};

const ALL_STATUSES = ['ACCEPTED', 'DUPLICATE', 'REJECTED'];

export function IngestionFunnelChart({ data, height = 260 }: IngestionFunnelChartProps) {
  // Always show all 3 bars; statuses with zero events are missing from the API response
  const normalized = ALL_STATUSES.map((status) => {
    const found = data.find((d) => d.status.toUpperCase() === status);
    return found ?? { status, count: 0, percentage: 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={normalized}>
        <XAxis dataKey="status" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
        <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
          {normalized.map((entry, i) => (
            <Cell key={i} fill={STATUS_COLORS[entry.status.toLowerCase()] || '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
