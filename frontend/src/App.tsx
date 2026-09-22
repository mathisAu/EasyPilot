import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toast } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { RequestsPage } from './pages/RequestsPage';
import { DocumentTypesPage } from './pages/DocumentTypesPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { LoginPage } from './pages/LoginPage';
import { DocumentTypeDrawer } from './modals/DocumentTypeDrawer';
import { DocumentTypeFormModal } from './modals/DocumentTypeFormModal';
import { DocumentReviewModal } from './modals/DocumentReviewModal';
import { OrganizationDrawer } from './modals/OrganizationDrawer';
import { AddOrganizationModal } from './modals/AddOrganizationModal';
import { ClientPortal } from './client/ClientPortal';
import type { DocumentType, Organization, PageKey, RequestStatus } from './types';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { listDocumentTypes, deleteDocumentType } from './api/documentTypes';
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

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [showAddOrganization, setShowAddOrganization] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<DocumentType | null>(null);
  const [viewingType, setViewingType] = useState<DocumentType | null>(null);
  const [reviewingType, setReviewingType] = useState<DocumentType | null>(null);
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

  function handleStatusChanged(type: DocumentType) {
    setDocumentTypes((current) => current.map((item) => (item.id === type.id ? type : item)));
    setReviewingType(type);
    notify(`${type.name} · ${type.provider} is nu ${type.status}`);
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
        return <DashboardPage types={documentTypes} onAddType={handleOpenCreateType} onNavigate={navigate} />;
      case 'Documenttypes':
        return (
          <DocumentTypesPage
            types={documentTypes}
            onAdd={handleOpenCreateType}
            onView={setViewingType}
            onEdit={handleOpenEditType}
            onDelete={handleDeleteType}
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
            types={documentTypes}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onToggleStatusFilter={handleToggleStatusFilter}
            onViewType={setReviewingType}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} mobileOpen={mobileOpen} requestCount={documentTypes.length} onNavigate={navigate} />

      <main className="main-content">
        <Topbar active={active} onToggleMobileNav={() => setMobileOpen((open) => !open)} onLogout={logout} />
        <div className="page-wrap" key={active}>
          {renderPage()}
        </div>
      </main>

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
      {viewingType && (
        <DocumentTypeDrawer
          documentType={viewingType}
          onClose={() => setViewingType(null)}
          onEdit={handleOpenEditType}
          onDelete={handleDeleteType}
          onDocumentCountChange={handleDocumentCountChange}
        />
      )}
      {reviewingType && (
        <DocumentReviewModal
          documentType={reviewingType}
          onClose={() => setReviewingType(null)}
          onStatusChanged={handleStatusChanged}
        />
      )}
      {viewingOrganization && (
        <OrganizationDrawer organization={viewingOrganization} onClose={() => setViewingOrganization(null)} />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}
