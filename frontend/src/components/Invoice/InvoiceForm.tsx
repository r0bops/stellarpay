import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import {
  createInvoice,
  listSavedClients,
  saveClient,
  updateClientFavorite,
} from '../../services/api';
import type { Currency, SavedClient } from '../../types';

interface LineItemForm {
  description: string;
  quantity: number;
  rate: number;
}

function sortClients(clients: SavedClient[]): SavedClient[] {
  return [...clients].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export default function InvoiceForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client') || '';

  const { publicKey } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [loadingSavedClients, setLoadingSavedClients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [clientMessage, setClientMessage] = useState<string | null>(null);

  const [freelancerName, setFreelancerName] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [freelancerCompany, setFreelancerCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [savedClients, setSavedClients] = useState<SavedClient[]>([]);
  const [saveClientOnCreate, setSaveClientOnCreate] = useState(true);
  const [favoriteClient, setFavoriteClient] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState<Currency>('XLM');
  const [taxRate, setTaxRate] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { description: '', quantity: 1, rate: 0 },
  ]);

  const selectedClient = useMemo(
    () => savedClients.find((client) => client.id === selectedClientId),
    [savedClients, selectedClientId]
  );

  useEffect(() => {
    if (!publicKey) return;

    setLoadingSavedClients(true);
    listSavedClients(publicKey)
      .then((clients) => {
        const sorted = sortClients(clients);
        setSavedClients(sorted);

        if (preselectedClientId) {
          const preselected = sorted.find((client) => client.id === preselectedClientId);
          if (preselected) {
            setSelectedClientId(preselected.id);
            setClientName(preselected.name);
            setClientEmail(preselected.email);
            setClientCompany(preselected.company ?? '');
            setClientAddress(preselected.address ?? '');
            setFavoriteClient(preselected.isFavorite);
          }
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoadingSavedClients(false));
  }, [publicKey, preselectedClientId]);

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

  const selectSavedClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setClientMessage(null);
    setClientError(null);

    if (!clientId) return;

    const selected = savedClients.find((client) => client.id === clientId);
    if (!selected) return;

    setClientName(selected.name);
    setClientEmail(selected.email);
    setClientCompany(selected.company ?? '');
    setClientAddress(selected.address ?? '');
    setFavoriteClient(selected.isFavorite);
  };

  const saveCurrentClient = async () => {
    if (!publicKey) return;
    if (!clientName.trim() || !clientEmail.trim()) {
      setClientError('Client name and email are required to save a client');
      return;
    }

    setIsSavingClient(true);
    setClientError(null);
    setClientMessage(null);

    try {
      const saved = await saveClient(
        {
          name: clientName.trim(),
          email: clientEmail.trim(),
          company: clientCompany.trim() || undefined,
          address: clientAddress.trim() || undefined,
          isFavorite: favoriteClient,
        },
        publicKey
      );

      setSavedClients((prev) => sortClients([saved, ...prev.filter((client) => client.id !== saved.id)]));
      setSelectedClientId(saved.id);
      setFavoriteClient(saved.isFavorite);
      setClientMessage('Client saved');
    } catch (err: any) {
      setClientError(err.message || 'Failed to save client');
    } finally {
      setIsSavingClient(false);
    }
  };

  const toggleFavoriteForSelected = async () => {
    if (!publicKey || !selectedClient) return;

    setClientError(null);
    setClientMessage(null);

    try {
      const updated = await updateClientFavorite(
        selectedClient.id,
        !selectedClient.isFavorite,
        publicKey
      );

      setSavedClients((prev) =>
        sortClients(prev.map((client) => (client.id === updated.id ? updated : client)))
      );
      setFavoriteClient(updated.isFavorite);
      setClientMessage(updated.isFavorite ? 'Client marked as favorite' : 'Client removed from favorites');
    } catch (err: any) {
      setClientError(err.message || 'Failed to update favorite client');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
          clientAddress: clientAddress || undefined,
          title,
          description: description || undefined,
          notes: notes || undefined,
          currency,
          taxRate: taxRate ? parseFloat(taxRate) : undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          saveClient: saveClientOnCreate,
          favoriteClient,
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
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
          Your Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="label">Name</label>
            <input type="text" className="input" placeholder="Your name" value={freelancerName} onChange={(event) => setFreelancerName(event.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={freelancerEmail} onChange={(event) => setFreelancerEmail(event.target.value)} />
          </div>
          <div>
            <label className="label">Company</label>
            <input type="text" className="input" placeholder="Optional" value={freelancerCompany} onChange={(event) => setFreelancerCompany(event.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Wallet Address</label>
          <div className="input cursor-default bg-muted font-mono text-xs text-muted-foreground">
            {publicKey}
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Client Information
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={saveCurrentClient}
              disabled={isSavingClient}
              className="btn-secondary px-3 py-2 text-xs"
            >
              {isSavingClient ? 'Saving...' : 'Save / Update Client'}
            </button>
            <button
              type="button"
              onClick={toggleFavoriteForSelected}
              disabled={!selectedClient}
              className="btn-ghost px-2.5 py-2"
              title={selectedClient?.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
            >
              <Star
                className={`h-4 w-4 ${selectedClient?.isFavorite ? 'fill-current text-warning' : 'text-muted-foreground'}`}
              />
            </button>
          </div>
        </div>

        {loadingSavedClients ? (
          <p className="mb-4 text-xs text-muted-foreground">Loading saved clients...</p>
        ) : savedClients.length > 0 ? (
          <div className="mb-4">
            <label className="label">Saved Clients</label>
            <select
              className="input"
              value={selectedClientId}
              onChange={(event) => selectSavedClient(event.target.value)}
            >
              <option value="">Select a saved client</option>
              {savedClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.isFavorite ? '[Fav] ' : ''}
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="mb-4 text-xs text-muted-foreground">
            No saved clients yet. Fill the fields below and use Save / Update Client.
          </p>
        )}

        {clientError && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {clientError}
          </div>
        )}

        {clientMessage && (
          <div className="mb-3 rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success">
            {clientMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">
              Client Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="Client name"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">
              Client Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              className="input"
              placeholder="client@example.com"
              value={clientEmail}
              onChange={(event) => setClientEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Company</label>
            <input
              type="text"
              className="input"
              placeholder="Optional"
              value={clientCompany}
              onChange={(event) => setClientCompany(event.target.value)}
            />
          </div>
          <div>
            <label className="label">Address</label>
            <input
              type="text"
              className="input"
              placeholder="Optional"
              value={clientAddress}
              onChange={(event) => setClientAddress(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={saveClientOnCreate}
              onChange={(event) => setSaveClientOnCreate(event.target.checked)}
            />
            Save this client when creating the invoice
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={favoriteClient}
              onChange={(event) => setFavoriteClient(event.target.checked)}
            />
            Mark saved client as favorite
          </label>
        </div>
      </section>

      <section className="card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
          Invoice Details
        </h3>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">
              Title <span className="text-destructive">*</span>
            </label>
            <input type="text" className="input" placeholder="Website Development" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Currency</label>
              <select className="input" value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                <option value="XLM">XLM</option>
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px] resize-y" placeholder="Project description..." value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Line Items</h3>
          <button type="button" onClick={addLineItem} className="btn-ghost text-sm text-primary">
            + Add Item
          </button>
        </div>

        <div className="mb-2 grid grid-cols-12 gap-3 px-1">
          <div className="col-span-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</div>
          <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Qty</div>
          <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rate</div>
          <div className="col-span-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</div>
          <div className="col-span-1" />
        </div>

        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-5">
                <input type="text" className="input" placeholder="Service description" value={item.description} onChange={(event) => updateLineItem(index, 'description', event.target.value)} required />
              </div>
              <div className="col-span-2">
                <input type="number" className="input text-center" min="0.01" step="0.01" value={item.quantity || ''} onChange={(event) => updateLineItem(index, 'quantity', parseFloat(event.target.value) || 0)} required />
              </div>
              <div className="col-span-2">
                <input type="number" className="input" min="0" step="0.01" placeholder="0.00" value={item.rate || ''} onChange={(event) => updateLineItem(index, 'rate', parseFloat(event.target.value) || 0)} required />
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-foreground">
                {(item.quantity * item.rate).toFixed(2)}
              </div>
              <div className="col-span-1 text-center">
                {lineItems.length > 1 && (
                  <button type="button" onClick={() => removeLineItem(index)} className="text-lg text-muted-foreground transition-colors hover:text-destructive">
                    x
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="w-28 text-right font-mono">
                {subtotal.toFixed(2)} {currency}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Tax Rate (%)</span>
              <input type="number" className="input w-28 text-right" min="0" max="100" step="0.1" placeholder="0" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} />
            </div>
            {taxAmount > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Tax Amount</span>
                <span className="w-28 text-right font-mono">
                  {taxAmount.toFixed(2)} {currency}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4 border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="w-28 text-right font-mono text-primary">
                {total.toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Notes</h3>
        <textarea className="input min-h-[80px] resize-y" placeholder="Payment terms, additional notes..." value={notes} onChange={(event) => setNotes(event.target.value)} />
      </section>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={() => navigate('/dashboard/invoices')} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
