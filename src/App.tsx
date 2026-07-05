import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SessionTimeout } from '@/components/SessionTimeout'
import { ConsentModal } from '@/components/ConsentModal'

import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Login from './pages/Login'

import PatientHome from './pages/patient/Home'
import PatientQuestionnaires from './pages/patient/Questionnaires'
import QuestionnaireFormPage from './pages/patient/QuestionnaireFormPage'
import PatientLibrary from './pages/patient/Library'
import Bonus from './pages/Bonus'

import ProDashboard from './pages/professional/Dashboard'
import PatientDetail from './pages/professional/PatientDetail'
import ProQuestionnaireSettings from './pages/professional/QuestionnaireSettings'
import ProMaterials from './pages/professional/Materials'
import AuditDashboard from './pages/professional/AuditDashboard'
import Profile from './pages/Profile'

function SessionGuard() {
  const { isAuthenticated, signOut } = useAuth()
  if (!isAuthenticated) return null
  return <SessionTimeout onTimeout={signOut} />
}

function ConsentGuard() {
  const { user, isAuthenticated, acceptConsent } = useAuth()
  const needsConsent = isAuthenticated && user?.role === 'patient' && !user?.consent_accepted
  if (!needsConsent) return null
  return <ConsentModal open={needsConsent} onAccept={acceptConsent} />
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SessionGuard />
        <ConsentGuard />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/bonus" element={<Bonus />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="patient" />}>
            <Route element={<Layout />}>
              <Route path="/patient" element={<PatientHome />} />
              <Route path="/patient/questionnaires" element={<PatientQuestionnaires />} />
              <Route path="/patient/questionnaires/:week" element={<QuestionnaireFormPage />} />
              <Route path="/patient/library" element={<PatientLibrary />} />
              <Route path="/bonus" element={<Bonus />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="professional" />}>
            <Route element={<Layout />}>
              <Route path="/pro" element={<ProDashboard />} />
              <Route path="/pro/patient/:id" element={<PatientDetail />} />
              <Route path="/pro/questionnaire-settings" element={<ProQuestionnaireSettings />} />
              <Route path="/pro/materials" element={<ProMaterials />} />
              <Route path="/pro/audit" element={<AuditDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
