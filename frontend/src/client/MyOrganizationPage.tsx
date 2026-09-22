import { Building2, FileCheck2, User } from 'lucide-react';
import { Metric } from '../components/Metric';
import type { Organization } from '../types';

interface MyOrganizationPageProps {
  organization: Organization | null;
  loading: boolean;
}

export function MyOrganizationPage({ organization, loading }: MyOrganizationPageProps) {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Klantportaal</p>
          <h1>Mijn organisatie</h1>
          <p className="page-description">Gegevens van jouw organisatie binnen EasyPilot.</p>
        </div>
      </section>

      {loading && <p>Bezig met laden...</p>}

      {!loading && organization && (
        <>
          <section className="metrics-grid" aria-label="Organisatiegegevens">
            <Metric icon={Building2} label="Organisatie" value={organization.name} note="Jouw werkruimte" />
            <Metric
              icon={FileCheck2}
              label="Actieve documenttypes"
              value={organization.documentTypeCount}
              note="Aangeleverd bij EasyPilot"
              tone="blue"
            />
            <Metric
              icon={User}
              label="Klantportaal-login"
              value={organization.customerUsername ?? '—'}
              note="Gebruikt om in te loggen"
              tone="amber"
            />
          </section>

          <section className="table-section">
            <div className="section-title">
              <div>
                <p className="eyebrow">Details</p>
                <h2>Organisatiegegevens</h2>
              </div>
            </div>
            <div className="drawer-summary">
              <div>
                <span>Naam</span>
                <strong>{organization.name}</strong>
              </div>
              <div>
                <span>Klant sinds</span>
                <strong>{new Date(organization.createdAt).toLocaleDateString('nl-NL')}</strong>
              </div>
              <div>
                <span>Documenttypes</span>
                <strong>{organization.documentTypeCount}</strong>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
