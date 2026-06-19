import { useState, useEffect } from 'react'
import '../styles/DonantesReceptoresPage.css'

import bg1 from '../assets/Background-Registro.png'
import bg2 from '../assets/Background-Register2.png'
import bg3 from '../assets/Background-Register3.png'

const backgrounds = [bg1, bg2, bg3]

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const DONANTES_URL = `${BASE_URL}/api/donantes`
const RECEPTORES_URL = `${BASE_URL}/api/receptores`
const MEDICOS_URL = `${BASE_URL}/api/medicos`

const BLOOD_TYPES = [
  { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
  { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
  { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
  { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' },
]

const ORGANS = [
  { value: 'RINON', label: 'Riñón' }, { value: 'HIGADO', label: 'Hígado' },
  { value: 'CORAZON', label: 'Corazón' }, { value: 'PULMON', label: 'Pulmón' },
  { value: 'PANCREAS', label: 'Páncreas' }, { value: 'CORNEA', label: 'Córnea' },
  { value: 'INTESTINO', label: 'Intestino' }, { value: 'TEJIDO', label: 'Tejido' },
]

function DonantesReceptoresPage() {
  const [tab, setTab] = useState('donante')
  const [medicos, setMedicos] = useState([])
  const [loadingMedicos, setLoadingMedicos] = useState(true)
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchMedicos = async () => {
      setLoadingMedicos(true)
      try {
        const response = await fetch(`${MEDICOS_URL}?size=100&sort=fullName,asc`)
        if (response.ok) {
          const data = await response.json()
          setMedicos(data.content || [])
        }
      } catch {
      } finally {
        setLoadingMedicos(false)
      }
    }
    fetchMedicos()
  }, [])

  return (
    <div 
      className="dr-page-wrapper" 
      style={{ backgroundImage: `url(${backgrounds[currentBgIndex]})` }}
    >
      <div className="dr-container">
        <div className="list-header">
          <h1>Donantes y Receptores</h1>
          <p className="list-subtitle">Registra nuevos donantes/receptores o consulta uno existente por id</p>
        </div>

        <div className="dr-tabs">
          <button className={`dr-tab ${tab === 'donante' ? 'dr-tab-active' : ''}`} onClick={() => setTab('donante')}>
            ❤️ Registrar Donante
          </button>
          <button className={`dr-tab ${tab === 'receptor' ? 'dr-tab-active' : ''}`} onClick={() => setTab('receptor')}>
            🧑‍🦯 Registrar Receptor
          </button>
          <button className={`dr-tab ${tab === 'consultar' ? 'dr-tab-active' : ''}`} onClick={() => setTab('consultar')}>
            🔍 Consultar por ID
          </button>
        </div>

        {tab === 'donante' && <DonanteForm medicos={medicos} loadingMedicos={loadingMedicos} />}
        {tab === 'receptor' && <ReceptorForm medicos={medicos} loadingMedicos={loadingMedicos} />}
        {tab === 'consultar' && <ConsultaPorId />}
      </div>
    </div>
  )
}

function DonanteForm({ medicos, loadingMedicos }) {
  const [registeredById, setRegisteredById] = useState('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setServerError('')

    const newErrors = {}
    if (!registeredById) newErrors.registeredById = 'Seleccione el médico que registra'
    if (fullName.trim() === '') newErrors.fullName = 'El nombre completo es obligatorio'
    if (documentNumber.trim() === '') newErrors.documentNumber = 'El documento es obligatorio'
    if (contactEmail.trim() && (!contactEmail.includes('@') || !contactEmail.includes('.'))) {
      newErrors.contactEmail = 'Correo inválido'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      const response = await fetch(DONANTES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registeredById: Number(registeredById),
          documentType, documentNumber: documentNumber.trim(),
          fullName: fullName.trim(),
          birthDate: birthDate || null, sex: sex || null,
          bloodType: bloodType || null,
          contactPhone: contactPhone.trim() || null,
          contactEmail: contactEmail.trim() || null,
          address: address.trim() || null,
          medicalNotes: medicalNotes.trim() || null,
        }),
      })
      if (response.ok || response.status === 201) {
        setSuccess('¡Donante registrado con éxito!')
        setRegisteredById(''); setFullName(''); setDocumentType('CC'); setDocumentNumber('')
        setBirthDate(''); setSex(''); setBloodType(''); setContactPhone('')
        setContactEmail(''); setAddress(''); setMedicalNotes('')
      } else {
        const errorData = await response.json().catch(() => null)
        setServerError(errorData?.error || 'Error del servidor al procesar el registro.')
      }
    } catch {
      setServerError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="section-card dr-form" onSubmit={handleSubmit}>
      {success && <p className="success-message">{success}</p>}
      {serverError && <p className="error-server">{serverError}</p>}

      <div className="form-row">
        <div className="input-group">
          <label>Médico Registrador *</label>
          <select className="select-custom" value={registeredById} onChange={(e) => setRegisteredById(e.target.value)} disabled={loadingMedicos}>
            <option value="">{loadingMedicos ? 'Cargando médicos...' : 'Seleccionar médico...'}</option>
            {medicos.map((m) => <option key={m.id} value={m.id}>{m.fullName} — {m.email}</option>)}
          </select>
          <p className="error">{errors.registeredById || ''}</p>
        </div>
        <div className="input-group">
          <label>Nombre Completo</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre completo" />
          <p className="error">{errors.fullName || ''}</p>
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Tipo de Documento</label>
          <select className="select-custom" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
            <option value="CC">Cédula de Ciudadanía (CC)</option>
            <option value="CE">Cédula de Extranjería (CE)</option>
            <option value="TI">Tarjeta de Identidad (TI)</option>
            <option value="PP">Pasaporte (PP)</option>
          </select>
        </div>
        <div className="input-group">
          <label>Número de Documento</label>
          <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Número de documento" />
          <p className="error">{errors.documentNumber || ''}</p>
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Fecha de Nacimiento</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Sexo</label>
          <select className="select-custom" value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Tipo de Sangre</label>
          <select className="select-custom" value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
            <option value="">Seleccionar...</option>
            {BLOOD_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Teléfono de Contacto</label>
          <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Teléfono" />
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Correo de Contacto</label>
          <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Correo de contacto" />
          <p className="error">{errors.contactEmail || ''}</p>
        </div>
        <div className="input-group">
          <label>Dirección</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección" />
        </div>
      </div>

      <div className="input-group">
        <label>Notas Médicas</label>
        <textarea className="textarea-custom" rows={3} value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} placeholder="Observaciones clínicas (opcional)" />
      </div>

      <button className="btn-submit" type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar Donante'}
      </button>
    </form>
  )
}

