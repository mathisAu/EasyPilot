import { Drawer } from '../components/Drawer';
import { StatusPill } from '../components/StatusPill';
import { Toggle } from '../components/Toggle';
import type { DocumentType } from '../types';

interface DocumentTypeDrawerProps {
  documentType: DocumentType;
  onClose: () => void;
  onToggleLive: (id: string, live: boolean) => void;
}

export function DocumentTypeDrawer({ documentType, onClose, onToggleLive }: DocumentTypeDrawerProps) {
  return (
    <Drawer title={documentType.name} eyebrow={documentType.provider} onClose={onClose}>
      <div className="drawer-summary">
        <div>
          <span>Voorbeelden</span>
          <strong>{documentType.examples} documenten</strong>
        </div>
        <div>
          <span>Velden</span>
          <strong>{documentType.fieldList.length} velden</strong>
        </div>
        <div>
          <span>Status</span>
          <StatusPill tone={documentType.live ? 'green' : 'amber'}>
            {documentType.live ? 'Live' : 'Inleren'}
          </StatusPill>
        </div>
      </div>

      <div className="drawer-toggle-row">
        <div>
          <strong>Documenttype live zetten</strong>
          <small>Zet dit documenttype aan of uit voor automatische verwerking.</small>
        </div>
        <Toggle
          checked={documentType.live}
          onChange={(checked) => onToggleLive(documentType.id, checked)}
          label={`${documentType.name} live zetten`}
        />
      </div>

      <h3 className="drawer-subheading">Uitgelezen velden</h3>
      <div className="field-chip-list">
        {documentType.fieldList.map((field) => (
          <span className="field-chip" key={field}>
            {field}
          </span>
        ))}
      </div>
    </Drawer>
  );
}
