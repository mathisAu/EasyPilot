import { Drawer } from '../components/Drawer';
import { StatusPill } from '../components/StatusPill';
import type { Organization } from '../types';

interface OrganizationDrawerProps {
  organization: Organization;
  onClose: () => void;
}

function formatAddress(organization: Organization): string | null {
  const cityLine = [organization.postalCode, organization.city].filter(Boolean).join(' ');
  const parts = [organization.address, cityLine].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

export function OrganizationDrawer({ organization, onClose }: OrganizationDrawerProps) {
  const details: [string, string | null][] = [
    ['Adres', formatAddress(organization)],
    ['KvK-nummer', organization.kvkNumber],
    ['Btw-nummer', organization.vatNumber],
    ['Website', organization.website],
    ['Contactpersoon', organization.contactName],
    ['E-mail', organization.contactEmail],
    ['Telefoon', organization.contactPhone],
  ];

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

      <h3 className="drawer-subheading">Bedrijfs- en contactgegevens</h3>
      <dl className="org-detail-list">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={value ? '' : 'empty'}>{value ?? 'Niet ingevuld'}</dd>
          </div>
        ))}
      </dl>
      <p className="hint-text">Deze gegevens beheert de klant zelf onder "Mijn organisatie".</p>
    </Drawer>
  );
}
