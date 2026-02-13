import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$3',
    period: '/month',
    transfers: '10 transfers',
    description: 'Perfect for getting started with decentralized invoicing.',
    features: [
      '10 invoices/month',
      'Payment link generation',
      'Basic dashboard',
    ],
    cta: 'Choose Starter',
    to: '/get-started',
    featured: false,
  },
  {
    name: 'Pro',
    badge: 'Popular',
    price: '$5',
    period: '/month',
    transfers: '50 transfers',
    description: 'For growing freelancers and small teams.',
    features: [
      '50 invoices/month',
      'Client management',
      'Invoice history',
      'Priority support',
    ],
    cta: 'Choose Pro',
    to: '/get-started',
    featured: true,
  },
  {
    name: 'Business',
    price: '$7',
    period: '/month',
    transfers: 'Unlimited transfers',
    description: 'Unlimited invoicing for established businesses.',
    features: [
      'Unlimited invoices',
      'Advanced analytics',
      'Custom branding',
      'API access',
    ],
    cta: 'Choose Business',
    to: '/get-started',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Pricing</h1>
        <p className="mt-4 text-base text-muted-foreground">
          Choose a plan to start decentralized invoicing on Stellar.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {plans.map((plan, index) => (
          <article
            key={plan.name}
            className={`card relative flex h-full flex-col p-6 animate-fade-in ${
              plan.featured ? 'neon-border-strong shadow-elevated' : ''
            }`}
            style={{ animationDelay: `${0.06 + index * 0.08}s` }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
              {plan.badge && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {plan.badge}
                </span>
              )}
            </div>
            <p className="mb-5 text-sm text-muted-foreground">{plan.description}</p>
            <div className="mb-6">
              <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
              <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
            </div>
            <p className="mb-4 text-sm font-medium text-primary">{plan.transfers}</p>

            <ul className="mb-8 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to={plan.to}
              className={`mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                plan.featured
                  ? 'bg-primary text-primary-foreground hover:brightness-110'
                  : 'border border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        All plans are currently available on Stellar Testnet.
      </div>
    </section>
  );
}
