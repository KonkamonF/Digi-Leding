import { useContext } from 'react'
import { LendingContext } from '../context/LendingContext'

export const useLendingProtocol = () => {
  const context = useContext(LendingContext)
  if (!context) {
    throw new Error('useLendingProtocol must be used within LendingProvider')
  }
  return context
}
