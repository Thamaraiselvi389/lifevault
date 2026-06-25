import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute, PublicRoute } from '@/components/layout/ProtectedRoute'
import LoginPage, { SignUpPage, ForgotPasswordPage } from '@/pages/auth/AuthPages'
import DashboardPage from '@/pages/DashboardPage'
import DocumentsPage from '@/pages/DocumentsPage'
import TasksPage from '@/pages/TasksPage'
import DiaryPage from '@/pages/DiaryPage'
import GoalsPage from '@/pages/GoalsPage'
import MessagesPage from '@/pages/MessagesPage'
import EmergencyPage from '@/pages/EmergencyPage'
import EmergencyPublicPage from '@/pages/EmergencyPublicPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import TimelinePage from '@/pages/TimelinePage'
import SearchPage from '@/pages/SearchPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            <Route path="/emergency/:token" element={<EmergencyPublicPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/diary" element={<DiaryPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/search" element={<SearchPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
