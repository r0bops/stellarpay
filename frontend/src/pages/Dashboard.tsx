import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '../store/walletStore';
import { getDashboardStats, listInvoices } from '../services/api';
import InvoiceStatusBadge from '../components/Invoice/InvoiceStatusBadge';
import type { Invoice, InvoiceStatus, DashboardStats } from '../types';

export default function Dashboard() {
  const { publicKey } = useWalletStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) return;

    Promise.all([getDashboardStats(publicKey), listInvoices(publicKey)])
      .then(([s, invoices]) => {
        setStats(s);
        setRecentInvoices(invoices.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [publicKey]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  const statCards = [
    { label: 'Total Invoices', value: stats?.totalInvoices || 0, color: 'text-foreground' },
    { label: 'Paid', value: stats?.paidInvoices || 0, color: 'text-success' },
    { label: 'Pending', value: stats?.pendingInvoices || 0, color: 'text-warning' },
    { label: 'Revenue', value: stats?.totalRevenue || '0.00', color: 'text-primary', prefix: '' },
  ];

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
              {stat.prefix !== undefined ? stat.prefix : ''}{stat.value}
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
            <Link to="/dashboard/invoices?status=PENDING" className="btn-secondary text-xs">View Pending</Link>
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Invoices</h3>
          <Link to="/dashboard/invoices" className="text-xs text-primary hover:brightness-110">
            View All {'→'}
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="mb-3 text-sm text-muted-foreground">No invoices yet. Create your first one!</p>
            <Link to="/dashboard/create" className="btn-primary text-sm">Create Invoice</Link>
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
                      {invoice.clientName} · {invoice.invoiceNumber}
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
    </div>
  );
}
