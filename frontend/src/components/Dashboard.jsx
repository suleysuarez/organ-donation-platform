import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/Dashboard.css'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: '🏠',
    path: '/dashboard',
  },
  {
    label: 'Médicos',
    icon: '👨‍⚕️',
    path: '/List/medicos',
  },
  {
    label: 'Pacientes',
    icon: '🧑‍🦯',
    path: '/List/pacientes',
  },
  {
    label: 'Reportes Médicos',
    icon: '📋',
    path: '/reportes',
  },
  {
    label: 'Donantes y Receptores',
    icon: '❤️',
    path: '/donantes',
  },
  {
    label: 'Seguimiento de Donación',
    icon: '🔍',
    path: '/seguimiento',
  },
]

// Datos mock — reemplazar con llamadas reales al backend cuando estén disponibles
const STATS = [
  { label: 'Médicos Registrados', value: '24', color: '#008b9b', icon: '👨‍⚕️' },
  { label: 'Pacientes Activos', value: '138', color: '#0c2a46', icon: '🧑‍🦯' },
  { label: 'Reportes Este Mes', value: '57', color: '#027a48', icon: '📋' },
  { label: 'Donaciones en Proceso', value: '9', color: '#b54708', icon: '❤️' },
]

const ACTIVIDAD_RECIENTE = [
  { tipo: 'Médico registrado', nombre: 'Dr. Carlos Herrera', fecha: '18/06/2026', estado: 'VERIFICADO' },
  { tipo: 'Paciente registrado', nombre: 'Ana María Torres', fecha: '17/06/2026', estado: 'ACTIVO' },
  { tipo: 'Reporte creado', nombre: 'Reporte #0057', fecha: '17/06/2026', estado: 'PENDIENTE' },
  { tipo: 'Donación iniciada', nombre: 'Proceso #0009', fecha: '16/06/2026', estado: 'EN PROCESO' },
  { tipo: 'Médico verificado', nombre: 'Dra. Laura Gómez', fecha: '15/06/2026', estado: 'VERIFICADO' },
]

function estadoBadgeClass(estado) {
  switch (estado) {
    case 'VERIFICADO': return 'badge badge-verified'
    case 'ACTIVO':     return 'badge badge-active'
    case 'PENDIENTE':  return 'badge badge-pending'
    case 'EN PROCESO': return 'badge badge-process'
    default:           return 'badge badge-pending'
  }
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <span className="sidebar-title">OrganDonation</span>}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
              onClick={() => navigate(item.path)}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span className="nav-label">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="dashboard-main">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Panel de Control</h1>
            <p className="dashboard-subtitle">Bienvenido al sistema de gestión de donación de órganos</p>
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="stats-grid">
          {STATS.map((stat) => (
            <div className="stat-card" key={stat.label} style={{ borderTop: `4px solid ${stat.color}` }}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actividad reciente */}
        <div className="section-card">
          <h2 className="section-title">Actividad Reciente</h2>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVIDAD_RECIENTE.map((item, i) => (
                <tr key={i}>
                  <td>{item.tipo}</td>
                  <td>{item.nombre}</td>
                  <td>{item.fecha}</td>
                  <td>
                    <span className={estadoBadgeClass(item.estado)}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Accesos rápidos */}
        <div className="section-card">
          <h2 className="section-title">Accesos Rápidos</h2>
          <div className="quick-access-grid">
            <button className="quick-btn" onClick={() => navigate('/register-medic')}>
              <span>👨‍⚕️</span>
              <span>Registrar Médico</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/register-paciente')}>
              <span>🧑‍🦯</span>
              <span>Registrar Paciente</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/List/medicos')}>
              <span>📋</span>
              <span>Ver Médicos</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/List/pacientes')}>
              <span>📋</span>
              <span>Ver Pacientes</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}

export default Dashboard
