import { useState, useEffect } from 'react'
import '../styles/PacienteRegistrationForm.css'

import logo from '../assets/Logo_UI.png'
import nameIcon from '../assets/Name.png'
import emailIcon from '../assets/Email.png'
import lockIcon from '../assets/Lock.png'
import documentIcon from '../assets/Document.png'

import bg1 from '../assets/Background-Registro.png'
import bg2 from '../assets/Background-Register2.png'
import bg3 from '../assets/Background-Register3.png'

const backgrounds = [bg1, bg2, bg3]

// TODO: actualizar cuando el backend implemente el endpoint de pacientes
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`

function PacienteRegistrationForm() {
  const [nombre, setNombre] = useState('')
  const [documentType, setDocumentType] = useState('CC')
  const [documentNumber, setDocumentNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const validate = () => {
    const newErrors = {}

    if (nombre.trim() === '') {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = 'Mínimo 3 caracteres'
    }

    if (documentNumber.trim() === '') {
      newErrors.documentNumber = 'El número de documento es obligatorio'
    } else if (documentType === 'CC' && isNaN(documentNumber)) {
      newErrors.documentNumber = 'La cédula solo acepta números'
    }

    if (email.trim() === '') {
      newErrors.email = 'El correo es obligatorio'
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (password.trim() === '') {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setServerError('')

    const newErrors = validate()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setLoading(true)

    const requestData = {
      nombre: nombre.trim(),
      email: email.trim(),
      password,
      role: 'PACIENTE'
      // TODO: agregar documentType y documentNumber cuando el backend lo soporte
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        setSuccess('¡Paciente registrado con éxito!')
        setNombre('')
        setDocumentType('CC')
        setDocumentNumber('')
        setEmail('')
        setPassword('')
      } else {
        const errorData = await response.json().catch(() => null)
        const mensajeError =
          errorData?.error ||
          (Array.isArray(errorData?.errores) ? errorData.errores.join(', ') : null) ||
          'Error del servidor al procesar el registro.'
        setServerError(mensajeError)
      }
    } catch (error) {
      setServerError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="container"
      style={{ backgroundImage: `url(${backgrounds[currentBgIndex]})` }}
    >
      <form className="form-card" onSubmit={handleSubmit}>

        <h1>Bienvenido a</h1>
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="subtitle">Registro de Paciente</h2>

        {loading && <p className="success-message">Registrando...</p>}
        {success && <p className="success-message">{success}</p>}
        {serverError && <p className="error-server">{serverError}</p>}

        {/* Nombre */}
        <div className="input-group">
          <label>Nombre Completo</label>
          <div className="input-with-icon">
            <img src={nameIcon} alt="Name" className="inner-icon" />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese el nombre completo"
            />
          </div>
          <p className="error">{errors.nombre || ''}</p>
        </div>

        {/* Tipo de documento */}
        <div className="input-group">
          <label>Tipo de Documento</label>
          <div className="input-with-icon">
            <img src={documentIcon} alt="Document" className="inner-icon" />
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="select-custom"
            >
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="TI">Tarjeta de Identidad (TI)</option>
              <option value="PP">Pasaporte (PP)</option>
            </select>
          </div>
          <p className="error"></p>
        </div>

        {/* Número de documento */}
        <div className="input-group">
          <label>Número de Documento</label>
          <div className="input-with-icon">
            <img src={documentIcon} alt="Document" className="inner-icon" />
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Ingrese el número de documento"
            />
          </div>
          <p className="error">{errors.documentNumber || ''}</p>
        </div>

        {/* Correo */}
        <div className="input-group">
          <label>Correo Electrónico</label>
          <div className="input-with-icon">
            <img src={emailIcon} alt="Email" className="inner-icon" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese el correo electrónico"
            />
          </div>
          <p className="error">{errors.email || ''}</p>
        </div>

        {/* Contraseña */}
        <div className="input-group">
          <label>Contraseña de Acceso</label>
          <div className="input-with-icon">
            <img src={lockIcon} alt="Lock" className="inner-icon" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese una contraseña"
            />
          </div>
          <p className="error">{errors.password || ''}</p>
        </div>

        <button className="button-register" type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 'Registrar Paciente'}
        </button>

      </form>
    </div>
  )
}

export default PacienteRegistrationForm
