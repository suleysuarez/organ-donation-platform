import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/PacienteRegistrationForm.css'

import logo from '../assets/Logo_UI.png'
import nameIcon from '../assets/Name.png'
import emailIcon from '../assets/Email.png'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_URL = `${BASE_URL}/api/receptores`

const ESTADOS = ['EN_ESPERA', 'EN_EVALUACION', 'TRASPLANTADO', 'INACTIVO']

function PacienteEditForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loadingData, setLoadingData] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Datos no editables (solo display)
  const [documentType, setDocumentType] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')

  // Campos editables
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [organNeeded, setOrganNeeded] = useState('')
  const [urgencyLevel, setUrgencyLevel] = useState('MEDIA')
  const [status, setStatus] = useState('EN_ESPERA')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    const fetchPaciente = async () => {
      setLoadingData(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setDocumentType(data.documentType || '')
          setDocumentNumber(data.documentNumber || '')
          setFullName(data.fullName || '')
          setBirthDate(data.birthDate || '')
          setSex(data.sex || '')
          setBloodType(data.bloodType || '')
          setOrganNeeded(data.organNeeded || '')
          setUrgencyLevel(data.urgencyLevel || 'MEDIA')
          setStatus(data.status || 'EN_ESPERA')
          setContactPhone(data.contactPhone || '')
          setContactEmail(data.contactEmail || '')
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoadingData(false)
      }
    }
    fetchPaciente()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setServerError('')

    const newErrors = {}
    if (fullName.trim() === '') {
      newErrors.fullName = 'El nombre completo es obligatorio'
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Mínimo 3 caracteres'
    }
    if (contactEmail.trim() && (!contactEmail.includes('@') || !contactEmail.includes('.'))) {
      newErrors.contactEmail = 'Correo de contacto inválido'
    }
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      const requestData = {
        fullName: fullName.trim(),
        birthDate: birthDate || null,
        sex: sex || null,
        bloodType: bloodType || null,
        organNeeded: organNeeded || null,
        urgencyLevel,
        status,
        contactPhone: contactPhone.trim() || null,
        contactEmail: contactEmail.trim() || null,
      }

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData),
        })

        if (response.ok) {
          setSuccess('¡Paciente actualizado con éxito!')
          setTimeout(() => navigate('/List/pacientes'), 1200)
        } else {
          const errorData = await response.json().catch(() => null)
          const mensajeError =
            errorData?.error ||
            (Array.isArray(errorData?.errores) ? errorData.errores.join(', ') : null) ||
            'Error del servidor al actualizar el paciente.'
          setServerError(mensajeError)
        }
      } catch {
        setServerError('No se pudo conectar con el servidor.')
      } finally {
        setLoading(false)
      }
    }
  }

  if (loadingData) {
    return <div className="paciente-container"><p className="list-loading">Cargando paciente...</p></div>
  }

  if (notFound) {
    return (
      <div className="paciente-container">
        <p className="list-error">No se encontró el paciente solicitado.</p>
        <button className="btn-submit" onClick={() => navigate('/List/pacientes')}>← Volver al listado</button>
      </div>
    )
  }

  return (
    <div className="paciente-container">
      <form className="form-card" onSubmit={handleSubmit}>

        <h1 className="main-title">Editar</h1>
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="subtitle">Datos del Paciente</h2>

        {loading && <p className="success-message">Guardando...</p>}
        {success && <p className="success-message">{success}</p>}
        {serverError && <p className="error-server">{serverError}</p>}

        {/* documento (solo lectura) */}
        <div className="input-group">
          <label>Documento</label>
          <div className="input-with-icon">
            <input type="text" value={`${documentType} — ${documentNumber}`} disabled style={{ paddingLeft: '16px', opacity: 0.6 }} />
          </div>
        </div>

        {/* full_name */}
        <div className="input-group">
          <label>Nombre Completo</label>
          <div className="input-with-icon">
            <img src={nameIcon} alt="Nombre" className="inner-icon" />
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <p className="error">{errors.fullName || ''}</p>
        </div>

        {/* birth_date */}
        <div className="input-group">
          <label>Fecha de Nacimiento</label>
          <div className="input-with-icon">
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={{ paddingLeft: '16px' }} />
          </div>
        </div>

        {/* sex */}
        <div className="input-group">
          <label>Sexo</label>
          <div className="input-with-icon">
            <select value={sex} onChange={(e) => setSex(e.target.value)} className="select-custom" style={{ paddingLeft: '16px' }}>
              <option value="">Seleccionar...</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
        </div>

        {/* blood_type */}
        <div className="input-group">
          <label>Tipo de Sangre</label>
          <div className="input-with-icon">
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="select-custom" style={{ paddingLeft: '16px' }}>
              <option value="">Seleccionar...</option>
              <option value="A_POS">A+</option><option value="A_NEG">A-</option>
              <option value="B_POS">B+</option><option value="B_NEG">B-</option>
              <option value="AB_POS">AB+</option><option value="AB_NEG">AB-</option>
              <option value="O_POS">O+</option><option value="O_NEG">O-</option>
            </select>
          </div>
        </div>

        {/* organ_needed */}
        <div className="input-group">
          <label>Órgano Necesario</label>
          <div className="input-with-icon">
            <select value={organNeeded} onChange={(e) => setOrganNeeded(e.target.value)} className="select-custom" style={{ paddingLeft: '16px' }}>
              <option value="">Seleccionar...</option>
              <option value="RINON">Riñón</option><option value="HIGADO">Hígado</option>
              <option value="CORAZON">Corazón</option><option value="PULMON">Pulmón</option>
              <option value="PANCREAS">Páncreas</option><option value="CORNEA">Córnea</option>
              <option value="INTESTINO">Intestino</option><option value="TEJIDO">Tejido</option>
            </select>
          </div>
        </div>

        {/* urgency_level */}
        <div className="input-group">
          <label>Nivel de Urgencia</label>
          <div className="input-with-icon">
            <select value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value)} className="select-custom" style={{ paddingLeft: '16px' }}>
              <option value="BAJA">🟢 Baja</option>
              <option value="MEDIA">🟡 Media</option>
              <option value="ALTA">🟠 Alta</option>
              <option value="CRITICA">🔴 Crítica</option>
            </select>
          </div>
        </div>

        {/* status */}
        <div className="input-group">
          <label>Estado</label>
          <div className="input-with-icon">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-custom" style={{ paddingLeft: '16px' }}>
              {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
            </select>
          </div>
        </div>

        {/* contact_phone */}
        <div className="input-group">
          <label>Teléfono de Contacto</label>
          <div className="input-with-icon">
            <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={{ paddingLeft: '16px' }} />
          </div>
        </div>

        {/* contact_email */}
        <div className="input-group">
          <label>Correo de Contacto</label>
          <div className="input-with-icon">
            <img src={emailIcon} alt="Correo contacto" className="inner-icon" />
            <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <p className="error">{errors.contactEmail || ''}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button type="button" className="btn-clear" onClick={() => navigate('/List/pacientes')}>
            Cancelar
          </button>
          <button className="button-register" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default PacienteEditForm