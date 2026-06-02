import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import MilestoneAlert from './components/MilestoneAlert'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Timers from './pages/Timers'
import TriggerLog from './pages/TriggerLog'
import AIChat from './pages/AIChat'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import { motion, AnimatePresence } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center text-[#8B8FA8]">Loading…</div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-[#0F1117]">
      <Navbar />
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="h-full w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <MilestoneAlert />
    </div>
  )
}

function PublicRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/timers" element={<Timers />} />
              <Route path="/triggers" element={<TriggerLog />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Analytics />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
