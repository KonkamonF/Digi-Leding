import { ethers } from 'ethers'

export interface Web3ContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  network: { name: string; chainId: number } | null
  isConnected: boolean
  connect(): Promise<void>
  disconnect(): void
}

export interface LendingContextType {
  // User state
  collateralETH: bigint
  debtTokens: bigint
  tokenBalance: bigint
  normalizedDebt: bigint

  // Protocol state
  maxBorrowable: bigint
  availableLiquidity: bigint
  isHealthy: boolean
  healthFactor: number

  // Interest state
  debtIndex: bigint
  totalDeposits: bigint
  totalDebt: bigint
  accruedInterest: bigint
  interestRateBps: number

  // Actions
  addCollateral(ethAmount: string): Promise<void>
  removeCollateral(ethAmount: string): Promise<void>
  borrow(amount: string): Promise<void>
  repay(amount: string): Promise<void>

  // UI state
  loading: boolean
  error: string | null
}

export interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error'
  txHash?: string
  error?: string
}
