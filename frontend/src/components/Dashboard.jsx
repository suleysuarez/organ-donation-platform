import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/Logo_UI.png'
import '../styles/Dashboard.css'
import backgroundImage from '../assets/Background-Register2.png' 

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { label: 'Médicos', icon: '👨‍⚕️', path: '/List/medicos' },
  { label: 'Pacientes', icon: '🧑‍🦯', path: '/List/pacientes' },
  { label: 'Reportes Médicos', icon: '📋', path: '/reportes' },
  { label: 'Registros', icon: '❤️', path: '/registros' },
  { label: 'Seguimiento de Donación', icon: '🔍', path: '/seguimiento' },
]

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
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div 
      className="dashboard-layout" 
      style={{ '--bg-image': `url(${backgroundImage})` }}
    >
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-wrapper">
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
        </div>

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
      </main>
    </div>
  )
}

export default Dashboard