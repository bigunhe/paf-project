import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Layout from './Layout'
import DashboardPage from './DashboardPage'
import LoginPage from '../auth/LoginPage'
import ResourceCatalogPage from '../facilities/ResourceCatalogPage'
import BookingsPage from '../bookings/BookingsPage'
import TicketsPage from '../maintenance/TicketsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="resources" element={<ResourceCatalogPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
