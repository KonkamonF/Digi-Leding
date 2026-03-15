import React, { createContext, ReactNode, useEffect, useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { LendingContextType } from '../types'
import { useWeb3 } from '../hooks/useWeb3'
import { maxBorrowable, isHealthy as checkHealthy, healthFactor as calcHealthFactor } from '../utils/calculations'
import { SIMPLE_LENDING_ADDRESS, MOCK_TOKEN_ADDRESS, ABIS } from '../config/contracts'

export const LendingContext = createContext<LendingContextType | null>(null)

interface LendingProviderProps {
  children: ReactNode
}

export const LendingProvider: React.FC<LendingProviderProps> = ({ children }) => {
  const { account, signer, provider } = useWeb3()
  const [lending, setLending] = useState<any>(null)
  const [token, setToken] = useState<any>(null)

  const [collateralETH, setCollateralETH] = useState(0n)
  const [debtTokens, setDebtTokens] = useState(0n)
  const [tokenBalance, setTokenBalance] = useState(0n)
  const [availableLiquidity, setAvailableLiquidity] = useState(0n)
  const [normalizedDebt, setNormalizedDebt] = useState(0n)
  const [debtIndex, setDebtIndex] = useState(0n)
  const [totalDeposits, setTotalDeposits] = useState(0n)
  const [totalDebt, setTotalDebt] = useState(0n)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer) {
      try {
        console.log('Attempting to initialize contracts with:', {
          SIMPLE_LENDING_ADDRESS,
          MOCK_TOKEN_ADDRESS,
          abisAvailable: !!ABIS.SimpleLending && !!ABIS.MockToken
        })
        const lendingContract = new ethers.Contract(SIMPLE_LENDING_ADDRESS, ABIS.SimpleLending, signer)
        const tokenContract = new ethers.Contract(MOCK_TOKEN_ADDRESS, ABIS.MockToken, signer)

        setLending(lendingContract)
        setToken(tokenContract)
        console.log('✅ Contracts initialized successfully')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('❌ Error initializing contracts:', errorMsg, err)
        setError(`Contract init failed: ${errorMsg}`)
      }
    }
  }, [signer])

  const maxBorrow = maxBorrowable(collateralETH)
  const isHealthyValue = checkHealthy(collateralETH, debtTokens)
  const healthFactorValue = calcHealthFactor(collateralETH, debtTokens)

  // Accrued interest = current debt - original principal (normalizedDebt scaled at 1:1)
  const accruedInterest = debtTokens > normalizedDebt ? debtTokens - normalizedDebt : 0n

  const refreshState = useCallback(async () => {
    if (!account || !lending || !token) {
      console.log('Refresh blocked:', { account: !!account, lending: !!lending, token: !!token })
      return
    }
    try {
      console.log('Refreshing state for account:', account)
      const col = await lending.collateralETH(account)
      const debt = await lending.getDebt(account)
      const balance = await token.balanceOf(account)
      const liquidity = await lending.availableLiquidity()
      const normDebt = await lending.normalizedDebt(account)
      const dIdx = await lending.currentDebtIndex()
      const totDep = await lending.totalDeposits()
      const totDebt = await lending.getTotalDebt()

      console.log('📊 Raw values from contract:', {
        col: col.toString(),
        debt: debt.toString(),
        balance: balance.toString(),
        liquidity: liquidity.toString(),
        debtIndex: dIdx.toString(),
      })

      setCollateralETH(col)
      setDebtTokens(debt)
      setTokenBalance(balance)
      setAvailableLiquidity(liquidity)
      setNormalizedDebt(normDebt)
      setDebtIndex(dIdx)
      setTotalDeposits(totDep)
      setTotalDebt(totDebt)

      console.log('✅ State updated successfully')
    } catch (err) {
      console.error('❌ Error refreshing state:', err)
      setError('Failed to load contract data. Check that the Hardhat node is running and contracts are deployed.')
    }
  }, [account, lending, token])

  useEffect(() => {
    refreshState()
    const interval = setInterval(refreshState, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [refreshState])

  const addCollateral = async (ethAmount: string) => {
    setLoading(true)
    setError(null)
    try {
      console.log('Adding collateral:', ethAmount, 'ETH')
      const tx = await lending.addCollateral({ value: ethers.parseEther(ethAmount) })
      console.log('Transaction sent:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed:', receipt)
      if (provider) {
        await provider.getBlockNumber()
        console.log('Provider synced with new block')
      }
      console.log('Calling refreshState after transaction...')
      await refreshState()
      console.log('refreshState completed')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add collateral'
      console.error('Error adding collateral:', err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const removeCollateral = async (ethAmount: string) => {
    setLoading(true)
    setError(null)
    try {
      const tx = await lending.removeCollateral(ethers.parseEther(ethAmount))
      await tx.wait()
      if (provider) {
        await provider.getBlockNumber()
      }
      await refreshState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove collateral')
    } finally {
      setLoading(false)
    }
  }

  const borrow = async (amount: string) => {
    setLoading(true)
    setError(null)
    try {
      const tx = await lending.borrow(ethers.parseEther(amount))
      await tx.wait()
      if (provider) {
        await provider.getBlockNumber()
      }
      await refreshState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow')
    } finally {
      setLoading(false)
    }
  }

  const repay = async (amount: string) => {
    setLoading(true)
    setError(null)
    try {
      const amountParsed = ethers.parseEther(amount)
      const approveTx = await token.approve(SIMPLE_LENDING_ADDRESS, amountParsed)
      await approveTx.wait()

      const repayTx = await lending.repay(amountParsed)
      await repayTx.wait()
      if (provider) {
        await provider.getBlockNumber()
      }
      await refreshState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to repay')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LendingContext.Provider
      value={{
        collateralETH,
        debtTokens,
        tokenBalance,
        normalizedDebt,
        maxBorrowable: maxBorrow,
        availableLiquidity,
        isHealthy: isHealthyValue,
        healthFactor: healthFactorValue,
        debtIndex,
        totalDeposits,
        totalDebt,
        accruedInterest,
        interestRateBps: 500,
        addCollateral,
        removeCollateral,
        borrow,
        repay,
        loading,
        error,
      }}
    >
      {children}
    </LendingContext.Provider>
  )
}
