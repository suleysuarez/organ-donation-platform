import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/PacienteRegistrationForm.css' // Usamos el mismo CSS para mantener el diseño idéntico

import logo from '../assets/Logo_UI.png'
import nameIcon from '../assets/Name.png'
import emailIcon from '../assets/Email.png'
import documentIcon from '../assets/Document.png'
import profileIcon from '../assets/Profile.png'

import bg1 from '../assets/Background-Registro.png'
import bg2 from '../assets/Background-Register2.png'
import bg3 from '../assets/Background-Register3.png'

const backgrounds = [bg1, bg2, bg3]

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_URL = `${BASE_URL}/api/donantes` // Endpoint de donantes
const MEDICOS_URL = `${BASE_URL}/api/medicos`

function DonanteRegistrationForm() {
  const navigate = useNavigate()
  const [medicos, setMedicos] = useState([])
  const [loadingMedicos, setLoadingMedicos] = useState(true)
  const [registeredById, setRegisteredById] = useState('')

  // Campos del donante
  const [fullName, setFullName] = useState('')
  const [documentType, setDocumentType] = useState('CC')
  const [documentNumber, setDocumentNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [address, setAddress] = useState('')
  const [medicalNotes, setMedicalNotes] = useState('')

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  // Animación de fondo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Cargar médicos
  useEffect(() => {
    const fetchMedicos = async () => {
      setLoadingMedicos(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${MEDICOS_URL}?size=100&sort=fullName,asc`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setMedicos(data.content || [])
        }
      } catch {
        // Si falla, el select queda vacío
      } finally {
        setLoadingMedicos(false)
      }
    }
    fetchMedicos()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setServerError('')

    const newErrors = {}

    if (!registeredById) {
      newErrors.registeredById = 'Debe seleccionar el médico que registra'
    }

    if (fullName.trim() === '') {
      newErrors.fullName = 'El nombre completo es obligatorio'
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Mínimo 3 caracteres'
    }

    if (documentNumber.trim() === '') {
      newErrors.documentNumber = 'El número de documento es obligatorio'
    } else if (documentType === 'CC' && isNaN(documentNumber)) {
      newErrors.documentNumber = 'La cédula de ciudadanía solo acepta números'
    }

    if (contactEmail.trim() && (!contactEmail.includes('@') || !contactEmail.includes('.'))) {
      newErrors.contactEmail = 'Correo de contacto inválido'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setLoading(true)

      const requestData = {
        registeredById: Number(registeredById),
        fullName: fullName.trim(),
        documentType,
        documentNumber: documentNumber.trim(),
        birthDate: birthDate || null,
        sex: sex || null,
        bloodType: bloodType || null,
        contactPhone: contactPhone.trim() || null,
        contactEmail: contactEmail.trim() || null,
        address: address.trim() || null,
        medicalNotes: medicalNotes.trim() || null,
      }

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData),
        })

        if (response.ok || response.status === 201) {
          setSuccess('¡Donante registrado con éxito!')
          setRegisteredById('')
          setFullName('')
          setDocumentType('CC')
          setDocumentNumber('')
          setBirthDate('')
          setSex('')
          setBloodType('')
          setContactPhone('')
          setContactEmail('')
          setAddress('')
          setMedicalNotes('')
          setTimeout(() => navigate('/List/donantes'), 1000)
        } else {
          const errorData = await response.json().catch(() => null)
          const mensajeError =
            errorData?.error ||
            (Array.isArray(errorData?.errores) ? errorData.errores.join(', ') : null) ||
            'Error del servidor al procesar el registro.'
          setServerError(mensajeError)
        }
      } catch {
        setServerError('No se pudo conectar con el servidor. Verifica si el backend está encendido.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div
      className="paciente-container"
      style={{ backgroundImage: `url(${backgrounds[currentBgIndex]})` }}
    >
      <form className="form-card" onSubmit={handleSubmit} style={{ maxHeight: '90vh', overflowY: 'auto' }}>

        <h1 className="main-title">Bienvenido a</h1>
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="subtitle">Registro de Donante</h2>

        {loading && <p className="success-message">Registrando...</p>}
        {success && <p className="success-message">{success}</p>}
        {serverError && <p className="error-server">{serverError}</p>}

        {/* registered_by */}
        <div className="input-group">
          <label>Médico Registrador <span style={{ color: '#d92d20' }}>*</span></label>
          <div className="input-with-icon">
            <img src={profileIcon} alt="Médico" className="inner-icon" />
            <select
              value={registeredById}
              onChange={(e) => setRegisteredById(e.target.value)}
              className="select-custom"
              disabled={loadingMedicos}
            >
              <option value="">
                {loadingMedicos ? 'Cargando médicos...' : 'Seleccionar médico...'}
              </option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} — {m.email}
                </option>
              ))}
            </select>
          </div>
          <p className="error">{errors.registeredById || ''}</p>
        </div>

        {/* full_name */}
        <div className="input-group">
          <label>Nombre Completo <span style={{ color: '#d92d20' }}>*</span></label>
          <div className="input-with-icon">
            <img src={nameIcon} alt="Nombre" className="inner-icon" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ingrese el nombre completo"
            />
          </div>
          <p className="error">{errors.fullName || ''}</p>
        </div>

        {/* document_type */}
        <div className="input-group">
          <label>Tipo de Documento</label>
          <div className="input-with-icon">
            <img src={documentIcon} alt="Tipo doc" className="inner-icon" />
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

        {/* document_number */}
        <div className="input-group">
          <label>Número de Documento <span style={{ color: '#d92d20' }}>*</span></label>
          <div className="input-with-icon">
            <img src={documentIcon} alt="Número doc" className="inner-icon" />
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Ingrese el número de documento"
            />
          </div>
          <p className="error">{errors.documentNumber || ''}</p>
        </div>

        {/* birth_date */}
        <div className="input-group">
          <label>Fecha de Nacimiento</label>
          <div className="input-with-icon">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={{ paddingLeft: '16px' }}
            />
          </div>
          <p className="error"></p>
        </div>

        {/* sex */}
        <div className="input-group">
          <label>Sexo</label>
          <div className="input-with-icon">
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="select-custom"
              style={{ paddingLeft: '16px' }}
            >
              <option value="">Seleccionar...</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <p className="error"></p>
        </div>

        {/* blood_type */}
        <div className="input-group">
          <label>Tipo de Sangre</label>
          <div className="input-with-icon">
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="select-custom"
              style={{ paddingLeft: '16px' }}
            >
              <option value="">Seleccionar...</option>
              <option value="A_POS">A+</option>
              <option value="A_NEG">A-</option>
              <option value="B_POS">B+</option>
              <option value="B_NEG">B-</option>
              <option value="AB_POS">AB+</option>
              <option value="AB_NEG">AB-</option>
              <option value="O_POS">O+</option>
              <option value="O_NEG">O-</option>
            </select>
          </div>
          <p className="error"></p>
        </div>

        {/* contact_phone */}
        <div className="input-group">
          <label>Teléfono de Contacto</label>
          <div className="input-with-icon">
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Ingrese el teléfono de contacto"
              style={{ paddingLeft: '16px' }}
            />
          </div>
          <p className="error"></p>
        </div>

        {/* contact_email */}
        <div className="input-group">
          <label>Correo de Contacto</label>
          <div className="input-with-icon">
            <img src={emailIcon} alt="Correo contacto" className="inner-icon" />
            <input
              type="text"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Correo de contacto del donante"
            />
          </div>
          <p className="error">{errors.contactEmail || ''}</p>
        </div>

        {/* address */}
        <div className="input-group">
          <label>Dirección</label>
          <div className="input-with-icon">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dirección de residencia"
              style={{ paddingLeft: '16px' }}
            />
          </div>
          <p className="error"></p>
        </div>

        {/* medical_notes */}
        <div className="input-group">
          <label>Notas Médicas</label>
          <div className="input-with-icon">
            <textarea
              className="select-custom" // Reutilizamos esta clase para mantener el estilo del borde y padding
              rows={3}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="Observaciones clínicas (opcional)"
              style={{ paddingLeft: '16px', height: 'auto', paddingTop: '10px', resize: 'vertical' }}
            />
          </div>
          <p className="error"></p>
        </div>

        <button className="button-register" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
          {loading ? 'Procesando...' : 'Registrar Donante'}
        </button>

      </form>
    </div>
  )
}

export default DonanteRegistrationForm
