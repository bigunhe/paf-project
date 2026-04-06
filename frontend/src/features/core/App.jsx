import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Layout from './Layout'
import UserDashboardPage from './UserDashboardPage'
import AdminDashboardPage from './AdminDashboardPage'
import UserAccountPage from './UserAccountPage'
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

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/app" replace />} />
            <Route path="login" element={<LoginPage />} />

            <Route path="app" element={<Outlet />}>
              <Route index element={<UserDashboardPage />} />
              <Route path="resources" element={<ResourceCatalogPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="report" element={<TicketsPage />} />
              <Route path="account" element={<UserAccountPage />} />
            </Route>

            <Route path="admin" element={<Outlet />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="resources" element={<ResourceCatalogPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="incidents" element={<TicketsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
