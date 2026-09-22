import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toast } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { RequestsPage } from './pages/RequestsPage';
import { DocumentTypesPage } from './pages/DocumentTypesPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { LoginPage } from './pages/LoginPage';
import { RequestWizard } from './modals/RequestWizard';
import type { RequestWizardResult } from './modals/RequestWizard';
import { RequestDetailDrawer } from './modals/RequestDetailDrawer';
import { DocumentTypeDrawer } from './modals/DocumentTypeDrawer';
import { DocumentTypeFormModal } from './modals/DocumentTypeFormModal';
import { OrganizationDrawer } from './modals/OrganizationDrawer';
import { AddOrganizationModal } from './modals/AddOrganizationModal';
import { ClientPortal } from './client/ClientPortal';
import { initialRequests } from './data';
import type { DocumentRequest, DocumentType, Organization, PageKey, RequestStatus } from './types';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { listDocumentTypes, updateDocumentType, deleteDocumentType } from './api/documentTypes';
import { listOrganizations } from './api/organizations';
import { ApiError } from './api/client';

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <p>Bezig met laden...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === 'CUSTOMER') {
    return <ClientPortal />;
  }

  return <AppShell />;
}

function AppShell() {
  const { logout } = useAuth();
  const [active, setActive] = useState<PageKey>('Documentaanvragen');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);
  const [toast, setToast] = useState('');

  const [requests, setRequests] = useState<DocumentRequest[]>(initialRequests);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [showWizard, setShowWizard] = useState(false);
  const [showAddOrganization, setShowAddOrganization] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<DocumentType | null>(null);
  const [viewingRequest, setViewingRequest] = useState<DocumentRequest | null>(null);
  const [viewingType, setViewingType] = useState<DocumentType | null>(null);
  const [viewingOrganization, setViewingOrganization] = useState<Organization | null>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }

  useEffect(() => {
    listDocumentTypes()
      .then(setDocumentTypes)
      .catch((err) => notify(err instanceof ApiError ? err.message : 'Kon documenttypes niet laden.'));
    listOrganizations()
      .then(setOrganizations)
      .catch((err) => notify(err instanceof ApiError ? err.message : 'Kon organisaties niet laden.'));
  }, []);

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

  async function handleToggleLive(id: number, live: boolean) {
    const item = documentTypes.find((type) => type.id === id);
    if (!item) return;

    try {
      const updated = await updateDocumentType(id, {
        name: item.name,
        provider: item.provider,
        live,
        fields: item.fieldList,
      });
      setDocumentTypes((current) => current.map((type) => (type.id === id ? updated : type)));
      setViewingType((current) => (current && current.id === id ? updated : current));
      notify(`${updated.name} · ${updated.provider} is nu ${live ? 'live' : 'in inleren'}`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Bijwerken is niet gelukt.');
    }
  }

  function handleOpenCreateType() {
    setEditingType(null);
    setShowTypeForm(true);
  }

  function handleOpenEditType(type: DocumentType) {
    setEditingType(type);
    setShowTypeForm(true);
    setViewingType(null);
  }

  function handleTypeSaved(type: DocumentType, mode: 'create' | 'edit') {
    setDocumentTypes((current) => {
      if (mode === 'create') return [type, ...current];
      return current.map((item) => (item.id === type.id ? type : item));
    });
    setShowTypeForm(false);
    notify(mode === 'create' ? `${type.name} · ${type.provider} toegevoegd` : `${type.name} · ${type.provider} bijgewerkt`);
  }

  async function handleDeleteType(id: number) {
    const item = documentTypes.find((type) => type.id === id);
    if (!item) return;
    const confirmed = window.confirm(
      'Weet je zeker dat je dit documenttype wilt verwijderen? Alle bijbehorende documenten worden ook verwijderd.'
    );
    if (!confirmed) return;

    try {
      await deleteDocumentType(id);
      setDocumentTypes((current) => current.filter((type) => type.id !== id));
      setViewingType((current) => (current && current.id === id ? null : current));
      notify(`${item.name} · ${item.provider} verwijderd`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Verwijderen is niet gelukt.');
    }
  }

  function handleDocumentCountChange(typeId: number, count: number) {
    setDocumentTypes((current) => current.map((type) => (type.id === typeId ? { ...type, examples: count } : type)));
    setViewingType((current) => (current && current.id === typeId ? { ...current, examples: count } : current));
  }

  function handleToggleStatusFilter(label: RequestStatus) {
    setStatusFilter((current) => (current === label ? null : label));
  }

  function handleAddOrganization(organization: Organization) {
    setOrganizations((current) => [organization, ...current]);
    setShowAddOrganization(false);
    notify(`${organization.name} toegevoegd aan je werkruimte`);
  }

  function renderPage() {
    switch (active) {
      case 'Dashboard':
        return <DashboardPage requests={requests} onAddRequest={() => setShowWizard(true)} onNavigate={navigate} />;
      case 'Documenttypes':
        return (
          <DocumentTypesPage
            types={documentTypes}
            onAdd={handleOpenCreateType}
            onView={setViewingType}
            onEdit={handleOpenEditType}
            onDelete={handleDeleteType}
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
        <Topbar active={active} onToggleMobileNav={() => setMobileOpen((open) => !open)} onLogout={logout} />
        <div className="page-wrap" key={active}>
          {renderPage()}
        </div>
      </main>

      {showWizard && <RequestWizard onClose={() => setShowWizard(false)} onSubmit={handleWizardSubmit} />}
      {showAddOrganization && (
        <AddOrganizationModal onClose={() => setShowAddOrganization(false)} onSubmit={handleAddOrganization} />
      )}
      {showTypeForm && (
        <DocumentTypeFormModal
          mode={editingType ? 'edit' : 'create'}
          initial={editingType}
          onClose={() => setShowTypeForm(false)}
          onSaved={handleTypeSaved}
        />
      )}
      {viewingRequest && <RequestDetailDrawer request={viewingRequest} onClose={() => setViewingRequest(null)} />}
      {viewingType && (
        <DocumentTypeDrawer
          documentType={viewingType}
          onClose={() => setViewingType(null)}
          onToggleLive={handleToggleLive}
          onEdit={handleOpenEditType}
          onDelete={handleDeleteType}
          onDocumentCountChange={handleDocumentCountChange}
        />
      )}
      {viewingOrganization && (
        <OrganizationDrawer organization={viewingOrganization} onClose={() => setViewingOrganization(null)} />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}
