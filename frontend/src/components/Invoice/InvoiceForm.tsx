import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/walletStore';
import { createInvoice } from '../../services/api';
import type { Currency } from '../../types';

interface LineItemForm {
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { publicKey } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [freelancerName, setFreelancerName] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [freelancerCompany, setFreelancerCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState<Currency>('XLM');
  const [taxRate, setTaxRate] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { description: '', quantity: 1, rate: 0 },
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = taxRate ? subtotal * (parseFloat(taxRate) / 100) : 0;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const invoice = await createInvoice(
        {
          freelancerWallet: publicKey,
          freelancerName: freelancerName || undefined,
          freelancerEmail: freelancerEmail || undefined,
          freelancerCompany: freelancerCompany || undefined,
          clientName,
          clientEmail,
          clientCompany: clientCompany || undefined,
          title,
          description: description || undefined,
          notes: notes || undefined,
          currency,
          taxRate: taxRate ? parseFloat(taxRate) : undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          lineItems: lineItems.filter((item) => item.description && item.rate > 0),
        },
        publicKey
      );

      navigate(`/dashboard/invoices/${invoice.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      <section className="card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
          Your Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Name</label>
            <input type="text" className="input" placeholder="Your name" value={freelancerName} onChange={(e) => setFreelancerName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={freelancerEmail} onChange={(e) => setFreelancerEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Company</label>
            <input type="text" className="input" placeholder="Optional" value={freelancerCompany} onChange={(e) => setFreelancerCompany(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Wallet Address</label>
          <div className="input bg-muted font-mono text-xs text-muted-foreground cursor-default">
            {publicKey}
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
          Client Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Client Name <span className="text-destructive">*</span></label>
            <input type="text" className="input" placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Client Email <span className="text-destructive">*</span></label>
            <input type="email" className="input" placeholder="client@example.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Company</label>
            <input type="text" className="input" placeholder="Optional" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
          Invoice Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Title <span className="text-destructive">*</span></label>
            <input type="text" className="input" placeholder="Website Development" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Currency</label>
              <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                <option value="XLM">XLM</option>
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px] resize-y" placeholder="Project description..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Line Items</h3>
          <button type="button" onClick={addLineItem} className="btn-ghost text-primary text-sm">+ Add Item</button>
        </div>

        <div className="grid grid-cols-12 gap-3 mb-2 px-1">
          <div className="col-span-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</div>
          <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</div>
          <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate</div>
          <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</div>
          <div className="col-span-1" />
        </div>

        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5">
                <input type="text" className="input" placeholder="Service description" value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} required />
              </div>
              <div className="col-span-2">
                <input type="number" className="input text-center" min="0.01" step="0.01" value={item.quantity || ''} onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="col-span-2">
                <input type="number" className="input" min="0" step="0.01" placeholder="0.00" value={item.rate || ''} onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="col-span-2 text-right text-sm font-mono text-foreground">
                {(item.quantity * item.rate).toFixed(2)}
              </div>
              <div className="col-span-1 text-center">
                {lineItems.length > 1 && (
                  <button type="button" onClick={() => removeLineItem(index)} className="text-muted-foreground hover:text-destructive transition-colors text-lg">×</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono w-28 text-right">{subtotal.toFixed(2)} {currency}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Tax Rate (%)</span>
              <input type="number" className="input w-28 text-right" min="0" max="100" step="0.1" placeholder="0" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </div>
            {taxAmount > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Tax Amount</span>
                <span className="font-mono w-28 text-right">{taxAmount.toFixed(2)} {currency}</span>
              </div>
            )}
            <div className="flex items-center gap-4 text-base font-semibold pt-2 border-t border-border">
              <span>Total</span>
              <span className="font-mono w-28 text-right text-primary">{total.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Notes</h3>
        <textarea className="input min-h-[80px] resize-y" placeholder="Payment terms, additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </section>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={() => navigate('/dashboard/invoices')} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </span>
          ) : (
            'Create Invoice'
          )}
        </button>
      </div>
    </form>
  );
}
