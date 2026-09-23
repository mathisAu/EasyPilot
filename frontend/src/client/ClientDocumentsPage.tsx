import { ChevronRight, File, FileText, Plus, Sparkles } from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import { toneFor } from '../data';
import type { DocumentType } from '../types';

interface ClientDocumentsPageProps {
  types: DocumentType[];
  loading: boolean;
  onAdd: () => void;
  onView: (type: DocumentType) => void;
}

export function ClientDocumentsPage({ types, loading, onAdd, onView }: ClientDocumentsPageProps) {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Klantportaal</p>
          <h1>Documenten</h1>
          <p className="page-description">Lever nieuwe documenttypes aan of bekijk de status van je documenttypes.</p>
        </div>
        <button className="primary-button" onClick={onAdd}>
          <Plus size={18} /> Nieuw documenttype aanleveren
        </button>
      </section>

      <section className="table-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Overzicht</p>
            <h2>Mijn documenttypes</h2>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Documenttype</th>
                <th>Opdrachtgever</th>
                <th>Document</th>
                <th>Voorbeelden</th>
                <th>Status</th>
                <th aria-label="Acties" />
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id}>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-logo">{type.provider[0]}</span>
                      <strong>{type.name}</strong>
                    </div>
                  </td>
                  <td>{type.provider}</td>
                  <td>
                    {type.latestDocumentFilename ? (
                      <span className="document-cell">
                        <File size={14} />
                        {type.latestDocumentFilename}
                      </span>
                    ) : (
                      <span className="document-cell document-cell-empty">—</span>
                    )}
                  </td>
                  <td>{type.examples}</td>
                  <td>
                    <StatusPill tone={toneFor(type.status)}>{type.status}</StatusPill>
                  </td>
                  <td>
                    <button className="row-action" onClick={() => onView(type)} aria-label={`Bekijk ${type.name}`} title="Bekijken">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && types.length === 0 && (
            <div className="empty-state">
              <FileText size={22} />
              <strong>Nog geen documenttypes aangeleverd</strong>
              <span>Lever je eerste documenttype aan om te starten.</span>
            </div>
          )}
        </div>
      </section>

      <section className="callout">
        <div className="callout-icon">
          <Sparkles size={21} />
        </div>
        <div>
          <strong>Nieuw document laten inleren?</strong>
          <p>Upload een paar voorbeelden en geef aan welke gegevens we eruit moeten halen.</p>
        </div>
        <button className="secondary-button" onClick={onAdd}>
          Nieuw documenttype aanleveren <ChevronRight size={16} />
        </button>
      </section>
    </>
  );
}
