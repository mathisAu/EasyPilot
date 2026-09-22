import type { LucideIcon } from 'lucide-react';

interface MetricProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  note: string;
  tone?: string;
}

export function Metric({ icon: Icon, label, value, note, tone = '' }: MetricProps) {
  return (
    <div className={`metric-card ${tone ? '' : 'metric-highlight'}`}>
      <div className={`metric-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <small>{note}</small>
    </div>
  );
}
