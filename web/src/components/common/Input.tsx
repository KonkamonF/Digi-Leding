import React from 'react'

interface InputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const Input: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          fontSize: '14px',
        }}
      />
    </div>
  )
}
