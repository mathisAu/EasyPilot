import { Drawer } from '../components/Drawer';
import { StatusPill } from '../components/StatusPill';
import type { Organization } from '../types';

interface OrganizationDrawerProps {
  organization: Organization;
  onClose: () => void;
}

export function OrganizationDrawer({ organization, onClose }: OrganizationDrawerProps) {
  return (
    <Drawer title={organization.name} eyebrow="Organisatie" onClose={onClose}>
      <div className="drawer-summary">
        <div>
          <span>Actieve documenttypes</span>
          <strong>{organization.documentTypeCount}</strong>
        </div>
        <div>
          <span>Klantportaal-login</span>
          <strong>{organization.customerUsername ?? '—'}</strong>
        </div>
        <div>
          <span>Status</span>
          <StatusPill tone="green">Actief</StatusPill>
        </div>
      </div>
    </Drawer>
  );
}
