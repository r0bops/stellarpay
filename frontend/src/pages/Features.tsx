const featureGroups = [
  {
    title: 'Shareable Invoice Links',
    items: [
      'Public invoice URL with sanitized payer view',
      'Backend pay-intent endpoint that returns SEP-7 payload',
      'Memo-based payment matching using invoice_id',
    ],
  },
  {
    title: 'Wallet-First Payments',
    items: [
      'Freighter-compatible delegated signing (no key custody)',
      'Support for XLM and issued assets such as USDC/EURC',
      'Transaction summary checks before wallet approval',
    ],
  },
  {
    title: 'Settlement Verification',
    items: [
      'Watcher/indexer validates destination, asset, amount, and success',
      'Invoice lifecycle status: unpaid, pending, paid, failed, expired',
      'Optional real-time updates via polling, SSE, or WebSocket',
    ],
  },
  {
    title: 'Operational Visibility',
    items: [
      'Correlated logs by invoice_id and tx_hash',
      'Metrics for pay intents, confirmations, and watcher lag',
      'Configurable testnet/mainnet deployment paths',
    ],
  },
];

const implementationNeeds = [
  'Stellar-compatible wallet for signing (Freighter recommended for MVP).',
  'Network configuration with Horizon URL and passphrase for testnet or mainnet.',
  'Invoice API surface: create invoice, public invoice detail, and pay-intent endpoint.',
  'Payment watcher to map memo=invoice_id and update status idempotently.',
  'Validation rules for destination, expected amount, asset code/issuer, and tx success.',
  'Clear policy for edge cases: underpayment, wrong asset, expired invoice, and retries.',
];

export default function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Features</h1>
        <p className="mt-4 text-base text-muted-foreground">
          End-to-end decentralized invoicing with shareable links, wallet-approved payments, and
          on-chain settlement verification.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {featureGroups.map((group, index) => (
          <article
            key={group.title}
            className="card hover-glow p-6 animate-fade-in"
            style={{ animationDelay: `${0.08 + index * 0.09}s` }}
          >
            <h2 className="text-xl font-semibold text-foreground">{group.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article className="card mt-8 p-6">
        <h2 className="text-xl font-semibold text-foreground">What it needs to run well</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Based on the technical flow docs, these are the minimum requirements for reliable invoice
          links and payment state tracking.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {implementationNeeds.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
