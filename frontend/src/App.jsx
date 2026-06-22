import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import MedRegistrationForm from './components/MedRegistrationForm'
import MedicosListPage from './components/MedicosListPage'
import MedicoDetailPage from './components/MedicoDetailPage'
import DonantesListPage from './components/DonantesListPage'
import PacientesListPage from './components/PacientesListPage'
import PacienteRegistrationForm from './components/PacienteRegistrationForm'
import PacienteEditForm from './components/PacienteEditForm'
import RegistrosPage from './components/RegistrosPage' 
import DonanteRegistrationForm from './components/DonanteRegistrationForm' 
import ReportesMedicosPage from './components/ReportesMedicosPage'
import SeguimientoDonacion from './components/SeguimientoDonacion'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import GlobalBackButton from './components/GlobalBackButton'
import AppBrandLogo from './components/AppBrandLogo'

function App() {
  return (
    <BrowserRouter>
      <AppBrandLogo />
      <GlobalBackButton />
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register-medic" element={<MedRegistrationForm />} />
        <Route path="/register-paciente" element={<ProtectedRoute><PacienteRegistrationForm /></ProtectedRoute>} />
        <Route path="/register-donante" element={<ProtectedRoute><DonanteRegistrationForm /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/List/medicos" element={<ProtectedRoute><MedicosListPage /></ProtectedRoute>} />
        <Route path="/List/medicos/:id" element={<ProtectedRoute><MedicoDetailPage /></ProtectedRoute>} />
        <Route path="/List/donantes" element={<ProtectedRoute><DonantesListPage /></ProtectedRoute>} />
        <Route path="/List/pacientes" element={<ProtectedRoute><PacientesListPage /></ProtectedRoute>} />
        <Route path="/List/pacientes/:id/editar" element={<ProtectedRoute><PacienteEditForm /></ProtectedRoute>} />

        {/* Cambiado oficialmente a /registros */}
        <Route path="/registros" element={<ProtectedRoute><RegistrosPage /></ProtectedRoute>} /> 
        
        <Route path="/reportes" element={<ProtectedRoute><ReportesMedicosPage /></ProtectedRoute>} />
        <Route path="/seguimiento" element={<ProtectedRoute><SeguimientoDonacion /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App