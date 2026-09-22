import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toast } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { RequestsPage } from './pages/RequestsPage';
import { DocumentTypesPage } from './pages/DocumentTypesPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { RequestWizard } from './modals/RequestWizard';
import type { RequestWizardResult } from './modals/RequestWizard';
import { RequestDetailDrawer } from './modals/RequestDetailDrawer';
import { DocumentTypeDrawer } from './modals/DocumentTypeDrawer';
import { OrganizationDrawer } from './modals/OrganizationDrawer';
import { AddOrganizationModal } from './modals/AddOrganizationModal';
import type { NewOrganizationResult } from './modals/AddOrganizationModal';
import { initialRequests, documentTypes as initialDocumentTypes, organizations as initialOrganizations } from './data';
import type { DocumentRequest, DocumentType, Organization, PageKey, RequestStatus } from './types';

export default function App() {
  const [active, setActive] = useState<PageKey>('Documentaanvragen');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);
  const [toast, setToast] = useState('');

  const [requests, setRequests] = useState<DocumentRequest[]>(initialRequests);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);

  const [showWizard, setShowWizard] = useState(false);
  const [showAddOrganization, setShowAddOrganization] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<DocumentRequest | null>(null);
  const [viewingType, setViewingType] = useState<DocumentType | null>(null);
  const [viewingOrganization, setViewingOrganization] = useState<Organization | null>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }

  function navigate(page: PageKey) {
    setActive(page);
    setMobileOpen(false);
  }

  function handleWizardSubmit(result: RequestWizardResult) {
    const newRequest: DocumentRequest = {
      id: crypto.randomUUID(),
      customer: result.customer,
      type: result.type,
      provider: result.provider,
      date: 'Vandaag',
      status: 'Aangeleverd',
      tone: 'slate',
      exampleCount: result.exampleCount,
      fields: result.fields,
    };
    setRequests((current) => [newRequest, ...current]);
    setShowWizard(false);
    navigate('Documentaanvragen');
    notify(`Nieuwe documentaanvraag voor ${result.customer} toegevoegd`);
  }

  function handleToggleLive(id: string, live: boolean) {
    setDocumentTypes((current) => current.map((item) => (item.id === id ? { ...item, live } : item)));
    setViewingType((current) => (current && current.id === id ? { ...current, live } : current));
    const item = documentTypes.find((type) => type.id === id);
    if (item) {
      notify(`${item.name} · ${item.provider} is nu ${live ? 'live' : 'in inleren'}`);
    }
  }

  function handleToggleStatusFilter(label: RequestStatus) {
    setStatusFilter((current) => (current === label ? null : label));
  }

  function handleAddOrganization(result: NewOrganizationResult) {
    setOrganizations((current) => [
      { id: crypto.randomUUID(), name: result.name, activeTypes: 0, lastActivity: 'Vandaag' },
      ...current,
    ]);
    setShowAddOrganization(false);
    notify(`${result.name} toegevoegd aan je werkruimte`);
  }

  function renderPage() {
    switch (active) {
      case 'Dashboard':
        return <DashboardPage requests={requests} onAddRequest={() => setShowWizard(true)} onNavigate={navigate} />;
      case 'Documenttypes':
        return (
          <DocumentTypesPage
            types={documentTypes}
            onAdd={() => setShowWizard(true)}
            onView={setViewingType}
            onToggleLive={handleToggleLive}
          />
        );
      case 'Organisaties':
        return (
          <OrganizationsPage
            organizations={organizations}
            onAdd={() => setShowAddOrganization(true)}
            onView={setViewingOrganization}
          />
        );
      case 'Documentaanvragen':
      default:
        return (
          <RequestsPage
            requests={requests}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onToggleStatusFilter={handleToggleStatusFilter}
            onAddRequest={() => setShowWizard(true)}
            onViewRequest={setViewingRequest}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} mobileOpen={mobileOpen} requestCount={requests.length} onNavigate={navigate} />

      <main className="main-content">
        <Topbar active={active} onToggleMobileNav={() => setMobileOpen((open) => !open)} />
        <div className="page-wrap" key={active}>
          {renderPage()}
        </div>
      </main>

      {showWizard && <RequestWizard onClose={() => setShowWizard(false)} onSubmit={handleWizardSubmit} />}
      {showAddOrganization && (
        <AddOrganizationModal onClose={() => setShowAddOrganization(false)} onSubmit={handleAddOrganization} />
      )}
      {viewingRequest && <RequestDetailDrawer request={viewingRequest} onClose={() => setViewingRequest(null)} />}
      {viewingType && (
        <DocumentTypeDrawer
          documentType={viewingType}
          onClose={() => setViewingType(null)}
          onToggleLive={handleToggleLive}
        />
      )}
      {viewingOrganization && (
        <OrganizationDrawer organization={viewingOrganization} onClose={() => setViewingOrganization(null)} />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}
