import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './features/auth/RequireAuth'
import AccountPage from './pages/AccountPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Any signed-in user */}
        <Route element={<RequireAuth />}>
          <Route path="account" element={<AccountPage />} />
        </Route>

        {/* Next steps:
            <Route element={<RequireAuth roles={[Roles.Admin]} />}> ...admin pages... </Route> */}

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
