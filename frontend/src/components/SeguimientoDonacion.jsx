import { useState, useEffect } from 'react'
import '../styles/SeguimientoDonacion.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const PROCESOS_URL = `${BASE_URL}/api/procesos`
const DONANTES_URL = `${BASE_URL}/api/donantes`
const RECEPTORES_URL = `${BASE_URL}/api/receptores`
const MEDICOS_URL = `${BASE_URL}/api/medicos`

// core.donation_processes.current_state (ver schema.sql)
const ESTADOS = [
  'REGISTRADO', 'EN_EVALUACION', 'EN_ESPERA',
  'MATCH_ENCONTRADO', 'EN_PROCESO_CLINICO', 'COMPLETADO', 'CANCELADO',
]

function getEstadoStyle(estado) {
  switch (estado) {
    case 'COMPLETADO':         return 'badge badge-verified'
    case 'CANCELADO':          return 'badge badge-rejected'
    case 'MATCH_ENCONTRADO':   return 'badge badge-active'
    case 'EN_PROCESO_CLINICO': return 'badge badge-process'
    case 'EN_EVALUACION':      return 'badge badge-process'
    default:                   return 'badge badge-pending'
  }
}

function getEstadoLabel(estado) {
  const map = {
    REGISTRADO: 'Registrado',
    EN_EVALUACION: 'En Evaluación',
    EN_ESPERA: 'En Espera',
    MATCH_ENCONTRADO: 'Match Encontrado',
    EN_PROCESO_CLINICO: 'En Proceso Clínico',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado',
  }
  return map[estado] || estado
}

