import { TOKENS_PER_ETH, COLLATERAL_FACTOR_BPS, LIQ_THRESHOLD_BPS, BPS } from '../config/contracts'

export const collateralValueInToken = (collateralETH: bigint): bigint => {
  return (collateralETH * TOKENS_PER_ETH) / (10n ** 18n)
}

export const maxBorrowable = (collateralETH: bigint): bigint => {
  const cv = collateralValueInToken(collateralETH)
  return (cv * COLLATERAL_FACTOR_BPS) / BPS
}

export const isHealthy = (collateralETH: bigint, debt: bigint): boolean => {
  const cv = collateralValueInToken(collateralETH)
  return debt <= (cv * LIQ_THRESHOLD_BPS) / BPS
}

export const healthFactor = (collateralETH: bigint, debt: bigint): number => {
  const cv = collateralValueInToken(collateralETH)
  const threshold = (cv * LIQ_THRESHOLD_BPS) / BPS
  if (debt === 0n) return 100
  return Number((threshold * 100n) / debt) / 100
}

export const formatEth = (wei: bigint): string => {
  return (Number(wei) / 1e18).toFixed(4)
}

export const formatTokens = (amount: bigint): string => {
  return (Number(amount) / 1e18).toFixed(2)
}
