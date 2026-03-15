import React from 'react'
import { Web3Provider } from './context/Web3Context'
import { LendingProvider } from './context/LendingContext'
import { WalletConnect } from './components/WalletConnect'
import { PortfolioOverview } from './components/PortfolioOverview'
import { CollateralPanel } from './components/CollateralPanel'
import { BorrowPanel } from './components/BorrowPanel'
import { RepayPanel } from './components/RepayPanel'
import { InterestDisplay } from './components/InterestDisplay'
import { BorrowCalculator } from './components/BorrowCalculator'
import { useWeb3 } from './hooks/useWeb3'

const AppContent: React.FC = () => {
  const { isConnected } = useWeb3()

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <WalletConnect />
      {isConnected ? (
        <LendingProvider>
          <PortfolioOverview />
          <InterestDisplay />
          <CollateralPanel />
          <BorrowPanel />
          <BorrowCalculator />
          <RepayPanel />
        </LendingProvider>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Please connect your wallet to continue</p>
        </div>
      )}
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  )
}
