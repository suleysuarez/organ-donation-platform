import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import RegistrationForm from './components/RegistrationForm'
import MedRegistrationForm from './components/MedRegistrationForm'
import MedicosListPage from './components/MedicosListPage'
import MedicoDetailPage from './components/MedicoDetailPage'
import PacientesListPage from './components/PacientesListPage'
import PacienteRegistrationForm from './components/PacienteRegistrationForm'
import DonorRegistrationForm from './components/DonorRegistrationForm'
import DonantesReceptoresPage from './components/DonantesReceptoresPage'
import ReportesMedicosPage from './components/ReportesMedicosPage'
import SeguimientoDonacion from './components/SeguimientoDonacion'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Todas las rutas están abiertas para pruebas libres */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register-user" element={<RegistrationForm />} />
        <Route path="/register-medic" element={<MedRegistrationForm />} />
        <Route path="/register-paciente" element={<PacienteRegistrationForm />} />
        <Route path="/register-donante" element={<DonorRegistrationForm />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/List/medicos" element={<MedicosListPage />} />
        <Route path="/List/medicos/:id" element={<MedicoDetailPage />} />
        <Route path="/List/pacientes" element={<PacientesListPage />} />
        <Route path="/donantes" element={<DonantesReceptoresPage />} />
        <Route path="/reportes" element={<ReportesMedicosPage />} />
        <Route path="/seguimiento" element={<SeguimientoDonacion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App