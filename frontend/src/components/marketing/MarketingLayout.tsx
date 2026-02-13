import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowRight, Wallet, Zap } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import ThemeToggle from '../ThemeToggle';

const NAV_ITEMS = [
  { path: '/', label: 'Home', end: true },
  { path: '/features', label: 'Features' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/about', label: 'About' },
];

const FOOTER_LINKS = [
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'GitHub', to: '#' },
  { label: 'Twitter', to: '#' },
  { label: 'Terms', to: '#' },
  { label: 'Privacy', to: '#' },
];

const truncateAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-3)}`;

export default function MarketingLayout() {
  const { connected, publicKey, isConnecting, connect, disconnect } = useWalletStore();

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      // Connection errors are already stored by walletStore.
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </span>
              <span className="text-base font-semibold text-foreground">Link2Pay</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              {connected && publicKey && (
                <span className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-[11px] font-mono text-foreground sm:text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {truncateAddress(publicKey)}
                </span>
              )}

              {!connected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="btn-primary px-3 py-2 text-xs sm:text-sm"
                >
                  <Wallet className="h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="btn-ghost px-3 py-2 text-xs sm:text-sm"
                >
                  Disconnect
                </button>
              )}

              <Link to="/get-started" className="btn-secondary px-3 py-2 text-xs sm:text-sm">
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto pb-3 md:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Zap className="h-4 w-4" />
                </span>
                <span className="font-semibold text-foreground">Link2Pay</span>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Decentralized invoicing on Stellar for freelancers, startups, and global teams.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {FOOTER_LINKS.map((item) =>
                item.to.startsWith('/') ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                )
              )}
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
            Link2Pay on Stellar Testnet
          </div>
        </div>
      </footer>
    </div>
  );
}
