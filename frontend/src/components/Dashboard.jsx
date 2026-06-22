import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/Logo_UI.png'
import heroImage from '../assets/hero.png'
import '../styles/Dashboard.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const ICONS = {
  dashboard: '\u{1F3E0}',
  medicos: '\u2695\uFE0F',
  donantes: '\u2764\uFE0F',
  receptores: '\u{1F9D1}\u200D\u{1F9BD}',
  reportes: '\u{1F4CB}',
  registros: '\u{1F4DD}',
  seguimiento: '\u{1F50E}',
  logout: '\u{1F6AA}',
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: ICONS.dashboard, path: '/dashboard' },
  { label: 'Medicos', icon: ICONS.medicos, path: '/List/medicos' },
  { label: 'Donantes', icon: ICONS.donantes, path: '/List/donantes' },
  { label: 'Receptores', icon: ICONS.receptores, path: '/List/pacientes' },
  { label: 'Reportes Medicos', icon: ICONS.reportes, path: '/reportes' },
  { label: 'Registros', icon: ICONS.registros, path: '/registros' },
  { label: 'Seguimiento', icon: ICONS.seguimiento, path: '/seguimiento' },
]

const DEFAULT_STATS = [
  { label: 'Medicos Registrados', value: '-', color: '#008b9b', icon: ICONS.medicos },
  { label: 'Donantes Registrados', value: '-', color: '#b54708', icon: ICONS.donantes },
  { label: 'Receptores Registrados', value: '-', color: '#0c2a46', icon: ICONS.receptores },
  { label: 'Registros Totales', value: '-', color: '#7a5af8', icon: ICONS.registros },
  { label: 'Reportes Medicos', value: '-', color: '#027a48', icon: ICONS.reportes },
]

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [dashboardError, setDashboardError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      const headers = getAuthHeaders()

      try {
        const [medicosRes, donantesRes, receptoresRes, reportesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/medicos?page=0&size=1`, { headers }),
          fetch(`${BASE_URL}/api/donantes?page=0&size=1`, { headers }),
          fetch(`${BASE_URL}/api/receptores?page=0&size=1`, { headers }),
          fetch(`${BASE_URL}/api/reportes`, { headers }),
        ])

        const medicos = medicosRes.ok ? await medicosRes.json() : null
        const donantes = donantesRes.ok ? await donantesRes.json() : null
        const receptores = receptoresRes.ok ? await receptoresRes.json() : null
        const reportes = reportesRes.ok ? await reportesRes.json() : []

        const totalMedicos = medicos?.totalElements ?? 0
        const totalDonantes = donantes?.totalElements ?? 0
        const totalReceptores = receptores?.totalElements ?? 0

        setStats([
          { label: 'Medicos Registrados', value: totalMedicos, color: '#008b9b', icon: ICONS.medicos },
          { label: 'Donantes Registrados', value: totalDonantes, color: '#b54708', icon: ICONS.donantes },
          { label: 'Receptores Registrados', value: totalReceptores, color: '#0c2a46', icon: ICONS.receptores },
          { label: 'Registros Totales', value: totalMedicos + totalDonantes + totalReceptores, color: '#7a5af8', icon: ICONS.registros },
          { label: 'Reportes Medicos', value: Array.isArray(reportes) ? reportes.length : 0, color: '#027a48', icon: ICONS.reportes },
        ])
      } catch {
        setDashboardError('No se pudieron cargar las metricas del sistema.')
      }
    }

    fetchDashboard()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            title={sidebarCollapsed ? 'Expandir menu' : 'Contraer menu'}
          >
            {sidebarCollapsed ? '\u203A' : '\u2039'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Cerrar Sesion">
            <span className="nav-icon">{ICONS.logout}</span>
            <span className="nav-label">Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-wrapper">
            <div>
              <h1 className="dashboard-title">Panel de Control</h1>
              <p className="dashboard-subtitle">Bienvenido al sistema de gestion de donacion de organos</p>
            </div>
            <div className="header-date">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="dashboard-header-image">
              <img src={heroImage} alt="" />
            </div>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label} style={{ borderTop: `4px solid ${stat.color}` }}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {dashboardError && <p className="dashboard-error">{dashboardError}</p>}

      </main>
    </div>
  )
}

export default Dashboard
