import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home.jsx'
import Edit from './pages/Edit.jsx'
import Progress from './pages/Progress.jsx'
import Official from './pages/Official.jsx'
import AuthGate from './components/AuthGate.jsx'
import useSessionStore from './store/session.js'
import OfficialManage from './pages/OfficialManage.jsx'

function GuardedEdit() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <AuthGate />
  return <Edit />
}

function GuardedProgress() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <AuthGate />
  return <Progress />
}

function GuardedOfficialManage() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const role = useSessionStore((s) => s.role)
  if (!isAuthenticated || role !== 'editor') return <AuthGate />
  return <OfficialManage />
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/official" element={<Official />} />
        <Route path="/edit" element={<GuardedEdit />} />
        <Route path="/edit/official" element={<GuardedOfficialManage />} />
        <Route path="/edit/progress" element={<GuardedProgress />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}