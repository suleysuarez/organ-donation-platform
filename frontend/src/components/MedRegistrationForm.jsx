import { useState, useEffect } from 'react'
import '../styles/MedRegistrationForm.css'

import logo from '../assets/Logo_UI.png'
import nameIcon from '../assets/Name.png'
import emailIcon from '../assets/Email.png'
import documentIcon from '../assets/Document.png' 
import rethusIcon from '../assets/Rethus.png'     
import profileIcon from '../assets/Profile.png'    
import lockIcon from '../assets/Lock.png'

import bg1 from '../assets/Background-Registro.png'
import bg2 from '../assets/Background-Register2.png'
import bg3 from '../assets/Background-Register3.png'

const backgrounds = [bg1, bg2, bg3]

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/medicos`

function MedRegistrationForm() {
  const [fullName, setFullName] = useState('')
  const [documentType, setDocumentType] = useState('CC') 
  const [documentNumber, setDocumentNumber] = useState('')
  const [rethusRegistrationNumber, setRethusRegistrationNumber] = useState('')
  const [professionalProfile, setProfessionalProfile] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])


  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setServerError('')

    let newErrors = {}

    if (fullName.trim() === '') {
      newErrors.fullName = 'El nombre completo es obligatorio'
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Mínimo 3 caracteres'
    }

    if (documentNumber.trim() === '') {
      newErrors.documentNumber = 'El número de documento es obligatorio'
    } else if (isNaN(documentNumber)) {
      newErrors.documentNumber = 'Solo números'
    }

    if (email.trim() === '') {
      newErrors.email = 'El correo es obligatorio'
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (password.trim() === '') {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (password.length < 8) {
      newErrors.password = 'Debe tener mínimo 8 caracteres'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setLoading(true)

     
      const requestData = {
        fullName: fullName.trim(),
        documentType: documentType,
        documentNumber: documentNumber.trim(),
        email: email.trim(),
        password: password,
        rethusRegistrationNumber: rethusRegistrationNumber.trim() || null,
        professionalProfile: professionalProfile.trim() || null
      }

      try {
       
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        })

       
        if (response.ok || response.status === 201) {
          setSuccess('¡Médico registrado con éxito!')

          setFullName('')
          setDocumentType('CC')
          setDocumentNumber('')
          setRethusRegistrationNumber('')
          setProfessionalProfile('')
          setEmail('')
          setPassword('')
        } else {
         
          const errorData = await response.json().catch(() => null)
          setServerError(errorData?.message || 'Error del servidor al procesar el registro.')
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

        <h1 className="main-title">Bienvenido a</h1>
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="subtitle">Registro de Médico</h2>

        {loading && (
          <p className="success-message">
            Registrando...
          </p>
        )}

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

        <div className="input-group full-width">
          <label>Nombre Completo</label>
          <div className="input-with-icon">
            <img src={nameIcon} alt="Name" className="inner-icon" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ingrese el nombre completo"
            />
          </div>
          <p className="error">{errors.fullName || ''}</p>
        </div>

        <div className="input-group">
          <label>Tipo de Documento</label>
          <div className="input-with-icon">
            <img src={documentIcon} alt="Document Type" className="inner-icon" />
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="select-custom"
            >
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="PP">Pasaporte (PP)</option>
            </select>
          </div>
          <p className="error"></p>
        </div>

        <div className="input-group">
          <label>Número de Documento</label>
          <div className="input-with-icon">
            <img src={documentIcon} alt="Document Number" className="inner-icon" />
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Ingrese el número de documento"
            />
          </div>
          <p className="error">{errors.documentNumber || ''}</p>
        </div>

        <div className="input-group">
          <label>Número RETHUS</label>
          <div className="input-with-icon">
            <img src={rethusIcon} alt="Rethus" className="inner-icon" />
            <input
              type="text"
              value={rethusRegistrationNumber}
              onChange={(e) => setRethusRegistrationNumber(e.target.value)}
              placeholder="Ingrese el número RETHUS"
            />
          </div>
          <p className="error">{errors.rethusRegistrationNumber || ''}</p>
        </div>

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

        <div className="input-group">
          <label>Contraseña de Acceso</label>
          <div className="input-with-icon">
            <img src={lockIcon} alt="Lock" className="inner-icon" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </div>
          <p className="error">{errors.password || ''}</p>
        </div>

        <div className="input-group">
          <label>Perfil Profesional / Especialidad</label>
          <div className="input-with-icon">
            <img src={profileIcon} alt="Profile" className="inner-icon" />
            <input
              type="text"
              value={professionalProfile}
              onChange={(e) => setProfessionalProfile(e.target.value)}
              placeholder="Ingrese su especialidad"
            />
          </div>
          <p className="error">{errors.professionalProfile || ''}</p>
        </div>

        <button
          className="button-register"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Registrar Médico'}
        </button>

      </form>
    </div>
  )
}

export default MedRegistrationForm;