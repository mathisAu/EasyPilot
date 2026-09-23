import { Eye, Plus, Trash2 } from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import type { Organization } from '../types';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

interface OrganizationsPageProps {
  organizations: Organization[];
  onAdd: () => void;
  onView: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
}

export function OrganizationsPage({ organizations, onAdd, onView, onDelete }: OrganizationsPageProps) {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Werkruimte</p>
          <h1>Organisaties</h1>
          <p className="page-description">Klanten en hun actieve documentverwerking.</p>
        </div>
        <button className="primary-button" onClick={onAdd}>
          <Plus size={18} /> Organisatie toevoegen
        </button>
      </section>

      <section className="organization-list">
        {organizations.map((organization) => (
          <div className="organization-row" key={organization.id}>
            <span className="organization-avatar">{initials(organization.name)}</span>
            <div>
              <strong>{organization.name}</strong>
              <small>
                {organization.documentTypeCount} actieve documenttypes · Login: {organization.customerUsername ?? '—'}
              </small>
            </div>
            <StatusPill tone="green">Actief</StatusPill>
            <button className="row-action" onClick={() => onView(organization)} aria-label={`Bekijk ${organization.name}`} title="Bekijken">
              <Eye size={16} />
            </button>
            {organization.customerUsername && (
              <button
                className="row-action row-action-danger"
                onClick={() => onDelete(organization)}
                aria-label={`Verwijder account ${organization.customerUsername}`}
                title="Account permanent verwijderen"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
