import React, { useState } from 'react'
import { useLendingProtocol } from '../hooks/useLendingProtocol'
import { Button } from './common/Button'
import { Input } from './common/Input'
import { formatTokens } from '../utils/calculations'

export const BorrowPanel: React.FC = () => {
  const { borrow, maxBorrowable, loading } = useLendingProtocol()
  const [amount, setAmount] = useState('')

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h3>Borrow Tokens</h3>
      <p style={{ fontSize: '12px', color: '#666' }}>Max Borrowable: {formatTokens(maxBorrowable)}</p>
      <Input label="Amount (Tokens)" value={amount} onChange={setAmount} placeholder="0.0" />
      <Button onClick={() => borrow(amount)} disabled={!amount || loading}>
        Borrow
      </Button>
    </div>
  )
}
