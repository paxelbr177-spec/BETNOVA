import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Casino from './pages/Casino.jsx'
import Sports from './pages/Sports.jsx'
import Promotions from './pages/Promotions.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import Wallet from './pages/Wallet.jsx'
import BetHistory from './pages/BetHistory.jsx'
import GameDetail from './pages/GameDetail.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/deportes" element={<Sports />} />
          <Route path="/promociones" element={<Promotions />} />
          <Route path="/juego/:id" element={<GameDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/cuenta" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cuenta/billetera" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/cuenta/apuestas" element={<ProtectedRoute><BetHistory /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
