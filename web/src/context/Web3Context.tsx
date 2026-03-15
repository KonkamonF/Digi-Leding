import React, { createContext, ReactNode, useState } from 'react'
import { ethers } from 'ethers'
import { Web3ContextType } from '../types'

export const Web3Context = createContext<Web3ContextType | null>(null)

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [network, setNetwork] = useState<{ name: string; chainId: number } | null>(null)

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    const p = new ethers.BrowserProvider(window.ethereum)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const s = await p.getSigner()
    const net = await p.getNetwork()

    setProvider(p)
    setSigner(s)
    setAccount(accounts[0])
    setNetwork({ name: net.name, chainId: Number(net.chainId) })
  }

  const disconnect = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setNetwork(null)
  }

  const isConnected = account !== null

  return (
    <Web3Context.Provider value={{ account, provider, signer, network, isConnected, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  )
}
