import { ethers } from 'ethers'
import { SIMPLE_LENDING_ADDRESS, MOCK_TOKEN_ADDRESS, ABIS } from '../config/contracts'
import { useWeb3 } from './useWeb3'

export const useContract = () => {
  const { signer } = useWeb3()

  if (!signer) {
    throw new Error('Signer not available')
  }

  const lending = new ethers.Contract(
    SIMPLE_LENDING_ADDRESS,
    ABIS.SimpleLending,
    signer
  )

  const token = new ethers.Contract(
    MOCK_TOKEN_ADDRESS,
    ABIS.MockToken,
    signer
  )

  return { lending, token }
}
