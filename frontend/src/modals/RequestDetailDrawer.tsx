import { Check } from 'lucide-react';
import { Drawer } from '../components/Drawer';
import { StatusPill } from '../components/StatusPill';
import { STAGE_ORDER } from '../data';
import type { DocumentRequest } from '../types';

interface RequestDetailDrawerProps {
  request: DocumentRequest;
  onClose: () => void;
}

export function RequestDetailDrawer({ request, onClose }: RequestDetailDrawerProps) {
  const currentIndex = STAGE_ORDER.indexOf(request.status);

  return (
    <Drawer title={request.customer} eyebrow={`${request.provider} · ${request.type}`} onClose={onClose}>
      <div className="drawer-summary">
        <div>
          <span>Aangeleverd</span>
          <strong>{request.date}</strong>
        </div>
        <div>
          <span>Voorbeelden</span>
          <strong>{request.exampleCount} documenten</strong>
        </div>
        <div>
          <span>Status</span>
          <StatusPill tone={request.tone}>{request.status}</StatusPill>
        </div>
      </div>

      <h3 className="drawer-subheading">Voortgang</h3>
      <ol className="progress-timeline">
        {STAGE_ORDER.map((label, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
          return (
            <li key={label} className={state}>
              <span className="progress-marker">{state === 'done' ? <Check size={12} /> : index + 1}</span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      <h3 className="drawer-subheading">Gewenste velden</h3>
      <div className="field-chip-list">
        {request.fields.map((field) => (
          <span className="field-chip" key={field}>
            {field}
          </span>
        ))}
      </div>
    </Drawer>
  );
}
