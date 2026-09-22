import type { ReactNode } from 'react';
import type { Tone } from '../types';

interface StatusPillProps {
  tone: Tone;
  children: ReactNode;
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span className={`status-pill status-${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
