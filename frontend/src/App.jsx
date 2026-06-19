import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import RegistrationForm from './components/RegistrationForm'
import MedRegistrationForm from './components/MedRegistrationForm'
import MedicosListPage from './components/MedicosListPage'
import PacientesListPage from './components/PacientesListPage'
import PacienteRegistrationForm from './components/PacienteRegistrationForm'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register-user" element={<RegistrationForm />} />

        {/* Rutas protegidas */}
        <Route path="/register-medic" element={
          <ProtectedRoute>
            <MedRegistrationForm />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/List/medicos" element={
          <ProtectedRoute>
            <MedicosListPage />
          </ProtectedRoute>
        } />
        <Route path="/List/pacientes" element={
          <ProtectedRoute>
            <PacientesListPage />
          </ProtectedRoute>
        } />
        <Route path="/register-paciente" element={
          <ProtectedRoute>
            <PacienteRegistrationForm />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App