function ReceptorForm({ medicos, loadingMedicos }) {
  const [registeredById, setRegisteredById] = useState('')
  const [fullName, setFullName] = useState('')
  const [documentType, setDocumentType] = useState('CC')
  const [documentNumber, setDocumentNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [organNeeded, setOrganNeeded] = useState('')
  const [urgencyLevel, setUrgencyLevel] = useState('MEDIA')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(''); setServerError('')

    const newErrors = {}
    if (!registeredById) newErrors.registeredById = 'Seleccione el médico que registra'
    if (fullName.trim() === '') newErrors.fullName = 'El nombre completo es obligatorio'
    if (documentNumber.trim() === '') newErrors.documentNumber = 'El documento es obligatorio'
    if (!organNeeded) newErrors.organNeeded = 'Seleccione el órgano necesario'
    if (contactEmail.trim() && (!contactEmail.includes('@') || !contactEmail.includes('.'))) {
      newErrors.contactEmail = 'Correo inválido'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      const response = await fetch(RECEPTORES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registeredById: Number(registeredById),
          fullName: fullName.trim(), documentType, documentNumber: documentNumber.trim(),
          birthDate: birthDate || null, sex: sex || null, bloodType: bloodType || null,
          organNeeded: organNeeded || null, urgencyLevel,
          contactPhone: contactPhone.trim() || null, contactEmail: contactEmail.trim() || null,
        }),
      })
      if (response.ok || response.status === 201) {
        setSuccess('¡Receptor registrado con éxito!')
        setRegisteredById(''); setFullName(''); setDocumentType('CC'); setDocumentNumber('')
        setBirthDate(''); setSex(''); setBloodType(''); setOrganNeeded('')
        setUrgencyLevel('MEDIA'); setContactPhone(''); setContactEmail('')
      } else {
        const errorData = await response.json().catch(() => null)
        setServerError(errorData?.error || 'Error del servidor al procesar el registro.')
      }
    } catch {
      setServerError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="section-card dr-form" onSubmit={handleSubmit}>
      {success && <p className="success-message">{success}</p>}
      {serverError && <p className="error-server">{serverError}</p>}

      <div className="form-row">
        <div className="input-group">
          <label>Médico Registrador *</label>
          <select className="select-custom" value={registeredById} onChange={(e) => setRegisteredById(e.target.value)} disabled={loadingMedicos}>
            <option value="">{loadingMedicos ? 'Cargando médicos...' : 'Seleccionar médico...'}</option>
            {medicos.map((m) => <option key={m.id} value={m.id}>{m.fullName} — {m.email}</option>)}
          </select>
          <p className="error">{errors.registeredById || ''}</p>
        </div>
        <div className="input-group">
          <label>Nombre Completo</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre completo" />
          <p className="error">{errors.fullName || ''}</p>
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Tipo de Documento</label>
          <select className="select-custom" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
            <option value="CC">Cédula de Ciudadanía (CC)</option>
            <option value="CE">Cédula de Extranjería (CE)</option>
            <option value="TI">Tarjeta de Identidad (TI)</option>
            <option value="PP">Pasaporte (PP)</option>
          </select>
        </div>
        <div className="input-group">
          <label>Número de Documento</label>
          <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Número de documento" />
          <p className="error">{errors.documentNumber || ''}</p>
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Fecha de Nacimiento</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Sexo</label>
          <select className="select-custom" value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Tipo de Sangre</label>
          <select className="select-custom" value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
            <option value="">Seleccionar...</option>
            {BLOOD_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Órgano Necesario *</label>
          <select className="select-custom" value={organNeeded} onChange={(e) => setOrganNeeded(e.target.value)}>
            <option value="">Seleccionar...</option>
            {ORGANS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <p className="error">{errors.organNeeded || ''}</p>
        </div>
      </div>

      <div className="form-row">
        <div className="input-group">
          <label>Nivel de Urgencia</label>
          <select className="select-custom" value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value)}>
            <option value="BAJA">🟢 Baja</option>
            <option value="MEDIA">🟡 Media</option>
            <option value="ALTA">🟠 Alta</option>
            <option value="CRITICA">🔴 Crítica</option>
          </select>
        </div>
        <div className="input-group">
          <label>Teléfono de Contacto</label>
          <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Teléfono" />
        </div>
      </div>

      <div className="input-group">
        <label>Correo de Contacto</label>
        <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Correo de contacto" />
        <p className="error">{errors.contactEmail || ''}</p>
      </div>

      <button className="btn-submit" type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar Receptor'}
      </button>
    </form>
  )
}

