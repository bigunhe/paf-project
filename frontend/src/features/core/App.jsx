import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Layout from './Layout'
import HomePage from './HomePage'
import NotFoundPage from './NotFoundPage'
import UserDashboardPage from './UserDashboardPage'
import AdminDashboardPage from './AdminDashboardPage'
import UserAccountPage from './UserAccountPage'
import AuthCallbackPage from './AuthCallbackPage'
import ProfileSetupPage from './ProfileSetupPage'
import RequireCompleteProfile from './RequireCompleteProfile'
import { RequireAdmin, RequireAuth } from './RequireAuth'
import LoginPage from '../auth/LoginPage'
import AdminUsersPage from '../auth/AdminUsersPage'
import ResourceCatalogPage from '../facilities/ResourceCatalogPage'
import BookingsPage from '../bookings/BookingsPage'
import TicketsPage from '../maintenance/TicketsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/resources" element={<Navigate to="/app/resources" replace />} />
          <Route path="/bookings" element={<Navigate to="/app/bookings" replace />} />
          <Route path="/tickets" element={<Navigate to="/app/report" replace />} />

          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="auth/callback" element={<AuthCallbackPage />} />

            <Route element={<RequireAuth />}>
              <Route path="complete-profile" element={<ProfileSetupPage />} />
              <Route element={<RequireCompleteProfile />}>
                <Route path="app" element={<Outlet />}>
                  <Route index element={<UserDashboardPage />} />
                  <Route path="resources" element={<ResourceCatalogPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="report" element={<TicketsPage />} />
                  <Route path="account" element={<UserAccountPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route path="admin" element={<RequireAdmin />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="resources" element={<ResourceCatalogPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="incidents" element={<TicketsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
