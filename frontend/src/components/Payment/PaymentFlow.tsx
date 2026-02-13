import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInvoice, createPayIntent, submitPayment, getPaymentStatus } from '../../services/api';
import { useWalletStore } from '../../store/walletStore';
import InvoiceStatusBadge from '../Invoice/InvoiceStatusBadge';
import WalletConnect from '../Wallet/WalletConnect';
import type { Invoice, InvoiceStatus } from '../../types';
import { CURRENCY_SYMBOLS, config } from '../../config';

type PayStep = 'loading' | 'view' | 'connect' | 'paying' | 'confirming' | 'success' | 'error';

export default function PaymentFlow() {
  const { id } = useParams<{ id: string }>();
  const { connected, publicKey, signTransaction } = useWalletStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [step, setStep] = useState<PayStep>('loading');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getInvoice(id)
      .then((inv) => {
        setInvoice(inv);
        if (inv.status === 'PAID') {
          setStep('success');
          setTxHash(inv.transactionHash || null);
        } else {
          setStep(connected ? 'view' : 'connect');
        }
      })
      .catch((err) => {
        setError(err.message);
        setStep('error');
      });
  }, [id, connected]);

  useEffect(() => {
    if (step !== 'confirming' || !id) return;

    const interval = setInterval(async () => {
      try {
        const status = await getPaymentStatus(id);
        if (status.status === 'PAID') {
          setTxHash(status.transactionHash);
          setStep('success');
          const updated = await getInvoice(id);
          setInvoice(updated);
        }
      } catch {
        // Keep polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, id]);

  const handlePay = async () => {
    if (!invoice || !publicKey || !id) return;

    setStep('paying');
    setError(null);

    try {
      const payIntent = await createPayIntent(id, publicKey);
      const signedXdr = await signTransaction(payIntent.transactionXdr);
      setStep('confirming');
      const result = await submitPayment(id, signedXdr);

      if (result.success) {
        setTxHash(result.transactionHash);
        setStep('success');
        const updated = await getInvoice(id);
        setInvoice(updated);
      } else {
        throw new Error('Transaction submission failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setStep('error');
    }
  };

  const formatAmount = (amount: string, currency: string) => {
    const sym = CURRENCY_SYMBOLS[currency] || currency;
    const num = parseFloat(amount);
    if (currency === 'XLM') return `${num.toFixed(2)} ${sym}`;
    return `${sym}${num.toFixed(2)}`;
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="card p-8 text-center max-w-md">
          <p className="text-destructive text-sm">{error || 'Invoice not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in">
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">S</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Link2Pay</h1>
          <p className="text-xs text-muted-foreground">Invoice Payment</p>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-muted-foreground">{invoice.invoiceNumber}</span>
              <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1">{invoice.title}</h2>
            {invoice.description && <p className="text-sm text-muted-foreground">{invoice.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 p-6 border-b border-border bg-muted">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">From</p>
              <p className="text-sm font-medium text-foreground">{invoice.freelancerName || 'Freelancer'}</p>
              {invoice.freelancerCompany && <p className="text-xs text-muted-foreground">{invoice.freelancerCompany}</p>}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">To</p>
              <p className="text-sm font-medium text-foreground">{invoice.clientName}</p>
              {invoice.clientCompany && <p className="text-xs text-muted-foreground">{invoice.clientCompany}</p>}
            </div>
          </div>

          <div className="p-6 border-b border-border">
            <div className="space-y-2">
              {invoice.lineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {parseFloat(String(item.quantity))} × {parseFloat(String(item.rate)).toFixed(2)}
                    </p>
                  </div>
                  <span className="font-mono text-foreground">{parseFloat(String(item.amount)).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border space-y-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{parseFloat(invoice.subtotal).toFixed(2)}</span>
              </div>
              {invoice.taxRate && parseFloat(invoice.taxRate) > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="font-mono">{parseFloat(invoice.taxAmount || '0').toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-primary/10 border-b border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">Total Due</span>
              <span className="text-2xl font-bold font-mono text-primary">{formatAmount(invoice.total, invoice.currency)}</span>
            </div>
          </div>

          <div className="p-6">
            {step === 'connect' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Connect your Freighter wallet to pay this invoice</p>
                <WalletConnect variant="large" />
              </div>
            )}

            {step === 'view' && (
              <div className="space-y-4">
                {publicKey && (
                  <div className="text-xs text-muted-foreground text-center">
                    Paying from: <span className="font-mono">{publicKey.slice(0, 8)}...{publicKey.slice(-4)}</span>
                  </div>
                )}
                <button onClick={handlePay} className="btn-primary w-full py-3 text-base">
                  Pay {formatAmount(invoice.total, invoice.currency)}
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  You'll be asked to approve the transaction in your Freighter wallet
                </p>
              </div>
            )}

            {step === 'paying' && (
              <div className="text-center space-y-3 py-4">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-foreground">Building transaction...</p>
                <p className="text-xs text-muted-foreground">Please approve in your Freighter wallet</p>
              </div>
            )}

            {step === 'confirming' && (
              <div className="text-center space-y-3 py-4">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-foreground">Confirming on Stellar network...</p>
                <p className="text-xs text-muted-foreground">This usually takes 3-5 seconds</p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                  <span className="text-2xl text-success">✓</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Payment Successful</h3>
                  <p className="text-sm text-muted-foreground mt-1">{formatAmount(invoice.total, invoice.currency)} has been sent</p>
                </div>
                {txHash && (
                  <a
                    href={`https://stellar.expert/explorer/${config.stellarNetwork === 'testnet' ? 'testnet' : 'public'}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-primary hover:underline"
                  >
                    View on Stellar Explorer →
                  </a>
                )}
              </div>
            )}

            {step === 'error' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-2xl text-destructive">×</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Payment Failed</h3>
                  <p className="text-sm text-destructive mt-1">{error}</p>
                </div>
                <button onClick={() => setStep('view')} className="btn-secondary text-sm">Try Again</button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-[11px] text-muted-foreground">
            Powered by Link2Pay - Payments on the Stellar Network
          </p>
        </div>
      </div>
    </div>
  );
}
