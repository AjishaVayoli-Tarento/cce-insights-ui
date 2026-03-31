interface StatusBadgeProps {
  label: string;
  color: { bg: string; text: string; dot?: string };
}

export function StatusBadge({ label, color }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}>
      {color.dot && <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />}
      {label}
    </span>
  );
}
