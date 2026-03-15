import React from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Button } from './common/Button'

export const WalletConnect: React.FC = () => {
  const { account, isConnected, connect, disconnect, network } = useWeb3()

  return (
    <div style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2>Digi-Lending</h2>
        {network && <p style={{ fontSize: '12px', color: '#666' }}>Network: {network.name}</p>}
      </div>
      {isConnected ? (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px' }}>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
          <Button onClick={disconnect}>Disconnect</Button>
        </div>
      ) : (
        <Button onClick={connect}>Connect Wallet</Button>
      )}
    </div>
  )
}
