import React, { useState, useMemo } from 'react'
import { useLendingProtocol } from '../hooks/useLendingProtocol'
import { Input } from './common/Input'
import { formatTokens } from '../utils/calculations'

const INTEREST_RATE = 0.05 // 5% annual
const TOKENS_PER_ETH = 2000
const COLLATERAL_FACTOR = 0.66

interface ProjectionRow {
  month: number
  debt: number
  interest: number
  healthFactor: number
}

export const BorrowCalculator: React.FC = () => {
  const { collateralETH, debtTokens } = useLendingProtocol()

  const [collateralInput, setCollateralInput] = useState('')
  const [borrowInput, setBorrowInput] = useState('')
  const [durationMonths, setDurationMonths] = useState('12')

  // Use current on-chain values as defaults, allow override
  const collateralEth = collateralInput
    ? parseFloat(collateralInput)
    : Number(collateralETH) / 1e18
  const borrowAmount = borrowInput
    ? parseFloat(borrowInput)
    : Number(debtTokens) / 1e18
  const months = parseInt(durationMonths) || 12

  const collateralValue = collateralEth * TOKENS_PER_ETH
  const maxBorrow = collateralValue * COLLATERAL_FACTOR
  const liqThreshold = collateralValue * 0.75

  const projections = useMemo<ProjectionRow[]>(() => {
    if (borrowAmount <= 0 || collateralEth <= 0) return []
    const rows: ProjectionRow[] = []
    for (let m = 0; m <= months; m++) {
      const years = m / 12
      // Compound interest: debt * (1 + rate)^years
      const debt = borrowAmount * Math.pow(1 + INTEREST_RATE, years)
      const interest = debt - borrowAmount
      const hf = liqThreshold > 0 ? liqThreshold / debt : 100
      rows.push({ month: m, debt, interest, healthFactor: hf })
    }
    return rows
  }, [borrowAmount, collateralEth, months, liqThreshold])

  const totalInterest = projections.length > 0 ? projections[projections.length - 1].interest : 0
  const totalDebtEnd = projections.length > 0 ? projections[projections.length - 1].debt : 0
  const monthsUntilLiquidation = projections.find((r) => r.healthFactor < 1)?.month

  // For the visual chart - simple bar chart representation
  const maxDebt = projections.length > 0 ? projections[projections.length - 1].debt : 1

  return (
    <div
      style={{
        border: '1px solid #b8d4e3',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f0f8ff',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Borrow Calculator</h3>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
        Estimate how compound interest affects your loan over time. Adjust values below to simulate different scenarios.
      </p>

      {/* Input section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <Input
          label="Collateral (ETH)"
          value={collateralInput}
          onChange={setCollateralInput}
          placeholder={`${(Number(collateralETH) / 1e18).toFixed(4)} (current)`}
        />
        <Input
          label="Borrow Amount (mUSD)"
          value={borrowInput}
          onChange={setBorrowInput}
          placeholder={`${formatTokens(debtTokens)} (current)`}
        />
        <Input
          label="Duration (months)"
          value={durationMonths}
          onChange={setDurationMonths}
          placeholder="12"
        />
      </div>

      {/* Summary cards */}
      {borrowAmount > 0 && collateralEth > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <SummaryCard
              label="Max Borrowable"
              value={`${maxBorrow.toFixed(2)} mUSD`}
              sublabel={`${COLLATERAL_FACTOR * 100}% of ${collateralValue.toFixed(0)} mUSD`}
            />
            <SummaryCard
              label={`Total Interest (${months}mo)`}
              value={`${totalInterest.toFixed(2)} mUSD`}
              sublabel={`${((totalInterest / borrowAmount) * 100).toFixed(2)}% of principal`}
              color="#c0392b"
            />
            <SummaryCard
              label={`Total Debt (${months}mo)`}
              value={`${totalDebtEnd.toFixed(2)} mUSD`}
              sublabel={`Principal + interest`}
            />
            <SummaryCard
              label="Liquidation Risk"
              value={
                monthsUntilLiquidation !== undefined
                  ? `~${monthsUntilLiquidation} months`
                  : 'Safe'
              }
              sublabel={
                monthsUntilLiquidation !== undefined
                  ? 'Until health factor < 1'
                  : `Health stays above 1 for ${months}mo`
              }
              color={monthsUntilLiquidation !== undefined ? '#e74c3c' : '#27ae60'}
            />
          </div>

          {/* Over-borrow warning */}
          {borrowAmount > maxBorrow && (
            <div
              style={{
                backgroundColor: '#ffeaa7',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              ⚠️ Borrow amount exceeds max borrowable ({maxBorrow.toFixed(2)} mUSD). The contract will reject this transaction.
            </div>
          )}

          {/* Projection table */}
          <h4 style={{ marginBottom: '8px' }}>Interest Projection</h4>
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Bar chart */}
            <div style={{ flex: 1, minHeight: '200px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  height: '180px',
                  gap: '2px',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '4px',
                }}
              >
                {projections.map((row) => {
                  const principalH = (borrowAmount / maxDebt) * 160
                  const interestH = (row.interest / maxDebt) * 160
                  const isLiq = row.healthFactor < 1
                  return (
                    <div
                      key={row.month}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}
                      title={`Month ${row.month}: Debt ${row.debt.toFixed(2)}, Interest ${row.interest.toFixed(2)}, HF ${row.healthFactor.toFixed(2)}`}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${interestH}px`,
                          backgroundColor: isLiq ? '#e74c3c' : '#e67e22',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.3s',
                        }}
                      />
                      <div
                        style={{
                          width: '100%',
                          height: `${principalH}px`,
                          backgroundColor: isLiq ? '#c0392b' : '#3498db',
                          transition: 'height 0.3s',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#999',
                  marginTop: '4px',
                }}
              >
                <span>0mo</span>
                <span>{Math.floor(months / 2)}mo</span>
                <span>{months}mo</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#888',
                  marginTop: '8px',
                }}
              >
                <span><span style={{ color: '#3498db' }}>&#9632;</span> Principal</span>
                <span><span style={{ color: '#e67e22' }}>&#9632;</span> Interest</span>
                <span><span style={{ color: '#e74c3c' }}>&#9632;</span> Liquidation zone</span>
              </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, maxHeight: '220px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                    <th style={{ padding: '4px 8px' }}>Month</th>
                    <th style={{ padding: '4px 8px' }}>Debt</th>
                    <th style={{ padding: '4px 8px' }}>Interest</th>
                    <th style={{ padding: '4px 8px' }}>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {projections
                    .filter((_, i) => i % Math.max(1, Math.floor(months / 12)) === 0 || i === projections.length - 1)
                    .map((row) => (
                      <tr
                        key={row.month}
                        style={{
                          borderBottom: '1px solid #eee',
                          backgroundColor: row.healthFactor < 1 ? '#ffeaea' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '4px 8px' }}>{row.month}</td>
                        <td style={{ padding: '4px 8px' }}>{row.debt.toFixed(2)}</td>
                        <td style={{ padding: '4px 8px', color: '#c0392b' }}>
                          +{row.interest.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '4px 8px',
                            color: row.healthFactor < 1 ? '#e74c3c' : row.healthFactor < 1.2 ? '#e67e22' : '#27ae60',
                            fontWeight: row.healthFactor < 1 ? 'bold' : 'normal',
                          }}
                        >
                          {row.healthFactor.toFixed(2)}
                          {row.healthFactor < 1 && ' ⚠️'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {borrowAmount <= 0 && (
        <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '20px' }}>
          Enter a collateral and borrow amount above to see interest projections.
        </p>
      )}
    </div>
  )
}

const SummaryCard: React.FC<{
  label: string
  value: string
  sublabel?: string
  color?: string
}> = ({ label, value, sublabel, color }) => (
  <div
    style={{
      backgroundColor: '#fff',
      borderRadius: '6px',
      padding: '12px',
      border: '1px solid #e0e0e0',
    }}
  >
    <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px' }}>{label}</p>
    <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px', color: color || '#333' }}>
      {value}
    </p>
    {sublabel && <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{sublabel}</p>}
  </div>
)
