import { useEffect, useState } from 'react'
import PageModuleHeader from './PageModuleHeader'
import documentImage from '../assets/Document.png'
import bgReportes from '../assets/Background-Donantes.png'
import '../styles/ReportesMedicosPage.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const REPORTES_URL = `${BASE_URL}/api/reportes`
const MEDICOS_URL = `${BASE_URL}/api/medicos`
const RECEPTORES_URL = `${BASE_URL}/api/receptores`

const ESTADOS = ['PENDIENTE', 'EN_REVISION', 'COMPLETADO']

function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('token')
  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  }
}

function getErrorMessage(data, fallback) {
  if (!data) return fallback
  if (typeof data === 'string') return data
  return data.detalle || data.error || data.message || fallback
}

async function readErrorMessage(response, fallback) {
  const text = await response.text().catch(() => '')
  if (!text) return fallback

  try {
    return getErrorMessage(JSON.parse(text), fallback)
  } catch {
    return text
  }
}

function getEstadoStyle(estado) {
  switch (estado) {
    case 'COMPLETADO': return 'badge badge-verified'
    case 'EN_REVISION': return 'badge badge-process'
    default: return 'badge badge-pending'
  }
}

function getEstadoLabel(estado) {
  const map = {
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En revision',
    COMPLETADO: 'Completado',
  }
  return map[estado] || estado
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function ReportesMedicosPage() {
  const [reportes, setReportes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [receptores, setReceptores] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  const [serverError, setServerError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [recipientId, setRecipientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [description, setDescription] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [reportDate, setReportDate] = useState(today())
  const [status, setStatus] = useState('PENDIENTE')
  const [errors, setErrors] = useState({})

  const fetchReportes = async () => {
    setLoading(true)
    setServerError('')
    try {
      const response = await fetch(REPORTES_URL, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setReportes(Array.isArray(data) ? data : [])
      } else {
        setServerError(await readErrorMessage(response, 'No se pudieron cargar los reportes.'))
      }
    } catch {
      setServerError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCatalogos = async () => {
    setLoadingCatalogos(true)
    try {
      const [medicosRes, receptoresRes] = await Promise.all([
        fetch(`${MEDICOS_URL}?size=100&sort=fullName,asc`, { headers: getAuthHeaders() }),
        fetch(`${RECEPTORES_URL}?size=100&sort=fullName,asc`, { headers: getAuthHeaders() }),
      ])

      if (medicosRes.ok) {
        const data = await medicosRes.json()
        setMedicos(data.content || [])
      }

      if (receptoresRes.ok) {
        const data = await receptoresRes.json()
        setReceptores(data.content || [])
      }
    } finally {
      setLoadingCatalogos(false)
    }
  }

  useEffect(() => {
    fetchReportes()
    fetchCatalogos()
  }, [])

  const resetForm = () => {
    setRecipientId('')
    setDoctorId('')
    setDescription('')
    setDiagnosis('')
    setReportDate(today())
    setStatus('PENDIENTE')
    setErrors({})
    setEditingId(null)
  }

  const handleNuevo = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEditar = (reporte) => {
    setEditingId(reporte.id)
    setRecipientId(String(reporte.recipient?.id || ''))
    setDoctorId(String(reporte.doctor?.id || ''))
    setDescription(reporte.description || '')
    setDiagnosis(reporte.diagnosis || '')
    setReportDate(reporte.reportDate || today())
    setStatus(reporte.status || 'PENDIENTE')
    setErrors({})
    setShowForm(true)
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!recipientId) nextErrors.recipientId = 'Seleccione un receptor'
    if (!doctorId) nextErrors.doctorId = 'Seleccione un medico responsable'
    if (!description.trim()) nextErrors.description = 'La descripcion es obligatoria'
    if (!reportDate) nextErrors.reportDate = 'La fecha es obligatoria'
    if (reportDate && reportDate > today()) nextErrors.reportDate = 'La fecha no puede ser futura'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setServerError('')

    const payload = {
      recipientId: Number(recipientId),
      doctorId: Number(doctorId),
      description: description.trim(),
      diagnosis: diagnosis.trim(),
      reportDate,
      status,
    }

    try {
      const response = await fetch(editingId ? `${REPORTES_URL}/${editingId}` : REPORTES_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setShowForm(false)
        resetForm()
        await fetchReportes()
      } else {
        setServerError(await readErrorMessage(response, 'No se pudo guardar el reporte.'))
      }
    } catch {
      setServerError('No se pudo conectar con el servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminar = async (id) => {
    setServerError('')
    try {
      const response = await fetch(`${REPORTES_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        setReportes((prev) => prev.filter((reporte) => reporte.id !== id))
      } else {
        setServerError(await readErrorMessage(response, 'No se pudo eliminar el reporte.'))
      }
    } catch {
      setServerError('No se pudo conectar con el servidor.')
    }
  }

  return (
    <div
      className="reportes-page-wrapper"
      style={{ backgroundImage: `url(${bgReportes})` }}
    >
      <div className="reportes-container">
        <PageModuleHeader
          image={documentImage}
          title="Reportes Medicos"
          subtitle="Gestiona reportes clinicos reales asociados a receptores y medicos."
        />
        <div className="list-header">
          <h1>Reportes Medicos</h1>
          <p className="list-subtitle">Gestiona reportes clinicos reales asociados a receptores y medicos.</p>
        </div>

      <div className="reportes-toolbar">
        <button className="btn-submit" onClick={handleNuevo}>+ Nuevo Reporte</button>
      </div>

      {serverError && <p className="list-error">{serverError}</p>}

      {showForm && (
        <div className="section-card">
          <h2 className="section-title">{editingId ? 'Editar Reporte' : 'Nuevo Reporte'}</h2>
          <form onSubmit={handleSubmit} className="reportes-form">
            <div className="form-row">
              <div className="input-group">
                <label>Receptor</label>
                <select
                  className="select-custom"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  disabled={loadingCatalogos}
                >
                  <option value="">{loadingCatalogos ? 'Cargando receptores...' : 'Seleccionar receptor...'}</option>
                  {receptores.map((receptor) => (
                    <option key={receptor.id} value={receptor.id}>
                      {receptor.fullName} - {receptor.documentNumber}
                    </option>
                  ))}
                </select>
                <p className="error">{errors.recipientId || ''}</p>
              </div>

              <div className="input-group">
                <label>Medico responsable</label>
                <select
                  className="select-custom"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  disabled={loadingCatalogos}
                >
                  <option value="">{loadingCatalogos ? 'Cargando medicos...' : 'Seleccionar medico...'}</option>
                  {medicos.map((medico) => (
                    <option key={medico.id} value={medico.userId || medico.id}>
                      {medico.fullName || medico.email}
                    </option>
                  ))}
                </select>
                <p className="error">{errors.doctorId || ''}</p>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Fecha del reporte</label>
                <input
                  type="date"
                  value={reportDate}
                  max={today()}
                  onChange={(e) => setReportDate(e.target.value)}
                />
                <p className="error">{errors.reportDate || ''}</p>
              </div>

              <div className="input-group">
                <label>Estado</label>
                <select className="select-custom" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>{getEstadoLabel(estado)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Descripcion clinica</label>
              <textarea
                className="textarea-custom"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalle del reporte..."
              />
              <p className="error">{errors.description || ''}</p>
            </div>

            <div className="input-group">
              <label>Diagnostico</label>
              <textarea
                className="textarea-custom"
                rows={3}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Diagnostico o conclusion clinica..."
              />
            </div>

            <div className="reportes-form-actions">
              <button type="button" className="btn-clear" onClick={() => { setShowForm(false); resetForm() }}>
                Cancelar
              </button>
              <button className="btn-submit" type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Reporte'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="list-empty">Cargando reportes...</p>
      ) : reportes.length === 0 ? (
        <p className="list-empty">No hay reportes registrados aun.</p>
      ) : (
        <div className="cards-grid">
          {reportes.map((reporte) => (
            <div className="reporte-card" key={reporte.id}>
              <div className="card-header">
                <h3 className="card-name">{reporte.recipient?.fullName || 'Receptor sin nombre'}</h3>
                <span className={getEstadoStyle(reporte.status)}>{getEstadoLabel(reporte.status)}</span>
              </div>
              <div className="card-body">
                <div className="card-field">
                  <span className="field-label">Medico</span>
                  <span className="field-value">{reporte.doctor?.email || 'Sin medico'}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Documento receptor</span>
                  <span className="field-value">{reporte.recipient?.documentNumber || '-'}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Fecha</span>
                  <span className="field-value">
                    {reporte.reportDate ? new Date(reporte.reportDate).toLocaleDateString('es-CO') : '-'}
                  </span>
                </div>
                <div className="card-field full">
                  <span className="field-label">Descripcion</span>
                  <span className="field-value">{reporte.description || '-'}</span>
                </div>
                <div className="card-field full">
                  <span className="field-label">Diagnostico</span>
                  <span className="field-value">{reporte.diagnosis || '-'}</span>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn-link" onClick={() => handleEditar(reporte)}>Editar</button>
                <button className="btn-link btn-link-danger" onClick={() => handleEliminar(reporte.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default ReportesMedicosPage