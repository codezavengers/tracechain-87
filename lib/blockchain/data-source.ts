import type { Chain, Transaction } from "@/lib/types"

// Honest provenance label attached to every value the provider layer returns.
//   LIVE    - fetched just now directly from a chain node / explorer API
//   INDEXED - fetched just now from a third-party indexer (Etherscan family)
//   CACHED  - re-served from our short-lived in-memory cache
//   MOCK    - deterministic demo data (no live source configured or a fallback)
export type DataSource = "LIVE" | "INDEXED" | "CACHED" | "MOCK"

export const DATA_SOURCE_LABEL: Record<DataSource, string> = {
  LIVE: "Live blockchain",
  INDEXED: "Indexed (explorer)",
  CACHED: "Cached",
  MOCK: "Demo data",
}

export function isDemoSource(s: DataSource): boolean {
  return s === "MOCK"
}

// Envelope returned by the high-level blockchain service. `dataSource` is the
// single source of truth for how the payload was derived.
export interface ProviderResult<T> {
  data: T
  dataSource: DataSource
  chain: Chain
  provider: string
  fetchedAt: string
  cached: boolean
  // Present when the result is demo data or a degraded fallback, so the UI can
  // surface an unmistakable "DEMO DATA" / "using fallback" notice.
  notice?: string
}

export interface WalletBalance {
  address: string
  chain: Chain
  balance: number
  asset: string
  usdBalance: number
}

// ERC-20 / BEP-20 style token movement, distinct from a native-asset transfer.
export interface TokenTransfer {
  hash: string
  chain: Chain
  from: string
  to: string
  tokenSymbol: string
  tokenName: string
  tokenAddress: string
  amount: number
  decimals: number
  timestamp: string
  blockHeight: number
  direction?: "in" | "out"
}

// The production provider contract every chain adapter implements.
// Chain is accepted as an optional argument for interface symmetry; each
// concrete adapter is already bound to a single chain.
export interface BlockchainProvider {
  readonly chain: Chain
  readonly name: string
  // The data source this provider yields when it succeeds (LIVE/INDEXED/MOCK).
  readonly nativeSource: DataSource
  isConfigured(): boolean
  validateAddress(address: string, chain?: Chain): import("@/lib/types").AddressValidation
  getTransactions(address: string, chain?: Chain): Promise<Transaction[]>
  getTransaction(hash: string, chain?: Chain): Promise<Transaction | null>
  getWalletBalance(address: string, chain?: Chain): Promise<WalletBalance>
  getTokenTransfers(address: string, chain?: Chain): Promise<TokenTransfer[]>
}
