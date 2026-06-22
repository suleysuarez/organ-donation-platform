import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageModuleHeader from './PageModuleHeader'
import profileImage from '../assets/Profile.png'
import bgDetail from '../assets/Background-Detail.png'
import '../styles/MedicoDetailPage.css'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/medicos`

function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('token')
  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  }
}

function getStatusStyle(status) {
  switch (status) {
    case 'VERIFICADO': return 'badge badge-verified'
    case 'RECHAZADO':  return 'badge badge-rejected'
    default:           return 'badge badge-pending'
  }
}
function getStatusLabel(status) {
  switch (status) {
    case 'VERIFICADO': return 'Verificado'
    case 'RECHAZADO':  return 'Rechazado'
    default:           return 'Pendiente'
  }
}

function MedicoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [medico, setMedico] = useState(null)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')

  const [archivo, setArchivo] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  const fetchMedico = async () => {
    setLoading(true)
    setServerError('')
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        setMedico(await response.json())
      } else if (response.status === 404) {
        setServerError('No se encontró un médico con ese id.')
      } else {
        setServerError('Error al cargar el médico.')
      }
    } catch {
      setServerError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedico()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubirCertificado = async (e) => {
    e.preventDefault()
    setUploadError('')
    setUploadSuccess('')

    if (!archivo) {
      setUploadError('Selecciona un archivo (PDF, JPG o PNG).')
      return
    }

    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)

      const response = await fetch(`${API_URL}/${id}/certificado`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      })

      if (response.ok || response.status === 201) {
        setUploadSuccess('Certificado subido correctamente.')
        setArchivo(null)
      } else {
        const errorData = await response.json().catch(() => null)
        setUploadError(errorData?.error || 'No se pudo subir el certificado.')
      }
    } catch {
      setUploadError('No se pudo conectar con el servidor.')
    } finally {
      setSubiendo(false)
    }
  }

  if (loading) {
    return (
      <div className="detail-page-wrapper" style={{ backgroundImage: `url(${bgDetail})` }}>
        <div className="detail-container">
          <p className="list-loading">Cargando médico...</p>
        </div>
      </div>
    )
  }

  if (serverError) {
    return (
      <div className="detail-page-wrapper" style={{ backgroundImage: `url(${bgDetail})` }}>
        <div className="detail-container">
          <p className="list-error">{serverError}</p>
          <button className="btn-back" onClick={() => navigate('/List/medicos')}>← Volver al listado</button>
        </div>
      </div>
    )
  }

  if (!medico) return null

  return (
    <div className="detail-page-wrapper" style={{ backgroundImage: `url(${bgDetail})` }}>
      <div className="detail-container">
        <PageModuleHeader
          image={profileImage}
          title="Detalle del Medico"
          subtitle="Consulta la informacion profesional y el certificado asociado"
        />
        <button className="btn-back" onClick={() => navigate('/List/medicos')}>← Volver al listado</button>

        <div className="detail-header-card">
          <div className="detail-avatar">{medico.fullName.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="detail-name">{medico.fullName}</h1>
            <p className="detail-profile">{medico.professionalProfile || 'Sin especialidad registrada'}</p>
            <div className="detail-badges">
              <span className={getStatusStyle(medico.verificationStatus)}>
                {getStatusLabel(medico.verificationStatus)}
              </span>
              <span className={`badge ${medico.isActive ? 'badge-active' : 'badge-inactive'}`}>
                {medico.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h2 className="section-title">Información General</h2>
          <div className="detail-grid">
            <div className="detail-field">
              <span className="field-label">Correo</span>
              <span className="field-value">{medico.email}</span>
            </div>
            <div className="detail-field">
              <span className="field-label">Documento</span>
              <span className="field-value">{medico.documentType} — {medico.documentNumber}</span>
            </div>
            <div className="detail-field">
              <span className="field-label">Número RETHUS</span>
              <span className="field-value">{medico.rethusRegistrationNumber || 'No registrado'}</span>
            </div>
            <div className="detail-field">
              <span className="field-label">Fecha de registro</span>
              <span className="field-value">
                {medico.createdAt ? new Date(medico.createdAt).toLocaleDateString('es-CO') : '—'}
              </span>
            </div>
            <div className="detail-field">
              <span className="field-label">Fecha de verificación</span>
              <span className="field-value">
                {medico.verifiedAt ? new Date(medico.verifiedAt).toLocaleString('es-CO') : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h2 className="section-title">Certificado Profesional</h2>
          <form onSubmit={handleSubirCertificado} className="upload-form">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setArchivo(e.target.files[0] || null)}
            />
            {uploadError && <p className="error-server">{uploadError}</p>}
            {uploadSuccess && <p className="success-message">{uploadSuccess}</p>}
            <button className="btn-submit" type="submit" disabled={subiendo}>
              {subiendo ? 'Subiendo...' : 'Subir Certificado'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MedicoDetailPage