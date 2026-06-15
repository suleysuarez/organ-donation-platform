import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import RegistrationForm from './components/RegistrationForm'
import MedRegistrationForm from './components/MedRegistrationForm'
import MedicosListPage from './components/MedicosListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<LoginForm />} />
        <Route path="/register-user" element={<RegistrationForm />} />
        <Route path="/register-medic" element={<MedRegistrationForm />} />
        <Route path="/List/medicos" element={<MedicosListPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App