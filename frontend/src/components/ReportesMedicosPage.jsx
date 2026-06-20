import { useState, useEffect } from 'react'
import '../styles/ReportesMedicosPage.css'

const MEDICOS_URL = `${import.meta.env.VITE_API_BASE_URL}/api/medicos`


const REPORTES_MOCK_INICIAL = [
  {
    id: 1,
    paciente: 'Ana María Torres',
    medico: 'Carla Restrepo Gómez',
    tipo: 'EVALUACION_INICIAL',
    descripcion: 'Evaluación inicial de compatibilidad para trasplante renal.',
    fecha: '2026-06-10',
    estado: 'APROBADO',
    evidencias: ['historia_clinica.pdf'],
  },
  {
    id: 2,
    paciente: 'Pedro Gaitán Mora',
    medico: 'Jorge Patiño Ruiz',
    tipo: 'SEGUIMIENTO_CLINICO',
    descripcion: 'Seguimiento clínico post-evaluación, pendiente de exámenes complementarios.',
    fecha: '2026-06-15',
    estado: 'PENDIENTE',
    evidencias: [],
  },
]

const TIPOS = [
  { value: 'EVALUACION_INICIAL', label: 'Evaluación Inicial' },
  { value: 'SEGUIMIENTO_CLINICO', label: 'Seguimiento Clínico' },
  { value: 'COMPATIBILIDAD', label: 'Compatibilidad' },
  { value: 'POST_OPERATORIO', label: 'Post-operatorio' },
]

const ESTADOS = ['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO']

function getEstadoStyle(estado) {
  switch (estado) {
    case 'APROBADO':    return 'badge badge-verified'
    case 'RECHAZADO':   return 'badge badge-rejected'
    case 'EN_REVISION': return 'badge badge-process'
    default:            return 'badge badge-pending'
  }
}

function getEstadoLabel(estado) {
  const map = {
    PENDIENTE: 'Pendiente', EN_REVISION: 'En Revisión',
    APROBADO: 'Aprobado', RECHAZADO: 'Rechazado',
  }
  return map[estado] || estado
}

