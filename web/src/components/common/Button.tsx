import React from 'react'

interface ButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ onClick, disabled, loading, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '10px 20px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: disabled || loading ? '#ccc' : '#007bff',
        color: 'white',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Processing...' : children}
    </button>
  )
}