function ConsultaPorId() {
  const [tipo, setTipo] = useState('donante')
  const [id, setId] = useState('')
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleBuscar = async (e) => {
    e.preventDefault()
    if (!id.trim()) return
    setLoading(true); setError(''); setResultado(null)
    try {
      const url = tipo === 'donante' ? `${DONANTES_URL}/${id.trim()}` : `${RECEPTORES_URL}/${id.trim()}`
      const response = await fetch(url)
      if (response.ok) {
        setResultado(await response.json())
      } else if (response.status === 404) {
        setError(`No existe un ${tipo} con ese id.`)
      } else {
        setError('Error al consultar.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-card">
      <form className="search-bar" onSubmit={handleBuscar}>
        <select className="search-mode" value={tipo} onChange={(e) => { setTipo(e.target.value); setResultado(null); setError('') }}>
          <option value="donante">Donante</option>
          <option value="receptor">Receptor</option>
        </select>
        <input type="text" value={id} onChange={(e) => setId(e.target.value)} placeholder="Ingrese el id..." className="search-input" />
        <button type="submit" className="btn-search">{loading ? 'Buscando...' : 'Buscar'}</button>
      </form>

      {error && <p className="list-error">{error}</p>}

      {resultado && (
        <div className="detail-grid" style={{ marginTop: '20px' }}>
          <div className="detail-field"><span className="field-label">Nombre</span><span className="field-value">{resultado.fullName}</span></div>
          <div className="detail-field"><span className="field-label">Documento</span><span className="field-value">{resultado.documentType} — {resultado.documentNumber}</span></div>
          <div className="detail-field"><span className="field-label">Tipo de Sangre</span><span className="field-value">{resultado.bloodType || '—'}</span></div>
          {tipo === 'receptor' && (
            <>
              <div className="detail-field"><span className="field-label">Órgano Necesario</span><span className="field-value">{resultado.organNeeded || '—'}</span></div>
              <div className="detail-field"><span className="field-label">Urgencia</span><span className="field-value">{resultado.urgencyLevel || '—'}</span></div>
            </>
          )}
          <div className="detail-field"><span className="field-label">Estado</span><span className="field-value">{resultado.status || '—'}</span></div>
          <div className="detail-field"><span className="field-label">Contacto</span><span className="field-value">{resultado.contactEmail || resultado.contactPhone || '—'}</span></div>
        </div>
      )}
    </div>
  )
}

export default DonantesReceptoresPage