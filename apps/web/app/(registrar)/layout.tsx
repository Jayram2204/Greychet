import { Providers } from "./providers";

/**
 * Scopes the Privy provider (and its SDK bundle) to registrar-side routes
 * only. Consumer-facing routes (outside this group) never load Privy, so
 * device verification stays genuinely walletless.
 */
export default function RegistrarLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
