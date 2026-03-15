import React from 'react'
import { useLendingProtocol } from '../hooks/useLendingProtocol'
import { formatEth, formatTokens } from '../utils/calculations'

export const PortfolioOverview: React.FC = () => {
  const { collateralETH, debtTokens, tokenBalance, isHealthy, healthFactor, error } = useLendingProtocol()

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Portfolio Overview</h3>
      {error && <p style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>Error: {error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#666' }}>Collateral (ETH)</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatEth(collateralETH)}</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#666' }}>Debt (Tokens)</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTokens(debtTokens)}</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#666' }}>Token Balance</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatTokens(tokenBalance)}</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#666' }}>Health Factor</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: isHealthy ? 'green' : 'red' }}>{healthFactor.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
