import { useState } from 'react'
import LandingPage from '@/components/LandingPage'
import AdminDashboard from '@/components/dashboards/AdminDashboard'
import BrokerDashboard from '@/components/dashboards/BrokerDashboard'
import UnderwriterDashboard from '@/components/dashboards/UnderwriterDashboard'

function App() {
  const [currentView, setCurrentView] = useState('landing') // landing, admin, broker, underwriter

  const handleSelectRole = (role) => {
    setCurrentView(role)
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
  }

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage onSelectRole={handleSelectRole} />
      )}
      {currentView === 'admin' && (
        <AdminDashboard onBack={handleBackToLanding} />
      )}
      {currentView === 'broker' && (
        <BrokerDashboard onBack={handleBackToLanding} />
      )}
      {currentView === 'underwriter' && (
        <UnderwriterDashboard onBack={handleBackToLanding} />
      )}
    </>
  )
}

export default App
