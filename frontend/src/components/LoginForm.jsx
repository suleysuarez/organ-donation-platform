import '../styles/LoginForm.css'
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../assets/Logo_UI.png'
import emailIcon from '../assets/Email.png'
import lockIcon from '../assets/Lock.png'

import bg1 from '../assets/Background-Registro.png'
import bg2 from '../assets/Background-Register2.png'
import bg3 from '../assets/Background-Register3.png'

const backgrounds = [bg1, bg2, bg3]

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    let newErrors = {}

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

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('token', data.token)
          navigate('/dashboard')
        } else {
          const errorData = await response.json().catch(() => null)
          const mensajeError = errorData?.error
            || (Array.isArray(errorData?.errores) ? errorData.errores.join(', ') : null)
            || 'Correo o contraseña incorrectos.'
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
    <div
      className="container"
      style={{ backgroundImage: `url(${backgrounds[currentBgIndex]})` }}
    >
      <form className="form-card" onSubmit={handleSubmit}>

        <h1>Bienvenido a</h1>
        <img src={logo} alt="Logo" className="logo" />

        <h2 className="subtitle">Inicia sesión</h2>

        {loading && <p className="success-message">Iniciando sesión...</p>}
        {serverError && <p className="error-server">{serverError}</p>}

        <div className="input-group">
          <label>Correo Electrónico:</label>
          <div className="input-with-icon">
            <img src={emailIcon} alt="Email" className="inner-icon" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese su correo electrónico"
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </div>
          <p className="error">{errors.password || ''}</p>
        </div>

        <button className="button-register" type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 'Iniciar Sesión'}
        </button>

        <div className="register-links">
          <p>¿No tienes cuenta?</p>
          <Link to="/register-user" className="link-register">Usuario</Link>
          <span className="link-separator">|</span>
          <Link to="/register-medic" className="link-register">Médico</Link>
        </div>

      </form>
    </div>
  )
}

export default LoginForm