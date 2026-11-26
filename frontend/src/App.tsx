import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './features/auth/RequireAuth'
import { Roles } from './features/auth/roles'
import AccountPage from './pages/AccountPage'
import AdminServicesPage from './pages/AdminServicesPage'
import CounterPage from './pages/CounterPage'
import HomePage from './pages/HomePage'
import InvoicesPage from './pages/InvoicesPage'
import LoginPage from './pages/LoginPage'
import NewOrderPage from './pages/NewOrderPage'
import NotFoundPage from './pages/NotFoundPage'
import OrdersPage from './pages/OrdersPage'
import RegisterPage from './pages/RegisterPage'
import ServicesPage from './pages/ServicesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="services" element={<ServicesPage />} />

        {/* Any signed-in user */}
        <Route element={<RequireAuth />}>
          <Route path="account" element={<AccountPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/new" element={<NewOrderPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
        </Route>

        {/* Staff: admins and technicians */}
        <Route element={<RequireAuth roles={[Roles.Admin, Roles.Technician]} />}>
          <Route path="staff/counter" element={<CounterPage />} />
        </Route>

        {/* Admin only */}
        <Route element={<RequireAuth roles={[Roles.Admin]} />}>
          <Route path="admin/services" element={<AdminServicesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
