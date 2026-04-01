import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#9ca3af'];

interface OutcomeDistributionChartProps {
  distribution: {
    active: { count: number; percentage: number };
    completed: { count: number; percentage: number };
    expired: { count: number; percentage: number };
    withdrawn: { count: number; percentage: number };
  };
  height?: number;
}

export function OutcomeDistributionChart({ distribution, height = 260 }: OutcomeDistributionChartProps) {
  const data = [
    { name: 'Active', value: distribution.active.count },
    { name: 'Completed', value: distribution.completed.count },
    { name: 'Expired', value: distribution.expired.count },
    { name: 'Withdrawn', value: distribution.withdrawn.count },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
