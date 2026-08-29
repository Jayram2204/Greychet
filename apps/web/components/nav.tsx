import Link from "next/link";

/**
 * The one shared top bar, mounted on every real route. Never imports Privy
 * itself — wallet state is passed in as props by whichever page already
 * computed it via its own (unchanged) usePrivy()/useLogin()/useLogout().
 * Callers on the walletless consumer route simply omit the wallet props,
 * which is what keeps that route free of the wallet SDK: no import here
 * ever pulls Privy in, so a caller that never passes wallet props never
 * causes it to load.
 */
export function Nav({
  address,
  onLogin,
  onLogout,
}: {
  address?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}) {
  const walletCapable = onLogin !== undefined;

  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-mono text-sm tracking-widest text-bone">
          CACHET
        </Link>
        {walletCapable && (
          <>
            <Link href="/register" className="text-sm text-ash underline underline-offset-4 hover:text-bone">
              Register
            </Link>
            <Link href="/dispute" className="text-sm text-ash underline underline-offset-4 hover:text-bone">
              Dispute
            </Link>
          </>
        )}
      </div>

      {walletCapable ? (
        address ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ash">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
            <button onClick={onLogout} className="font-mono text-xs text-bone underline underline-offset-4" aria-label="Disconnect wallet">
              [⏻]
            </button>
          </div>
        ) : (
          <button onClick={onLogin} className="rounded-control bg-bone px-4 py-1.5 text-xs font-medium text-ink hover:opacity-90">
            Connect Wallet
          </button>
        )
      ) : (
        <Link href="/register" className="text-sm text-ash underline underline-offset-4 hover:text-bone">
          For businesses →
        </Link>
      )}
    </header>
  );
}
