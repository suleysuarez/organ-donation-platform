import { useState, useEffect } from 'react'
import '../styles/PacientesListPage.css'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/receptores`
const PAGE_SIZE = 6

function PacientesListPage() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchPacientes()
  }, [page, search])

  const fetchPacientes = async () => {
    setLoading(true)
    setServerError('')

    try {
      const params = new URLSearchParams({
        page,
        size: PAGE_SIZE,
        sort: 'fullName,asc'
      })
      if (search.trim()) params.append('q', search.trim())

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPacientes(data.content || [])
        setTotalPages(data.totalPages || 0)
      } else {
        setServerError('Error al cargar la lista de pacientes.')
      }
    } catch (error) {
      setServerError('No se pudo conectar con el servidor. Verifica si el backend está encendido.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  const handleClear = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Pacientes Registrados</h1>
        <p className="list-subtitle">
          Consulta y gestiona los pacientes receptores registrados en el sistema
        </p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nombre o número de documento..."
          className="search-input"
        />
        <button type="submit" className="btn-search">
          Buscar
        </button>
        {search && (
          <button type="button" className="btn-clear" onClick={handleClear}>
            Limpiar
          </button>
        )}
      </form>

      {serverError && <p className="list-error">{serverError}</p>}

      {loading ? (
        <p className="list-loading">Cargando pacientes...</p>
      ) : pacientes.length === 0 ? (
        <p className="list-empty">
          {search
            ? `No se encontraron pacientes para "${search}".`
            : 'No hay pacientes registrados aún.'}
        </p>
      ) : (
        <>
          <div className="cards-grid">
            {pacientes.map((paciente) => (
              <div className="paciente-card" key={paciente.id}>
                <div className="card-header">
                  <div className="card-avatar">
                    {paciente.fullName ? paciente.fullName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 className="card-name">{paciente.fullName}</h3>
                    <p className="card-role">Receptor</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-field">
                    <span className="field-label">Correo</span>
                    <span className="field-value">{paciente.contactEmail || 'No registrado'}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Documento</span>
                    <span className="field-value">
                      {paciente.documentType} — {paciente.documentNumber}
                    </span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Teléfono</span>
                    <span className="field-value">
                      {paciente.contactPhone || 'No registrado'}
                    </span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Tipo de Sangre</span>
                    <span className="field-value">
                      {paciente.bloodType ? paciente.bloodType.replace('_POS', '+').replace('_NEG', '-') : 'No registrado'}
                    </span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Registro</span>
                    <span className="field-value">
                      {paciente.createdAt
                        ? new Date(paciente.createdAt).toLocaleDateString('es-CO')
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="badge badge-paciente">Paciente</span>
                  <span
                    className={`badge ${
                      paciente.isActive !== false ? 'badge-active' : 'badge-inactive'
                    }`}
                  >
                    {paciente.isActive !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              className="btn-page"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              ← Anterior
            </button>
            <span className="page-info">
              Página {page + 1} de {totalPages}
            </span>
            <button
              className="btn-page"
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= totalPages}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default PacientesListPage