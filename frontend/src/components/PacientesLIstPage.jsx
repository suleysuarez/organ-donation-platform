import { useState, useEffect } from 'react'
import '../styles/PacientesListPage.css'

// TODO: actualizar esta URL cuando el backend implemente el endpoint de pacientes
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/pacientes`

// Datos de ejemplo mientras el backend no está listo
const PACIENTES_MOCK = [
  {
    id: 1,
    nombre: 'Ana María Torres',
    email: 'ana.torres@email.com',
    documentType: 'CC',
    documentNumber: '1098234567',
    telefono: '3001234567',
    fechaNacimiento: '1990-05-14',
    tipoSangre: 'O+',
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Carlos Andrés Gómez',
    email: 'carlos.gomez@email.com',
    documentType: 'CC',
    documentNumber: '1023456789',
    telefono: '3109876543',
    fechaNacimiento: '1985-11-22',
    tipoSangre: 'A+',
    isActive: true,
    createdAt: '2024-02-05T08:30:00Z'
  },
  {
    id: 3,
    nombre: 'Laura Sofía Ramírez',
    email: 'laura.ramirez@email.com',
    documentType: 'CE',
    documentNumber: '987654321',
    telefono: '3205556677',
    fechaNacimiento: '1995-03-08',
    tipoSangre: 'B-',
    isActive: false,
    createdAt: '2024-03-20T15:45:00Z'
  },
  {
    id: 4,
    nombre: 'Jorge Luis Herrera',
    email: 'jorge.herrera@email.com',
    documentType: 'CC',
    documentNumber: '80123456',
    telefono: '3157778899',
    fechaNacimiento: '1978-07-30',
    tipoSangre: 'AB+',
    isActive: true,
    createdAt: '2024-04-12T09:15:00Z'
  },
  {
    id: 5,
    nombre: 'Valentina Castro',
    email: 'valentina.castro@email.com',
    documentType: 'CC',
    documentNumber: '1045678901',
    telefono: '3002223344',
    fechaNacimiento: '2000-12-01',
    tipoSangre: 'O-',
    isActive: true,
    createdAt: '2024-05-01T11:00:00Z'
  },
  {
    id: 6,
    nombre: 'Miguel Ángel Pérez',
    email: 'miguel.perez@email.com',
    documentType: 'CC',
    documentNumber: '71234567',
    telefono: '3184445566',
    fechaNacimiento: '1970-09-15',
    tipoSangre: 'A-',
    isActive: false,
    createdAt: '2024-06-18T14:20:00Z'
  }
]

const PAGE_SIZE = 6

function PacientesListPage() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // TODO: reemplazar este useEffect por la llamada real al backend
  // cuando el endpoint GET /api/pacientes esté disponible
  useEffect(() => {
    fetchPacientes()
  }, [page, search])

  const fetchPacientes = async () => {
    setLoading(true)
    setServerError('')

    // --- MOCK: simula la respuesta del backend ---
    // Eliminar este bloque y descomentar el fetch real cuando el backend esté listo
    setTimeout(() => {
      let resultado = PACIENTES_MOCK

      if (search.trim()) {
        const q = search.trim().toLowerCase()
        resultado = PACIENTES_MOCK.filter(
          (p) =>
            p.nombre.toLowerCase().includes(q) ||
            p.documentNumber.includes(q) ||
            p.email.toLowerCase().includes(q)
        )
      }

      const inicio = page * PAGE_SIZE
      const fin = inicio + PAGE_SIZE
      setPacientes(resultado.slice(inicio, fin))
      setTotalPages(Math.ceil(resultado.length / PAGE_SIZE))
      setLoading(false)
    }, 400)

    // --- FETCH REAL: descomentar cuando el backend esté listo ---
    // try {
    //   const params = new URLSearchParams({
    //     page,
    //     size: PAGE_SIZE,
    //     sort: 'nombre,asc'
    //   })
    //   if (search.trim()) params.append('q', search.trim())
    //
    //   const token = localStorage.getItem('token')
    //   const response = await fetch(`${API_URL}?${params}`, {
    //     headers: { Authorization: `Bearer ${token}` }
    //   })
    //
    //   if (response.ok) {
    //     const data = await response.json()
    //     setPacientes(data.content)
    //     setTotalPages(data.totalPages)
    //   } else {
    //     setServerError('Error al cargar los pacientes.')
    //   }
    // } catch (error) {
    //   setServerError('No se pudo conectar con el servidor.')
    // } finally {
    //   setLoading(false)
    // }
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
          Consulta y gestiona los pacientes registrados en el sistema
        </p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nombre, documento o correo..."
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
                    {paciente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="card-name">{paciente.nombre}</h3>
                    <p className="card-role">Paciente</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-field">
                    <span className="field-label">Correo</span>
                    <span className="field-value">{paciente.email}</span>
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
                      {paciente.telefono || 'No registrado'}
                    </span>
                  </div>
                  <div className="card-field">
                    <span className="field-label">Tipo de Sangre</span>
                    <span className="field-value">
                      {paciente.tipoSangre || 'No registrado'}
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
                      paciente.isActive ? 'badge-active' : 'badge-inactive'
                    }`}
                  >
                    {paciente.isActive ? 'Activo' : 'Inactivo'}
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