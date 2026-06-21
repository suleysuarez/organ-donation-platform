import '../styles/RegistrationForm.css'
import { useState } from 'react'
import logo from '../assets/Logo_UI.png'
import nameIcon from '../assets/Name.png'
import emailIcon from '../assets/Email.png'
import lockIcon from '../assets/Lock.png'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`

function RegistrationForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setServerError('')

    let newErrors = {}

    if (nombre.trim() === '') {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = 'Mínimo 3 caracteres'
    }

    if (email.trim() === '') {
      newErrors.email = 'El correo es obligatorio'
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (password === '') {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setLoading(true)

      const requestData = {
        nombre: nombre.trim(),
        email: email.trim(),
        password: password,
        role: 'RECEPTOR'
      }

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        })

        if (response.ok) {
          setSuccess('¡Usuario registrado con éxito!')
          setNombre('')
          setEmail('')
          setPassword('')
        } else {
          const errorData = await response.json().catch(() => null)
          const mensajeError = errorData?.error
            || (Array.isArray(errorData?.errores) ? errorData.errores.join(', ') : null)
            || 'Error del servidor al procesar el registro.'
          setServerError(mensajeError)
        }
      } catch (error) {
        setServerError('No se pudo conectar con el servidor. Verifica si el backend está encendido.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="container">
      <form className="form-card" onSubmit={handleSubmit}>
        
        <h1>Bienvenido a</h1>
        <img src={logo} alt="Logo" className="logo" />
        
        <h2 className="subtitle">Ingrese sus datos</h2>
        
        {loading && <p className="success-message">Registrando...</p>}
        {success && <p className="success-message">{success}</p>}
        {serverError && <p className="error">{serverError}</p>}
  
        <div className="input-group">
          <label>Nombre de Usuario:</label>
          <div className="input-with-icon">
            <img src={nameIcon} alt="Name" className="inner-icon" />
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder='Ingrese su nombre de usuario'
            />
          </div>
          <p className="error">{errors.nombre || ''}</p>
        </div>

        <div className="input-group">
          <label>Correo Electrónico:</label>
          <div className="input-with-icon">
            <img src={emailIcon} alt="Email" className="inner-icon" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Ingrese su correo electrónico'
            />
          </div>
          <p className="error">{errors.email || ''}</p>
        </div>

        <div className="input-group">
          <label>Contraseña:</label>
          <div className="input-with-icon">
            <img src={lockIcon} alt="Password" className="inner-icon" />
            <input
              type="password"
              value={password}
              placeholder='Ingrese su contraseña'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className="error">{errors.password || ''}</p>
        </div>

        <button className="button-register" type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  )
}

export default RegistrationForm