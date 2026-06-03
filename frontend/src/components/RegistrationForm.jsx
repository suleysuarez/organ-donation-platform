import '../styles/RegistrationForm.css'
import { useState } from 'react'
//import logo from '../assets/logo.png'

function RegistrationForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

const handleSubmit = (e) => {
  e.preventDefault()
  setSuccess('')
  setServerError('')

  let newErrors = {}

  if (nombre.trim() === '') {
    newErrors.nombre = 'El nombre es obligatorio'
  } else if (nombre.trim().length < 3) {
    newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
  }


  if (email.trim() === '') {
    newErrors.email = 'El correo es obligatorio'
  } else if (
    !email.includes('@') ||
    !email.includes('.')
  ) {
    newErrors.email = 'Correo electrónico inválido'
  }


  if (password === '') {
    newErrors.password = 'La contraseña es obligatoria'
  } else if (password.length < 8) {
    newErrors.password = 'La contraseña debe tener mínimo 8 caracteres'
  }

  setErrors(newErrors)

  if (Object.keys(newErrors).length === 0) {
    setSuccess('Formulario validado correctamente')
  }
}
  return (
  <div className="container">
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>Registro de Usuario</h1>

      <hr className="title-line" />
      
      <h2 className="subtitle">Ingrese sus datos</h2>
      {loading && <p>Registrando...</p>}

      {success && (
        <p className="success-message">
          {success}
        </p>
      )}

      {serverError && (
        <p className="error">
          {serverError}
        </p>
      )}
  
      <div className="input-group">
        <label>Nombre de Usuario:</label>
        <br />
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder='Ingrese su nombre de usuario'
        />
        <p className="error">{errors.nombre}</p>
      </div>

      <div className="input-group">
        <label>Correo Electrónico:</label>
        <br />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Ingrese su correo electrónico'
        />
        <p className="error">{errors.email}</p>
      </div>

      <div className="input-group">
        <label>Contraseña:</label>
        <br />
        <input
          type="password"
          value={password}
          placeholder='Ingrese su contraseña'
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="error">{errors.password}</p>
      </div>

      <button className="button-register" type="submit">
        Registrarse
      </button>
    </form>
  </div>
)

}

export default RegistrationForm