function SeguimientoDonacion() {
  // ----- Médicos, para los selects de openedById / changedById -----
  const [medicos, setMedicos] = useState([])
  const [loadingMedicos, setLoadingMedicos] = useState(true)

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
        // El select queda vacío si falla; no bloquea el resto de la página.
      } finally {
        setLoadingMedicos(false)
      }
    }
    fetchMedicos()
  }, [])

  // ----- Búsqueda de procesos -----
  // El backend no tiene un endpoint que liste TODOS los procesos, así que
  // se busca por id de proceso, por donante o por receptor (lo único que
  // expone DonationProcessController hoy).
  const [searchMode, setSearchMode] = useState('proceso') // 'proceso' | 'donante' | 'receptor'
  const [searchId, setSearchId] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)

  const [selectedProcess, setSelectedProcess] = useState(null)
  const [historial, setHistorial] = useState([])
  const [historialLoading, setHistorialLoading] = useState(false)

  const selectProcess = async (proceso) => {
    setSelectedProcess(proceso)
    setHistorialLoading(true)
    setHistorial([])
    try {
      const response = await fetch(`${PROCESOS_URL}/${proceso.id}/historial`)
      if (response.ok) {
        setHistorial(await response.json())
      }
    } catch {
      // Si falla el historial, se deja vacío; el resto de la vista sigue usable.
    } finally {
      setHistorialLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchId.trim()) return

    setSearchLoading(true)
    setSearchError('')
    setResults([])
    setSearched(true)
    setSelectedProcess(null)

    try {
      let url = `${PROCESOS_URL}/${searchId.trim()}`
      if (searchMode === 'donante') url = `${PROCESOS_URL}/donante/${searchId.trim()}`
      if (searchMode === 'receptor') url = `${PROCESOS_URL}/receptor/${searchId.trim()}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const lista = Array.isArray(data) ? data : [data]
        setResults(lista)
        if (lista.length === 1) selectProcess(lista[0])
      } else if (response.status === 404) {
        setSearchError('No se encontraron procesos para ese id.')
      } else {
        setSearchError('Error al consultar los procesos.')
      }
    } catch {
      setSearchError('No se pudo conectar con el servidor.')
    } finally {
      setSearchLoading(false)
    }
  }

  // ----- Actualizar estado del proceso seleccionado -----
  const [newState, setNewState] = useState('')
  const [changedById, setChangedById] = useState('')
  const [clinicalObservation, setClinicalObservation] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState('')

  const handleUpdateState = async (e) => {
    e.preventDefault()
    setUpdateError('')
    setUpdateSuccess('')

    if (!newState || !changedById) {
      setUpdateError('Seleccione el nuevo estado y el médico que realiza el cambio.')
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`${PROCESOS_URL}/${selectedProcess.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newState,
          changedById: Number(changedById),
          clinicalObservation: clinicalObservation.trim() || null,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setUpdateSuccess('Estado actualizado correctamente.')
        setNewState('')
        setClinicalObservation('')
        selectProcess(updated) // recarga proceso + historial
      } else {
        const errorData = await response.json().catch(() => null)
        setUpdateError(
          errorData?.error ||
          (Array.isArray(errorData?.errores) ? errorData.errores.join(', ') : null) ||
          'No se pudo actualizar el estado.'
        )
      }
    } catch {
      setUpdateError('No se pudo conectar con el servidor.')
    } finally {
      setUpdating(false)
    }
  }

  // ----- Abrir nuevo proceso -----
  const [donorId, setDonorId] = useState('')
  const [donorLookup, setDonorLookup] = useState(null)
  const [donorLookupError, setDonorLookupError] = useState('')

  const [recipientId, setRecipientId] = useState('')
  const [recipientLookup, setRecipientLookup] = useState(null)
  const [recipientLookupError, setRecipientLookupError] = useState('')

  const [openedById, setOpenedById] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // No existe un endpoint para listar donantes/receptores, así que se
  // verifica el id manualmente contra GET /api/donantes/{id} y
  // GET /api/receptores/{id} antes de enviar el formulario.
  const verificarDonante = async () => {
    setDonorLookup(null)
    setDonorLookupError('')
    if (!donorId.trim()) return
    try {
      const response = await fetch(`${DONANTES_URL}/${donorId.trim()}`)
      if (response.ok) {
        setDonorLookup(await response.json())
      } else {
        setDonorLookupError('No existe un donante con ese id.')
      }
    } catch {
      setDonorLookupError('No se pudo verificar el donante.')
    }
  }

  const verificarReceptor = async () => {
    setRecipientLookup(null)
    setRecipientLookupError('')
    if (!recipientId.trim()) return
    try {
      const response = await fetch(`${RECEPTORES_URL}/${recipientId.trim()}`)
      if (response.ok) {
        setRecipientLookup(await response.json())
      } else {
        setRecipientLookupError('No existe un receptor con ese id.')
      }
    } catch {
      setRecipientLookupError('No se pudo verificar el receptor.')
    }
  }

  const handleCreateProcess = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')

    if (!donorId.trim() || !recipientId.trim() || !openedById) {
      setCreateError('Donante, receptor y médico que abre el proceso son obligatorios.')
      return
    }

    setCreating(true)
    try {
      const response = await fetch(PROCESOS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: Number(donorId.trim()),
          recipientId: Number(recipientId.trim()),
          openedById: Number(openedById),
        }),
      })

      if (response.ok || response.status === 201) {
        const created = await response.json()
        setCreateSuccess(`Proceso #${created.id} abierto con éxito.`)
        setDonorId('')
        setDonorLookup(null)
        setRecipientId('')
        setRecipientLookup(null)
        setOpenedById('')
        setSearched(true)
        setResults((prev) => [created, ...prev])
        selectProcess(created)
      } else {
        const errorData = await response.json().catch(() => null)
        setCreateError(
          errorData?.error ||
          (Array.isArray(errorData?.errores) ? errorData.errores.join(', ') : null) ||
          'No se pudo abrir el proceso.'
        )
      }
    } catch {
      setCreateError('No se pudo conectar con el servidor.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="seguimiento-container">
      <div className="list-header">
        <h1>Seguimiento de Donación</h1>
        <p className="list-subtitle">
          Consulta procesos de donación existentes o abre uno nuevo
        </p>
      </div>

      {/* Buscador */}
      <form className="search-bar" onSubmit={handleSearch}>
        <select
          className="search-mode"
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value)}
        >
          <option value="proceso">Por ID de Proceso</option>
          <option value="donante">Procesos de un Donante (ID)</option>
          <option value="receptor">Procesos de un Receptor (ID)</option>
        </select>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Ingrese el id..."
          className="search-input"
        />
        <button type="submit" className="btn-search">
          {searchLoading ? 'Buscando...' : 'Buscar'}
        </button>
        <button
          type="button"
          className="btn-clear"
          onClick={() => setShowCreateForm((s) => !s)}
        >
          {showCreateForm ? 'Cerrar' : '+ Abrir Proceso'}
        </button>
      </form>

      {/* Formulario: abrir nuevo proceso */}
      {showCreateForm && (
        <div className="section-card">
          <h2 className="section-title">Abrir Nuevo Proceso de Donación</h2>
          <form onSubmit={handleCreateProcess} className="create-process-form">

            <div className="form-row">
              <div className="input-group">
                <label>ID del Donante</label>
                <div className="input-row">
                  <input
                    type="text"
                    value={donorId}
                    onChange={(e) => { setDonorId(e.target.value); setDonorLookup(null) }}
                    placeholder="Ej: 1"
                  />
                  <button type="button" className="btn-verify" onClick={verificarDonante}>
                    Verificar
                  </button>
                </div>
                {donorLookup && <p className="lookup-ok">✓ {donorLookup.fullName}</p>}
                {donorLookupError && <p className="error">{donorLookupError}</p>}
              </div>

              <div className="input-group">
                <label>ID del Receptor</label>
                <div className="input-row">
                  <input
                    type="text"
                    value={recipientId}
                    onChange={(e) => { setRecipientId(e.target.value); setRecipientLookup(null) }}
                    placeholder="Ej: 1"
                  />
                  <button type="button" className="btn-verify" onClick={verificarReceptor}>
                    Verificar
                  </button>
                </div>
                {recipientLookup && <p className="lookup-ok">✓ {recipientLookup.fullName}</p>}
                {recipientLookupError && <p className="error">{recipientLookupError}</p>}
              </div>
            </div>

            <div className="input-group">
              <label>Médico que abre el proceso</label>
              <select
                className="select-custom"
                value={openedById}
                onChange={(e) => setOpenedById(e.target.value)}
                disabled={loadingMedicos}
              >
                <option value="">
                  {loadingMedicos ? 'Cargando médicos...' : 'Seleccionar médico...'}
                </option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName} — {m.email}</option>
                ))}
              </select>
            </div>

            {createError && <p className="error-server">{createError}</p>}
            {createSuccess && <p className="success-message">{createSuccess}</p>}

            <button className="btn-submit" type="submit" disabled={creating}>
              {creating ? 'Abriendo proceso...' : 'Abrir Proceso'}
            </button>
          </form>
        </div>
      )}

      {searchError && <p className="list-error">{searchError}</p>}

      {searched && !searchLoading && results.length === 0 && !searchError && (
        <p className="list-empty">No se encontraron procesos.</p>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div className="cards-grid">
          {results.map((proceso) => (
            <div
              key={proceso.id}
              className={`proceso-card ${selectedProcess?.id === proceso.id ? 'proceso-card-active' : ''}`}
              onClick={() => selectProcess(proceso)}
            >
              <div className="card-header">
                <span className="proceso-id">Proceso #{proceso.id}</span>
                <span className={getEstadoStyle(proceso.currentState)}>
                  {getEstadoLabel(proceso.currentState)}
                </span>
              </div>
              <div className="card-body">
                <div className="card-field">
                  <span className="field-label">Donante</span>
                  <span className="field-value">{proceso.donorName || '—'}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Receptor</span>
                  <span className="field-value">{proceso.recipientName || '—'}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Abierto por</span>
                  <span className="field-value">{proceso.openedByEmail || '—'}</span>
                </div>
                <div className="card-field">
                  <span className="field-label">Fecha</span>
                  <span className="field-value">
                    {proceso.createdAt ? new Date(proceso.createdAt).toLocaleDateString('es-CO') : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detalle + historial + actualizar estado */}
      {selectedProcess && (
        <div className="section-card">
          <div className="detail-header">
            <h2 className="section-title">Detalle del Proceso #{selectedProcess.id}</h2>
            <span className={getEstadoStyle(selectedProcess.currentState)}>
              {getEstadoLabel(selectedProcess.currentState)}
            </span>
          </div>

          <h3 className="subsection-title">Historial de Estados</h3>
          {historialLoading ? (
            <p className="list-loading">Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p className="list-empty">Sin movimientos registrados aún.</p>
          ) : (
            <ul className="timeline">
              {historial.map((h) => (
                <li key={h.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-states">
                      {h.previousState && (
                        <>
                          <span className={getEstadoStyle(h.previousState)}>
                            {getEstadoLabel(h.previousState)}
                          </span>
                          <span className="timeline-arrow">→</span>
                        </>
                      )}
                      <span className={getEstadoStyle(h.newState)}>
                        {getEstadoLabel(h.newState)}
                      </span>
                    </div>
                    {h.clinicalObservation && (
                      <p className="timeline-observation">{h.clinicalObservation}</p>
                    )}
                    <p className="timeline-meta">
                      {h.changedByEmail || 'Sistema'} ·{' '}
                      {h.changedAt ? new Date(h.changedAt).toLocaleString('es-CO') : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h3 className="subsection-title">Actualizar Estado</h3>
          <form onSubmit={handleUpdateState} className="update-state-form">
            <div className="form-row">
              <div className="input-group">
                <label>Nuevo Estado</label>
                <select
                  className="select-custom"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>{getEstadoLabel(estado)}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Médico que realiza el cambio</label>
                <select
                  className="select-custom"
                  value={changedById}
                  onChange={(e) => setChangedById(e.target.value)}
                  disabled={loadingMedicos}
                >
                  <option value="">Seleccionar médico...</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Observación Clínica (opcional)</label>
              <textarea
                className="textarea-custom"
                value={clinicalObservation}
                onChange={(e) => setClinicalObservation(e.target.value)}
                rows={2}
                placeholder="Detalle del cambio de estado..."
              />
            </div>

            {updateError && <p className="error-server">{updateError}</p>}
            {updateSuccess && <p className="success-message">{updateSuccess}</p>}

            <button className="btn-submit" type="submit" disabled={updating}>
              {updating ? 'Actualizando...' : 'Actualizar Estado'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default SeguimientoDonacion
