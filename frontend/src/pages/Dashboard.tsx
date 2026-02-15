import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import {
  getDashboardStats,
  listInvoices,
  listSavedClients,
  saveClient,
  updateClientFavorite,
} from '../services/api';
import InvoiceStatusBadge from '../components/Invoice/InvoiceStatusBadge';
import type { DashboardStats, Invoice, InvoiceStatus, SavedClient } from '../types';

interface ClientFormState {
  name: string;
  email: string;
  company: string;
  address: string;
  isFavorite: boolean;
}

const initialClientForm: ClientFormState = {
  name: '',
  email: '',
  company: '',
  address: '',
  isFavorite: false,
};

function sortClients(clients: SavedClient[]): SavedClient[] {
  return [...clients].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export default function Dashboard() {
  const { publicKey } = useWalletStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [savedClients, setSavedClients] = useState<SavedClient[]>([]);
  const [loading, setLoading] = useState(true);

  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState<ClientFormState>(initialClientForm);
  const [savingClient, setSavingClient] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    setLoading(true);
    Promise.all([
      getDashboardStats(publicKey),
      listInvoices(publicKey),
      listSavedClients(publicKey),
    ])
      .then(([dashboardStats, invoices, clients]) => {
        setStats(dashboardStats);
        setRecentInvoices(invoices.slice(0, 5));
        setSavedClients(sortClients(clients));
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [publicKey]);

  const statCards = useMemo(
    () => [
      { label: 'Total Invoices', value: stats?.totalInvoices || 0, color: 'text-foreground' },
      { label: 'Paid', value: stats?.paidInvoices || 0, color: 'text-success' },
      { label: 'Pending', value: stats?.pendingInvoices || 0, color: 'text-warning' },
      { label: 'Revenue', value: stats?.totalRevenue || '0.00', color: 'text-primary', prefix: '' },
    ],
    [stats]
  );

  const handleClientField = (field: keyof ClientFormState, value: string | boolean) => {
    setClientForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddClient = async (event: FormEvent) => {
    event.preventDefault();
    if (!publicKey) return;

    setSavingClient(true);
    setClientError(null);

    try {
      const saved = await saveClient(
        {
          name: clientForm.name.trim(),
          email: clientForm.email.trim(),
          company: clientForm.company.trim() || undefined,
          address: clientForm.address.trim() || undefined,
          isFavorite: clientForm.isFavorite,
        },
        publicKey
      );

      setSavedClients((prev) => sortClients([saved, ...prev.filter((client) => client.id !== saved.id)]));
      setClientForm(initialClientForm);
      setShowClientForm(false);
    } catch (err: any) {
      setClientError(err.message || 'Failed to save client');
    } finally {
      setSavingClient(false);
    }
  };

  const toggleFavorite = async (client: SavedClient) => {
    if (!publicKey) return;

    setClientError(null);

    try {
      const updated = await updateClientFavorite(client.id, !client.isFavorite, publicKey);
      setSavedClients((prev) =>
        sortClients(prev.map((item) => (item.id === updated.id ? updated : item)))
      );
    } catch (err: any) {
      setClientError(err.message || 'Failed to update favorite');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of your invoicing activity</p>
        </div>
        <Link to="/dashboard/create" className="btn-primary text-sm">+ New Invoice</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="mb-1 text-xs text-muted-foreground">{stat.label}</p>
            <p className={`font-mono text-2xl font-semibold ${stat.color}`}>
              {stat.prefix !== undefined ? stat.prefix : ''}
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {stats && parseFloat(stats.pendingAmount) > 0 && (
        <div className="card border-warning/30 bg-warning/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-warning">Awaiting Payment</p>
              <p className="font-mono text-xl font-semibold text-warning">{stats.pendingAmount}</p>
            </div>
            <Link to="/dashboard/invoices?status=PENDING" className="btn-secondary text-xs">
              View Pending
            </Link>
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Invoices</h3>
          <Link to="/dashboard/invoices" className="text-xs text-primary hover:brightness-110">
            View All -&gt;
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="mb-3 text-sm text-muted-foreground">No invoices yet. Create your first one!</p>
            <Link to="/dashboard/create" className="btn-primary text-sm">
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {recentInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                to={`/dashboard/invoices/${invoice.id}`}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{invoice.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.clientName} | {invoice.invoiceNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
                  <span className="w-24 text-right font-mono text-sm font-medium text-foreground">
                    {parseFloat(invoice.total).toFixed(2)}{' '}
                    <span className="text-xs text-muted-foreground">{invoice.currency}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Saved Clients</h3>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/clients" className="btn-ghost text-xs">
              Open Clients Page
            </Link>
            <button
              type="button"
              onClick={() => {
                setShowClientForm((prev) => !prev);
                setClientError(null);
              }}
              className="btn-secondary text-xs"
            >
              {showClientForm ? 'Close' : '+ Add Client'}
            </button>
          </div>
        </div>

        {showClientForm && (
          <form onSubmit={handleAddClient} className="card mb-4 space-y-4 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="label">Client Name</label>
                <input
                  className="input"
                  value={clientForm.name}
                  onChange={(event) => handleClientField('name', event.target.value)}
                  placeholder="Client name"
                  required
                />
              </div>
              <div>
                <label className="label">Client Email</label>
                <input
                  type="email"
                  className="input"
                  value={clientForm.email}
                  onChange={(event) => handleClientField('email', event.target.value)}
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div>
                <label className="label">Company</label>
                <input
                  className="input"
                  value={clientForm.company}
                  onChange={(event) => handleClientField('company', event.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  className="input"
                  value={clientForm.address}
                  onChange={(event) => handleClientField('address', event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={clientForm.isFavorite}
                onChange={(event) => handleClientField('isFavorite', event.target.checked)}
              />
              Mark as favorite
            </label>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary text-sm" disabled={savingClient}>
                {savingClient ? 'Saving...' : 'Save Client'}
              </button>
            </div>
          </form>
        )}

        {clientError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {clientError}
          </div>
        )}

        {savedClients.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No saved clients yet. Add one now or save one from invoice creation.
            </p>
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {savedClients.slice(0, 6).map((client) => (
              <div key={client.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.email}
                    {client.company ? ` | ${client.company}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/dashboard/create?client=${client.id}`}
                    className="btn-secondary px-2.5 py-1.5 text-xs"
                  >
                    Use in Invoice
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(client)}
                    className="btn-ghost px-2.5 py-1.5"
                    title={client.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
                  >
                    <Star
                      className={`h-4 w-4 ${client.isFavorite ? 'fill-current text-warning' : 'text-muted-foreground'}`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
