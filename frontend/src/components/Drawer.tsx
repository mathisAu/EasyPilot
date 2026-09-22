import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ title, eyebrow, onClose, children }: DrawerProps) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2>{title}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}
