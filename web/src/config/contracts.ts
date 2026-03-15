import SimpleLendingABI from '../../../artifacts/contracts/lending.sol/SimpleLending.json'
import MockTokenABI from '../../../artifacts/contracts/MockToken.sol/MockToken.json'

export const SIMPLE_LENDING_ADDRESS = import.meta.env.VITE_SIMPLE_LENDING_ADDRESS || ''
export const MOCK_TOKEN_ADDRESS = import.meta.env.VITE_MOCK_TOKEN_ADDRESS || ''

export const ABIS = {
  SimpleLending: SimpleLendingABI.abi,
  MockToken: MockTokenABI.abi,
}

// Protocol constants (from SimpleLending.sol)
export const TOKENS_PER_ETH = 2000n * 10n ** 18n
export const COLLATERAL_FACTOR_BPS = 6600n
export const LIQ_THRESHOLD_BPS = 7500n
export const BPS = 10000n
