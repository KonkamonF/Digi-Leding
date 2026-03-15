import React, { useState } from 'react'
import { useLendingProtocol } from '../hooks/useLendingProtocol'
import { Button } from './common/Button'
import { Input } from './common/Input'

export const CollateralPanel: React.FC = () => {
  const { addCollateral, removeCollateral, loading } = useLendingProtocol()
  const [addAmount, setAddAmount] = useState('')
  const [removeAmount, setRemoveAmount] = useState('')

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h3>Collateral Management</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Add Collateral (ETH)</h4>
        <Input label="Amount (ETH)" value={addAmount} onChange={setAddAmount} placeholder="0.0" />
        <Button onClick={() => addCollateral(addAmount)} disabled={!addAmount || loading}>
          Add Collateral
        </Button>
      </div>

      <div>
        <h4>Remove Collateral (ETH)</h4>
        <Input label="Amount (ETH)" value={removeAmount} onChange={setRemoveAmount} placeholder="0.0" />
        <Button onClick={() => removeCollateral(removeAmount)} disabled={!removeAmount || loading}>
          Remove Collateral
        </Button>
      </div>
    </div>
  )
}
