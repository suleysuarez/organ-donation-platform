import { useEffect, useState } from 'react'
import PageModuleHeader from './PageModuleHeader'
import emailImage from '../assets/Email.png'
import '../styles/PacientesListPage.css'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/donantes`
const PAGE_SIZE = 6

function DonantesListPage() {
  const [donantes, setDonantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchDonantes()
  }, [page, search])

  const fetchDonantes = async () => {
    setLoading(true)
    setServerError('')

    try {
      const params = new URLSearchParams({
        page,
        size: PAGE_SIZE,
        sort: 'fullName,asc',
      })
      if (search.trim()) params.append('q', search.trim())

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDonantes(data.content || [])
        setTotalPages(data.totalPages || 0)
      } else {
        setServerError('Error al cargar la lista de donantes.')
      }
    } catch {
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
    <div className="list-container">
      <PageModuleHeader
        image={emailImage}
        title="Donantes Registrados"
        subtitle="Consulta y gestiona los donantes registrados por el personal medico"
      />

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nombre o numero de documento..."
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
        <p className="list-loading">Cargando donantes...</p>
      ) : donantes.length === 0 ? (
        <p className="list-empty">
          {search ? `No se encontraron donantes para "${search}".` : 'No hay donantes registrados aun.'}
        </p>
      ) : (
        <>
          <div className="cards-grid">
            {donantes.map((donante) => (
              <div className="paciente-card" key={donante.id}>
                <div className="card-header">
                  <div className="card-avatar">
                    {donante.fullName ? donante.fullName.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h3 className="card-name">{donante.fullName}</h3>
                    <p className="card-role">Donante</p>
                    <span className="card-id-badge">ID #{donante.id}</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-field">
                    <span className="field-label">Correo</span>
                    <span className="field-value">{donante.contactEmail || 'No registrado'}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Documento</span>
                    <span className="field-value">{donante.documentType} - {donante.documentNumber}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Telefono</span>
                    <span className="field-value">{donante.contactPhone || 'No registrado'}</span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Tipo de Sangre</span>
                    <span className="field-value">
                      {donante.bloodType ? donante.bloodType.replace('_POS', '+').replace('_NEG', '-') : 'No registrado'}
                    </span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Registro</span>
                    <span className="field-value">
                      {donante.createdAt ? new Date(donante.createdAt).toLocaleDateString('es-CO') : '-'}
                    </span>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="badge badge-paciente">Donante</span>
                  <span className="badge badge-active">{donante.status || 'Activo'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button className="btn-page" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              Anterior
            </button>
            <span className="page-info">Pagina {page + 1} de {totalPages || 1}</span>
            <button className="btn-page" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default DonantesListPage