function ReportesMedicosPage() {
  const [reportes, setReportes] = useState(REPORTES_MOCK_INICIAL)
  const [medicos, setMedicos] = useState([])
  const [loadingMedicos, setLoadingMedicos] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [paciente, setPaciente] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [tipo, setTipo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('PENDIENTE')
  const [evidencias, setEvidencias] = useState([])
  const [errors, setErrors] = useState({})

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
        // select queda vacío si falla
      } finally {
        setLoadingMedicos(false)
      }
    }
    fetchMedicos()
  }, [])

  const resetForm = () => {
    setPaciente(''); setMedicoId(''); setTipo(''); setDescripcion('')
    setEstado('PENDIENTE'); setEvidencias([]); setErrors({}); setEditingId(null)
  }

  const handleNuevo = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEditar = (reporte) => {
    setEditingId(reporte.id)
    setPaciente(reporte.paciente)
    setMedicoId('')
    setTipo(reporte.tipo)
    setDescripcion(reporte.descripcion)
    setEstado(reporte.estado)
    setEvidencias(reporte.evidencias.map((nombre) => ({ name: nombre })))
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (paciente.trim() === '') newErrors.paciente = 'El nombre del paciente es obligatorio'
    if (!medicoId && !editingId) newErrors.medicoId = 'Seleccione el médico responsable'
    if (!tipo) newErrors.tipo = 'Seleccione el tipo de reporte'
    if (descripcion.trim() === '') newErrors.descripcion = 'La descripción es obligatoria'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const medicoSeleccionado = medicos.find((m) => String(m.id) === String(medicoId))

    if (editingId) {
      setReportes((prev) => prev.map((r) => r.id === editingId
        ? { ...r, paciente: paciente.trim(), tipo, descripcion: descripcion.trim(), estado, evidencias: evidencias.map((f) => f.name) }
        : r
      ))
    } else {
      setReportes((prev) => [
        {
          id: Date.now(),
          paciente: paciente.trim(),
          medico: medicoSeleccionado ? medicoSeleccionado.fullName : 'Sin asignar',
          tipo, descripcion: descripcion.trim(), estado,
          fecha: new Date().toISOString().slice(0, 10),
          evidencias: evidencias.map((f) => f.name),
        },
        ...prev,
      ])
    }

    setShowForm(false)
    resetForm()
  }

  const handleEliminar = (id) => {
    setReportes((prev) => prev.filter((r) => r.id !== id))
  }

  const handleFileChange = (e) => {
    setEvidencias(Array.from(e.target.files))
  }

  return (
    <div className="reportes-container">
      <div className="list-header">
        <h1>Reportes Médicos</h1>
        <p className="list-subtitle">
          Gestiona los reportes clínicos asociados a pacientes. (Vista en modo local — falta conectar al backend)
        </p>
      </div>

      <div className="reportes-toolbar">
        <button className="btn-submit" onClick={handleNuevo}>+ Nuevo Reporte</button>
      </div>

      {showForm && (
        <div className="section-card">
          <h2 className="section-title">{editingId ? 'Editar Reporte' : 'Nuevo Reporte'}</h2>
          <form onSubmit={handleSubmit} className="reportes-form">
            <div className="form-row">
              <div className="input-group">
                <label>Paciente</label>
                <input type="text" value={paciente} onChange={(e) => setPaciente(e.target.value)} placeholder="Nombre del paciente" />
                <p className="error">{errors.paciente || ''}</p>
              </div>
              <div className="input-group">
                <label>Médico Responsable</label>
                <select className="select-custom" value={medicoId} onChange={(e) => setMedicoId(e.target.value)} disabled={loadingMedicos}>
                  <option value="">{loadingMedicos ? 'Cargando médicos...' : 'Seleccionar médico...'}</option>
                  {medicos.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
                <p className="error">{errors.medicoId || ''}</p>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Tipo de Reporte</label>
                <select className="select-custom" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <p className="error">{errors.tipo || ''}</p>
              </div>
              <div className="input-group">
                <label>Estado</label>
                <select className="select-custom" value={estado} onChange={(e) => setEstado(e.target.value)}>
                  {ESTADOS.map((es) => <option key={es} value={es}>{getEstadoLabel(es)}</option>)}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Descripción Clínica</label>
              <textarea className="textarea-custom" rows={4} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalle del reporte..." />
              <p className="error">{errors.descripcion || ''}</p>
            </div>

            <div className="input-group">
              <label>Evidencias (PDF, JPG, PNG)</label>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
              {evidencias.length > 0 && (
                <ul className="evidencias-list">
                  {evidencias.map((f, i) => <li key={i}>📎 {f.name}</li>)}
                </ul>
              )}
            </div>

            <div className="reportes-form-actions">
              <button type="button" className="btn-clear" onClick={() => { setShowForm(false); resetForm() }}>
                Cancelar
              </button>
              <button className="btn-submit" type="submit">
                {editingId ? 'Guardar Cambios' : 'Crear Reporte'}
              </button>
            </div>
          </form>
        </div>
      )}

      {reportes.length === 0 ? (
        <p className="list-empty">No hay reportes registrados aún.</p>
      ) : (
        <div className="cards-grid">
          {reportes.map((r) => (
            <div className="reporte-card" key={r.id}>
              <div className="card-header">
                <h3 className="card-name">{r.paciente}</h3>
                <span className={getEstadoStyle(r.estado)}>{getEstadoLabel(r.estado)}</span>
              </div>
              <div className="card-body">
                <div className="card-field">
                  <span className="field-label">Médico</span>
                  <span className="field-value">{r.medico}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Tipo</span>
                  <span className="field-value">{TIPOS.find((t) => t.value === r.tipo)?.label || r.tipo}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Fecha</span>
                  <span className="field-value">{new Date(r.fecha).toLocaleDateString('es-CO')}</span>
                </div>
                <div className="card-field full">
                  <span className="field-label">Descripción</span>
                  <span className="field-value">{r.descripcion}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Evidencias</span>
                  <span className="field-value">{r.evidencias.length > 0 ? `${r.evidencias.length} archivo(s)` : 'Sin evidencias'}</span>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn-link" onClick={() => handleEditar(r)}>Editar</button>
                <button className="btn-link btn-link-danger" onClick={() => handleEliminar(r.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReportesMedicosPage