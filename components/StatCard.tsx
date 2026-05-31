interface StatCardProps {
  label: string;
  value: string;
  valueSize?: number;
  labelSize?: number;
  testId?: string;
}

export function StatCard({ label, value, valueSize = 40, labelSize = 13, testId }: StatCardProps) {
  return (
    <div data-testid={testId} style={{ textAlign: "center" }}>
      <div style={{ fontSize: valueSize, color: "var(--accent)" }}>{value}</div>
      <div style={{ fontSize: labelSize, color: "var(--text)" }}>{label}</div>
    </div>
  );
}
