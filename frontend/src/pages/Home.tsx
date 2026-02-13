import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Link2,
  Rocket,
  Shield,
  Wallet,
} from 'lucide-react';

const flowSteps = [
  {
    icon: Wallet,
    title: 'Connect your wallet',
    description: 'Use Freighter to connect in one click. No private keys stored by Link2Pay.',
  },
  {
    icon: FileText,
    title: 'Create and share an invoice',
    description: 'Generate a clean invoice with line items and send a secure payment link.',
  },
  {
    icon: Shield,
    title: 'Get paid on Stellar',
    description: 'Clients sign transactions from their own wallet and settle in seconds.',
  },
];

const trustPoints = [
  '5 second confirmation on Stellar',
  'Near-zero network fees',
  'Non-custodial architecture',
  'Global cross-border payments',
];

const audienceCards = [
  {
    title: 'Freelancers',
    description: 'Invoice international clients and receive on-chain payment without intermediaries.',
  },
  {
    title: 'Web3 startups',
    description: 'Run crypto-native billing flows with transparent and verifiable payment states.',
  },
  {
    title: 'LATAM remote workers',
    description: 'Reduce friction when collecting global payments with stable and low-fee rails.',
  },
];

const technicalFlow = [
  'Invoice Created',
  'Client Opens Link',
  'Signs Transaction',
  'Horizon Verifies',
  'Status Updates',
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_hsl(175_75%_45%_/_0.12),transparent_68%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Built on Stellar. Non-custodial by design.
            </span>
            <h1
              className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-6xl animate-slide-up"
              style={{ animationDelay: '0.08s' }}
            >
              Decentralized invoicing for global teams
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg animate-slide-up"
              style={{ animationDelay: '0.16s' }}
            >
              Create invoices, share payment links, and receive confirmed payments on Stellar with
              full wallet control.
            </p>
            <div
              className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-slide-up"
              style={{ animationDelay: '0.24s' }}
            >
              <Link to="/get-started" className="btn-primary px-5 py-3 text-sm">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/pricing" className="btn-secondary px-5 py-3 text-sm">
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">How it works</h2>
          <p className="mt-2 text-sm text-muted-foreground">Three simple steps to move from invoice to payment.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {flowSteps.map((step, index) => (
            <div
              key={step.title}
              className="card hover-glow p-6 animate-fade-in"
              style={{ animationDelay: `${0.05 + index * 0.08}s` }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground">Why Link2Pay?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Built to be fast, secure, and practical for real payment workflows.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point, index) => (
              <article
                key={point}
                className="card p-4 animate-fade-in"
                style={{ animationDelay: `${0.04 + index * 0.06}s` }}
              >
                <p className="text-sm font-medium text-foreground">{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Who is this for?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Focused on teams that need global payment speed and strong control.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {audienceCards.map((card, index) => (
            <article
              key={card.title}
              className="card hover-glow p-6 animate-fade-in"
              style={{ animationDelay: `${0.04 + index * 0.07}s` }}
            >
              <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground">How payment verification works</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A simple flow from invoice creation to automatic status updates.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {technicalFlow.map((step, index) => (
              <div key={step} className="relative">
                <div className="card p-4 text-center text-sm font-medium text-foreground">{step}</div>
                {index < technicalFlow.length - 1 && (
                  <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-primary md:block">
                    <Link2 className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="card overflow-hidden">
          <div className="bg-[linear-gradient(135deg,_hsl(175_75%_45%),_hsl(175_75%_35%))] p-8 sm:p-10">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-2xl font-semibold text-primary-foreground">Ready to start invoicing on Stellar?</h3>
                <p className="mt-2 text-sm text-primary-foreground/80">
                  Launch with Testnet today and evolve to production-ready flows.
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/pricing" className="btn bg-background text-primary hover:bg-muted">
                  Compare Plans
                </Link>
                <Link
                  to="/get-started"
                  className="btn border border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  Go to Dashboard
                  <Rocket className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
