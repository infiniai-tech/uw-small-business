import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '@/components/LandingPage'
import HomeDashboard from '@/components/dashboards/HomeDashboard'
import AdminDashboard from '@/components/dashboards/AdminDashboard'
import BrokerDashboard from '@/components/dashboards/BrokerDashboard'
import UnderwriterDashboard from '@/components/dashboards/UnderwriterDashboard'

function App() {
  return (
    <BrowserRouter basename="/uw-small-business">
      <Routes>
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/broker" element={<BrokerDashboard />} />
        <Route path="/underwriter" element={<UnderwriterDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
