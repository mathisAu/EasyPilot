import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import { toneFor } from '../data';
import type { DocumentType } from '../types';

interface DocumentTypesPageProps {
  types: DocumentType[];
  onAdd: () => void;
  onView: (type: DocumentType) => void;
  onEdit: (type: DocumentType) => void;
  onDelete: (id: number) => void;
}

export function DocumentTypesPage({ types, onAdd, onView, onEdit, onDelete }: DocumentTypesPageProps) {
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
              <StatusPill tone={toneFor(item.status)}>{item.status}</StatusPill>
            </div>
            <h2>
              <button type="button" className="type-card-title" onClick={() => onView(item)} title={`${item.name} openen`}>
                {item.name}
              </button>
            </h2>
            <p>{item.provider}</p>
            <div className="type-stats">
              <span>
                <strong>{item.examples}</strong> voorbeelden
              </span>
              <span>
                <strong>{item.fieldList.length}</strong> velden
              </span>
            </div>
            <div className="type-card-actions">
              <button className="text-button" onClick={() => onView(item)}>
                Openen <ChevronRight size={16} />
              </button>
              <button className="row-action" onClick={() => onEdit(item)} aria-label={`Bewerk ${item.name}`} title="Bewerken">
                <Pencil size={16} />
              </button>
              <button className="row-action" onClick={() => onDelete(item.id)} aria-label={`Verwijder ${item.name}`} title="Verwijderen">
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
