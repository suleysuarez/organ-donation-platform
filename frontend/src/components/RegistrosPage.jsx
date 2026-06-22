import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageModuleHeader from './PageModuleHeader'
import documentImage from '../assets/Document.png'
import bgRegistros from '../assets/Background-RP.png'
import '../styles/DonantesReceptoresPage.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const DONANTES_URL = `${BASE_URL}/api/donantes`
const RECEPTORES_URL = `${BASE_URL}/api/receptores`

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

function RegistrosPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('donante') // 'donante' | 'receptor' | 'consultar'

  return (
    <div
      className="dr-page-wrapper"
      style={{ backgroundImage: `url(${bgRegistros})` }}
    >
      <div className="dr-container">
        <PageModuleHeader
          image={documentImage}
          title="Panel de Registros y Consultas"
          subtitle="Selecciona una opcion para registrar o consultar en el sistema"
        />
        <div className="list-header">
          <h1>Panel de Registros y Consultas</h1>
          <p className="list-subtitle">Selecciona una opción para registrar o consultar en el sistema</p>
        </div>

        <div className="dr-tabs">
          <button 
            className={`dr-tab ${tab === 'donante' ? 'dr-tab-active' : ''}`} 
            onClick={() => setTab('donante')}
          >
            ❤️ Nuevo Donante
          </button>
          <button 
            className={`dr-tab ${tab === 'receptor' ? 'dr-tab-active' : ''}`} 
            onClick={() => setTab('receptor')}
          >
            🧑‍🦯 Nuevo Receptor
          </button>
          <button 
            className={`dr-tab ${tab === 'consultar' ? 'dr-tab-active' : ''}`} 
            onClick={() => setTab('consultar')}
          >
            🔍 Consultar por ID
          </button>
        </div>

        {/* Apartado para redirigir al registro de donantes */}
        {tab === 'donante' && (
          <div className="section-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary, #667085)' }}>
              El registro de donantes se realiza desde su formulario interactivo dedicado.
            </p>
            <button className="btn-submit" onClick={() => navigate('/register-donante')}>
              Ir a Registrar Donante
            </button>
          </div>
        )}

        {/* Apartado para redirigir al registro de receptores/pacientes */}
        {tab === 'receptor' && (
          <div className="section-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary, #667085)' }}>
              El registro de receptores se gestiona desde la sección de Pacientes.
            </p>
            <button className="btn-submit" onClick={() => navigate('/register-paciente')}>
              Ir a Registrar Receptor
            </button>
          </div>
        )}

        {/* Apartado de consultas (se mantiene en la misma vista) */}
        {tab === 'consultar' && <ConsultaPorId />}
      </div>
    </div>
  )
}

function ConsultaPorId() {
  const [tipo, setTipo] = useState('donante') // 'donante' | 'receptor'
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
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      })
      
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
        <select 
          className="search-mode" 
          value={tipo} 
          onChange={(e) => { setTipo(e.target.value); setResultado(null); setError('') }}
        >
          <option value="donante">Donante</option>
          <option value="receptor">Receptor</option>
        </select>
        <input 
          type="text" 
          value={id} 
          onChange={(e) => setId(e.target.value)} 
          placeholder="Ingrese el id..." 
          className="search-input" 
        />
        <button type="submit" className="btn-search">
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="list-error">{error}</p>}

      {resultado && (
        <div className="detail-grid" style={{ marginTop: '20px' }}>
          <div className="detail-field">
            <span className="field-label">Nombre</span>
            <span className="field-value">{resultado.fullName}</span>
          </div>
          <div className="detail-field">
            <span className="field-label">Documento</span>
            <span className="field-value">{resultado.documentType} — {resultado.documentNumber}</span>
          </div>
          <div className="detail-field">
            <span className="field-label">Tipo de Sangre</span>
            <span className="field-value">{resultado.bloodType || '—'}</span>
          </div>
          {tipo === 'receptor' && (
            <>
              <div className="detail-field">
                <span className="field-label">Órgano Necesario</span>
                <span className="field-value">{resultado.organNeeded || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Urgencia</span>
                <span className="field-value">{resultado.urgencyLevel || '—'}</span>
              </div>
            </>
          )}
          <div className="detail-field">
            <span className="field-label">Estado</span>
            <span className="field-value">{resultado.status || '—'}</span>
          </div>
          <div className="detail-field">
            <span className="field-label">Contacto</span>
            <span className="field-value">{resultado.contactEmail || resultado.contactPhone || '—'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegistrosPage