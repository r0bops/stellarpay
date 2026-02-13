import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWalletStore } from '../../store/walletStore';
import { listInvoices } from '../../services/api';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import type { Invoice, InvoiceStatus } from '../../types';
import { CURRENCY_SYMBOLS } from '../../config';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Failed', value: 'FAILED' },
];

export default function InvoiceList() {
  const { publicKey } = useWalletStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!publicKey) return;

    setLoading(true);
    listInvoices(publicKey, filter || undefined)
      .then(setInvoices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [publicKey, filter]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: string, currency: string) => {
    const sym = CURRENCY_SYMBOLS[currency] || currency;
    const num = parseFloat(amount);
    if (currency === 'XLM') return `${num.toFixed(2)} ${sym}`;
    return `${sym}${num.toFixed(2)}`;
  };

  return (
    <div className="animate-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
        <Link to="/dashboard/create" className="btn-primary text-sm">+ New Invoice</Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              filter === f.value
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-transparent text-muted-foreground hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-12 text-center text-sm text-muted-foreground">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="mb-3 text-sm text-muted-foreground">No invoices found</p>
          <Link to="/dashboard/create" className="btn-primary text-sm">Create Your First Invoice</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="transition-colors hover:bg-muted">
                  <td className="px-4 py-3">
                    <Link to={`/dashboard/invoices/${invoice.id}`} className="text-sm font-medium text-primary hover:brightness-110">
                      {invoice.invoiceNumber}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{invoice.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{invoice.clientName}</p>
                    <p className="text-xs text-muted-foreground">{invoice.clientEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {formatAmount(invoice.total, invoice.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                    {formatDate(invoice.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
