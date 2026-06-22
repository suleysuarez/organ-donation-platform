import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageModuleHeader from './PageModuleHeader'
import profileImage from '../assets/Profile.png'
import bgMedicos from '../assets/Background-Medical.png'
import '../styles/MedicosListPage.css'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/medicos`

function getStatusStyle(status) {
  switch (status) {
    case 'VERIFICADO':  return 'badge badge-verified'
    case 'RECHAZADO':   return 'badge badge-rejected'
    default:            return 'badge badge-pending'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'VERIFICADO': return 'Verificado'
    case 'RECHAZADO':  return 'Rechazado'
    default:           return 'Pendiente'
  }
}

function MedicosListPage() {
  const navigate = useNavigate()

  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const PAGE_SIZE = 9

  useEffect(() => {
    fetchMedicos()
  }, [page, search])

  const fetchMedicos = async () => {
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMedicos(data.content)
        setTotalPages(data.totalPages)
      } else if (response.status === 403) {
        setServerError('No tienes permisos para ver esta información.')
      } else {
        setServerError('Error al cargar los médicos.')
      }
    } catch (error) {
      setServerError('No se pudo conectar con el servidor.')
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
    <div
      className="medicos-page-wrapper"
      style={{ backgroundImage: `url(${bgMedicos})` }}
    >
      <div className="list-container">
        <PageModuleHeader
          image={profileImage}
          title="Medicos Registrados"
          subtitle="Gestiona y visualiza los profesionales de salud registrados en el sistema"
        />

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre o número de documento..."
            className="search-input"
          />
          <button type="submit" className="btn-search">Buscar</button>
          {search && (
            <button type="button" className="btn-clear" onClick={handleClear}>
              Limpiar
            </button>
          )}
        </form>

        {serverError && <p className="list-error">{serverError}</p>}

        {loading ? (
          <p className="list-loading">Cargando médicos...</p>
        ) : medicos.length === 0 ? (
          <p className="list-empty">
            {search ? `No se encontraron médicos para "${search}".` : 'No hay médicos registrados aún.'}
          </p>
        ) : (
          <>
            <div className="cards-grid">
              {medicos.map((medico) => (
                <div
                  className="medico-card"
                  key={medico.id}
                  style={{ '--card-bg-image': `url(${profileImage})` }}
                >
                  <div className="card-header">
                    <div className="card-avatar">
                      {medico.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="card-name">{medico.fullName}</h3>
                      <p className="card-profile">{medico.professionalProfile || 'Sin especialidad'}</p>
                      <span className="card-id-badge">ID #{medico.id}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="card-field">
                      <span className="field-label">Correo</span>
                      <span className="field-value">{medico.email}</span>
                    </div>
                    <div className="card-field">
                      <span className="field-label">Documento</span>
                      <span className="field-value">{medico.documentType} — {medico.documentNumber}</span>
                    </div>
                    <div className="card-field">
                      <span className="field-label">RETHUS</span>
                      <span className="field-value">{medico.rethusRegistrationNumber || 'No registrado'}</span>
                    </div>
                    <div className="card-field">
                      <span className="field-label">Registro</span>
                      <span className="field-value">
                        {medico.createdAt ? new Date(medico.createdAt).toLocaleDateString('es-CO') : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className={getStatusStyle(medico.verificationStatus)}>
                      {getStatusLabel(medico.verificationStatus)}
                    </span>
                    <span className={`badge ${medico.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {medico.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn-detail"
                      onClick={() => navigate(`/List/medicos/${medico.id}`)}
                    >
                      Ver Detalle →
                    </button>
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
              <span className="page-info">Página {page + 1} de {totalPages}</span>
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
    </div>
  )
}

export default MedicosListPage