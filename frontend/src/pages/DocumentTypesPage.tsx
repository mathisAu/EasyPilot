import { ChevronRight, Plus } from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import { Toggle } from '../components/Toggle';
import type { DocumentType } from '../types';

interface DocumentTypesPageProps {
  types: DocumentType[];
  onAdd: () => void;
  onView: (type: DocumentType) => void;
  onToggleLive: (id: string, live: boolean) => void;
}

export function DocumentTypesPage({ types, onAdd, onView, onToggleLive }: DocumentTypesPageProps) {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Configuratie</p>
          <h1>Documenttypes</h1>
          <p className="page-description">Leer, test en beheer de documenttypes van je klanten.</p>
        </div>
        <button className="primary-button" onClick={onAdd}>
          <Plus size={18} /> Nieuw documenttype
        </button>
      </section>

      <section className="type-grid">
        {types.map((item) => (
          <article className="type-card" key={item.id}>
            <div className="type-card-top">
              <span className="customer-logo">{item.provider[0]}</span>
              <div className="type-card-switch">
                <Toggle
                  checked={item.live}
                  onChange={(checked) => onToggleLive(item.id, checked)}
                  label={`${item.name} ${item.provider} live zetten`}
                />
                <StatusPill tone={item.live ? 'green' : 'amber'}>{item.live ? 'Live' : 'Inleren'}</StatusPill>
              </div>
            </div>
            <h2>{item.name}</h2>
            <p>{item.provider}</p>
            <div className="type-stats">
              <span>
                <strong>{item.examples}</strong> voorbeelden
              </span>
              <span>
                <strong>{item.fieldList.length}</strong> velden
              </span>
            </div>
            <button className="text-button" onClick={() => onView(item)}>
              Openen <ChevronRight size={16} />
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
