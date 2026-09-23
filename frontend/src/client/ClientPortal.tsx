import { useEffect, useState } from 'react';
import { ClientSidebar } from './ClientSidebar';
import { ClientDocumentsPage } from './ClientDocumentsPage';
import { ClientTypeDrawer } from './ClientTypeDrawer';
import { ClientTypeWizard } from './ClientTypeWizard';
import { MyOrganizationPage } from './MyOrganizationPage';
import { HelpPage } from './HelpPage';
import type { ClientPageKey } from './types';
import { Topbar } from '../components/Topbar';
import { Toast } from '../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { listDocumentTypes } from '../api/documentTypes';
import { getMyOrganization } from '../api/organizations';
import { ApiError } from '../api/client';
import type { DocumentType, Organization } from '../types';

export function ClientPortal() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<ClientPageKey>('Documenten');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrganization, setLoadingOrganization] = useState(true);

  const [showWizard, setShowWizard] = useState(false);
  const [viewingType, setViewingType] = useState<DocumentType | null>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }

  useEffect(() => {
    listDocumentTypes()
      .then(setDocumentTypes)
      .catch((err) => notify(err instanceof ApiError ? err.message : 'Kon documenttypes niet laden.'))
      .finally(() => setLoadingTypes(false));
    getMyOrganization()
      .then(setOrganization)
      .catch((err) => notify(err instanceof ApiError ? err.message : 'Kon organisatiegegevens niet laden.'))
      .finally(() => setLoadingOrganization(false));
  }, []);

  // Auto-refresh: laat de status/voortgang live bijwerken zonder handmatig herladen.
  useEffect(() => {
    const interval = window.setInterval(() => {
      listDocumentTypes()
        .then((result) => {
          setDocumentTypes(result);
          setViewingType((current) => (current ? result.find((type) => type.id === current.id) ?? current : current));
        })
        .catch(() => {});
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  function navigate(page: ClientPageKey) {
    setActive(page);
    setMobileOpen(false);
  }

  function handleSubmitted(type: DocumentType) {
    setDocumentTypes((current) => [type, ...current]);
    setOrganization((current) => (current ? { ...current, documentTypeCount: current.documentTypeCount + 1 } : current));
    setShowWizard(false);
    notify(`${type.name} · ${type.provider} aangeleverd`);
  }

  function handleDocumentCountChange(typeId: number, count: number) {
    setDocumentTypes((current) => current.map((type) => (type.id === typeId ? { ...type, examples: count } : type)));
    setViewingType((current) => (current && current.id === typeId ? { ...current, examples: count } : current));
  }

  function renderPage() {
    switch (active) {
      case 'Mijn organisatie':
        return <MyOrganizationPage organization={organization} loading={loadingOrganization} />;
      case 'Hulp':
        return <HelpPage />;
      case 'Documenten':
      default:
        return (
          <ClientDocumentsPage
            types={documentTypes}
            loading={loadingTypes}
            onAdd={() => setShowWizard(true)}
            onView={setViewingType}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <ClientSidebar
        active={active}
        mobileOpen={mobileOpen}
        organizationName={user?.organizationName ?? 'Klantportaal'}
        onNavigate={navigate}
      />

      <main className="main-content">
        <Topbar
          active={active}
          onToggleMobileNav={() => setMobileOpen((open) => !open)}
          onLogout={logout}
        />
        <div className="page-wrap" key={active}>
          {renderPage()}
        </div>
      </main>

      {showWizard && <ClientTypeWizard onClose={() => setShowWizard(false)} onSubmitted={handleSubmitted} />}
      {viewingType && (
        <ClientTypeDrawer
          documentType={viewingType}
          onClose={() => setViewingType(null)}
          onDocumentCountChange={handleDocumentCountChange}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}
