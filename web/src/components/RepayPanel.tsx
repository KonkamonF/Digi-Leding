import React, { useState } from 'react'
import { useLendingProtocol } from '../hooks/useLendingProtocol'
import { Button } from './common/Button'
import { Input } from './common/Input'
import { formatTokens } from '../utils/calculations'

export const RepayPanel: React.FC = () => {
  const { repay, debtTokens, loading } = useLendingProtocol()
  const [amount, setAmount] = useState('')

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h3>Repay Debt</h3>
      <p style={{ fontSize: '12px', color: '#666' }}>Current Debt: {formatTokens(debtTokens)}</p>
      <Input label="Amount (Tokens)" value={amount} onChange={setAmount} placeholder="0.0" />
      <Button onClick={() => repay(amount)} disabled={!amount || loading}>
        Repay
      </Button>
    </div>
  )
}
