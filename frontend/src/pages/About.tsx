const philosophy = [
  'Non-custodial by design',
  'Built on Stellar network rails',
  'Transparent and simple payment states',
  'Backend as source of truth with on-chain verification',
];

const techStack = [
  { label: 'Frontend', value: 'React + Vite + Tailwind' },
  { label: 'Blockchain', value: 'Stellar' },
  { label: 'Wallet', value: 'Freighter' },
  { label: 'Verification', value: 'Horizon API' },
  { label: 'Hosting', value: 'Vercel-ready deployment' },
];

const planGuidance = [
  {
    name: 'Starter',
    focus: 'Solo freelancers validating workflow',
    details: '10 invoices/month with payment links and basic dashboard visibility.',
  },
  {
    name: 'Pro',
    focus: 'Growing freelancers and small teams',
    details: '50 invoices/month plus client management, invoice history, and priority support.',
  },
  {
    name: 'Business',
    focus: 'High-volume operations',
    details: 'Unlimited invoices with advanced analytics, custom branding, and API access.',
  },
];

export default function About() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-6 pt-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">About Link2Pay</h1>

      <div className="mt-10 space-y-6">
        <article className="card p-6">
          <h2 className="text-xl font-semibold text-foreground">Why we built this</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Freelancers in LATAM and global remote teams often wait too long to get paid, deal with
            high fees, and depend on custodial intermediaries. Link2Pay makes the flow direct:
            invoice, share, sign, and verify on-chain.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The product follows a practical architecture: invoices are managed off-chain for speed,
            while payment truth is verified on-chain by matching transaction memo, destination,
            asset, and amount.
          </p>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold text-foreground">Philosophy</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {philosophy.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold text-foreground">Technical stack</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {techStack.map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-muted px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold text-foreground">Plan guidance</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Plans are scoped by invoice volume and operational depth so teams can adopt in phases.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {planGuidance.map((plan) => (
              <div key={plan.name} className="rounded-lg border border-border bg-muted px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{plan.focus}</p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.details}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
