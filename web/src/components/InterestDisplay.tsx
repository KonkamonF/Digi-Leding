import React from 'react'
import { useLendingProtocol } from '../hooks/useLendingProtocol'
import { formatTokens } from '../utils/calculations'

export const InterestDisplay: React.FC = () => {
  const {
    debtTokens,
    normalizedDebt,
    accruedInterest,
    debtIndex,
    totalDeposits,
    totalDebt,
    interestRateBps,
  } = useLendingProtocol()

  const interestRatePercent = (interestRateBps / 100).toFixed(2)
  const debtIndexDisplay = (Number(debtIndex) / 1e18).toFixed(6)
  const utilizationRate =
    totalDeposits > 0n
      ? ((Number(totalDebt) / Number(totalDeposits)) * 100).toFixed(2)
      : '0.00'

  return (
    <div
      style={{
        border: '1px solid #e0c866',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#fffef5',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Interest &amp; Protocol Info</h3>

      {/* Interest rate */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <Stat label="Annual Interest Rate" value={`${interestRatePercent}%`} />
        <Stat label="Global Debt Index" value={debtIndexDisplay} />
        <Stat label="Pool Utilization" value={`${utilizationRate}%`} />
      </div>

      {/* User interest breakdown */}
      {normalizedDebt > 0n ? (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #eee',
            borderRadius: '6px',
            padding: '16px',
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Your Debt Breakdown</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Stat label="Original Principal" value={`${formatTokens(normalizedDebt)} mUSD`} />
            <Stat
              label="Accrued Interest"
              value={`${formatTokens(accruedInterest)} mUSD`}
              color="#c0392b"
            />
            <Stat label="Total Debt" value={`${formatTokens(debtTokens)} mUSD`} color="#2c3e50" />
          </div>

          {/* Visual bar showing principal vs interest */}
          {debtTokens > 0n && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                Principal vs Interest
              </p>
              <div
                style={{
                  height: '20px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  backgroundColor: '#eee',
                }}
              >
                <div
                  style={{
                    width: `${(Number(normalizedDebt) / Number(debtTokens)) * 100}%`,
                    backgroundColor: '#3498db',
                    transition: 'width 0.5s ease',
                  }}
                />
                <div
                  style={{
                    width: `${(Number(accruedInterest) / Number(debtTokens)) * 100}%`,
                    backgroundColor: '#e74c3c',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#888',
                  marginTop: '4px',
                }}
              >
                <span>
                  <span style={{ color: '#3498db' }}>&#9632;</span> Principal
                </span>
                <span>
                  <span style={{ color: '#e74c3c' }}>&#9632;</span> Interest
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: '13px', color: '#999' }}>No outstanding debt — interest info will appear when you borrow.</p>
      )}

      {/* Pool-level stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff',
          borderRadius: '6px',
          border: '1px solid #eee',
        }}
      >
        <Stat label="Total Pool Deposits" value={`${formatTokens(totalDeposits)} mUSD`} />
        <Stat label="Total Outstanding Debt" value={`${formatTokens(totalDebt)} mUSD`} />
      </div>
    </div>
  )
}

const Stat: React.FC<{ label: string; value: string; color?: string }> = ({
  label,
  value,
  color,
}) => (
  <div>
    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px' }}>{label}</p>
    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: color || '#333' }}>{value}</p>
  </div>
)
