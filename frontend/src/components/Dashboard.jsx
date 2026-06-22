import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/Logo_UI.png'
import heroImage from '../assets/hero.png'
import bgDashboard1 from '../assets/Background-Dashboard.png'
import bgDashboard2 from '../assets/Background-Dashboard2.png'
import bgDashboard3 from '../assets/Background-Dashboard3.png'
import '../styles/Dashboard.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const DASHBOARD_BACKGROUNDS = [bgDashboard1, bgDashboard2, bgDashboard3]
const BG_INTERVAL_MS = 5000

const ICONS = {
  dashboard: '\u{1F3E0}',
  medicos: '\u2695\uFE0F',
  donantes: '\u2764\uFE0F',
  receptores: '\u{1F9D1}\u200D\u{1F9BD}',
  reportes: '\u{1F4CB}',
  registros: '\u{1F4DD}',
  seguimiento: '\u{1F50E}',
  logout: '\u{1F6AA}',
  drop: '\u{1FA78}',
  clock: '\u{23F1}\uFE0F',
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

const BLOOD_LABELS = {
  O_POS: 'O+', O_NEG: 'O-',
  A_POS: 'A+', A_NEG: 'A-',
  B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-',
}

const BLOOD_ORDER = ['O_POS', 'O_NEG', 'A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG']

const EMPTY_METRICS = {
  medicos: { total: 0, verificados: 0, pendientes: 0, rechazados: 0, ultimo: null },
  donantes: { total: 0, porTipoSangre: {}, ultimo: null },
  receptores: { total: 0, porTipoSangre: {}, urgentes: 0, ultimo: null },
  reportes: { total: 0, pendientes: 0, enRevision: 0, completados: 0 },
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

function tallyBloodTypes(list) {
  const counts = {}
  list.forEach((p) => {
    if (!p.bloodType) return
    counts[p.bloodType] = (counts[p.bloodType] || 0) + 1
  })
  return counts
}

function mostRecent(list) {
  return list.reduce((latest, item) => {
    if (!item.createdAt) return latest
    if (!latest || !latest.createdAt) return item
    return new Date(item.createdAt) > new Date(latest.createdAt) ? item : latest
  }, null)
}

function topBloodType(counts) {
  const entries = Object.entries(counts)
  if (entries.length === 0) return null
  const [type] = entries.reduce((max, entry) => (entry[1] > max[1] ? entry : max))
  return BLOOD_LABELS[type] || type
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  if (Number.isNaN(diffMs) || diffMs < 0) return ''
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  const months = Math.floor(days / 30)
  return `hace ${months} mes${months > 1 ? 'es' : ''}`
}

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [metrics, setMetrics] = useState(EMPTY_METRICS)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((i) => (i + 1) % DASHBOARD_BACKGROUNDS.length)
    }, BG_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchDashboard = async () => {
      const headers = getAuthHeaders()

      try {
        const [medicosRes, donantesRes, receptoresRes, reportesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/medicos?page=0&size=100&sort=createdAt,desc`, { headers }),
          fetch(`${BASE_URL}/api/donantes?page=0&size=100&sort=createdAt,desc`, { headers }),
          fetch(`${BASE_URL}/api/receptores?page=0&size=100&sort=createdAt,desc`, { headers }),
          fetch(`${BASE_URL}/api/reportes`, { headers }),
        ])

        const medicos = medicosRes.ok ? await medicosRes.json() : null
        const donantes = donantesRes.ok ? await donantesRes.json() : null
        const receptores = receptoresRes.ok ? await receptoresRes.json() : null
        const reportes = reportesRes.ok ? await reportesRes.json() : []

        const medicosList = medicos?.content ?? []
        const donantesList = donantes?.content ?? []
        const receptoresList = receptores?.content ?? []
        const reportesList = Array.isArray(reportes) ? reportes : []

        setMetrics({
          medicos: {
            total: medicos?.totalElements ?? medicosList.length,
            verificados: medicosList.filter((m) => m.verificationStatus === 'VERIFICADO').length,
            pendientes: medicosList.filter((m) => !m.verificationStatus || m.verificationStatus === 'PENDIENTE').length,
            rechazados: medicosList.filter((m) => m.verificationStatus === 'RECHAZADO').length,
            ultimo: mostRecent(medicosList),
          },
          donantes: {
            total: donantes?.totalElements ?? donantesList.length,
            porTipoSangre: tallyBloodTypes(donantesList),
            ultimo: mostRecent(donantesList),
          },
          receptores: {
            total: receptores?.totalElements ?? receptoresList.length,
            porTipoSangre: tallyBloodTypes(receptoresList),
            urgentes: receptoresList.filter((r) => r.urgencyLevel === 'ALTA' || r.urgencyLevel === 'CRITICA').length,
            ultimo: mostRecent(receptoresList),
          },
          reportes: {
            total: reportesList.length,
            pendientes: reportesList.filter((r) => r.status === 'PENDIENTE').length,
            enRevision: reportesList.filter((r) => r.status === 'EN_REVISION').length,
            completados: reportesList.filter((r) => r.status === 'COMPLETADO').length,
          },
        })
      } catch {
        setDashboardError('No se pudieron cargar las metricas del sistema.')
      } finally {
        setLoadingMetrics(false)
      }
    }

    fetchDashboard()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/')
  }

  const totalPersonas = metrics.medicos.total + metrics.donantes.total + metrics.receptores.total

  const bloodCombined = {}
  BLOOD_ORDER.forEach((type) => {
    const count = (metrics.donantes.porTipoSangre[type] || 0) + (metrics.receptores.porTipoSangre[type] || 0)
    if (count > 0) bloodCombined[type] = count
  })
  const bloodMax = Math.max(1, ...Object.values(bloodCombined))
  const hasBloodData = Object.keys(bloodCombined).length > 0

  const reportesTotal = metrics.reportes.total
  const reportesPct = (n) => (reportesTotal > 0 ? Math.round((n / reportesTotal) * 100) : 0)

  const recentEntries = [
    metrics.medicos.ultimo && {
      icon: ICONS.medicos,
      label: 'Médico',
      name: metrics.medicos.ultimo.fullName,
      createdAt: metrics.medicos.ultimo.createdAt,
    },
    metrics.donantes.ultimo && {
      icon: ICONS.donantes,
      label: 'Donante',
      name: metrics.donantes.ultimo.fullName,
      createdAt: metrics.donantes.ultimo.createdAt,
    },
    metrics.receptores.ultimo && {
      icon: ICONS.receptores,
      label: 'Receptor',
      name: metrics.receptores.ultimo.fullName,
      createdAt: metrics.receptores.ultimo.createdAt,
    },
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="dashboard-layout">
      {DASHBOARD_BACKGROUNDS.map((bg, i) => (
        <div
          key={bg}
          className={`dashboard-bg-layer ${i === bgIndex ? 'is-active' : ''}`}
          style={{ backgroundImage: `url(${bg})` }}
        />
      ))}

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

        {dashboardError && <p className="dashboard-error">{dashboardError}</p>}

        <div className="dashboard-columns">
          {/* ───────── Columna principal ───────── */}
          <div className="col-main">
            <section className="dashboard-section">
              <div className="section-header-row">
                <h2 className="section-title">Personas Registradas</h2>
                <span className="section-total-pill">{loadingMetrics ? '—' : totalPersonas} en total</span>
              </div>

              <div className="people-grid">
                <button
                  className="people-card"
                  style={{ borderTop: '4px solid #008b9b' }}
                  onClick={() => navigate('/List/medicos')}
                >
                  <div className="people-card-icon">{ICONS.medicos}</div>
                  <p className="people-card-value">{loadingMetrics ? '—' : metrics.medicos.total}</p>
                  <p className="people-card-label">Médicos</p>
                  <p className="people-card-sub">
                    {loadingMetrics ? 'Cargando...' : `✔ ${metrics.medicos.verificados} verificados`}
                  </p>
                </button>

                <button
                  className="people-card"
                  style={{ borderTop: '4px solid #b54708' }}
                  onClick={() => navigate('/List/donantes')}
                >
                  <div className="people-card-icon">{ICONS.donantes}</div>
                  <p className="people-card-value">{loadingMetrics ? '—' : metrics.donantes.total}</p>
                  <p className="people-card-label">Donantes</p>
                  <p className="people-card-sub">
                    {loadingMetrics
                      ? 'Cargando...'
                      : topBloodType(metrics.donantes.porTipoSangre)
                        ? `Tipo más común: ${topBloodType(metrics.donantes.porTipoSangre)}`
                        : 'Sin tipo de sangre aún'}
                  </p>
                </button>

                <button
                  className="people-card"
                  style={{ borderTop: '4px solid #0c2a46' }}
                  onClick={() => navigate('/List/pacientes')}
                >
                  <div className="people-card-icon">{ICONS.receptores}</div>
                  <p className="people-card-value">{loadingMetrics ? '—' : metrics.receptores.total}</p>
                  <p className="people-card-label">Receptores</p>
                  <p className="people-card-sub people-card-sub-alert">
                    {loadingMetrics
                      ? 'Cargando...'
                      : metrics.receptores.urgentes > 0
                        ? `🔴 ${metrics.receptores.urgentes} en urgencia alta/crítica`
                        : 'Sin casos urgentes'}
                  </p>
                </button>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-header-row">
                <h2 className="section-title">{ICONS.drop} Distribución por Tipo de Sangre</h2>
              </div>
              <div className="section-card blood-chart-card">
                {!loadingMetrics && !hasBloodData && (
                  <p className="dashboard-note">Aún no hay donantes o receptores con tipo de sangre registrado.</p>
                )}
                {(loadingMetrics || hasBloodData) && (
                  <div className="blood-chart">
                    {(loadingMetrics ? BLOOD_ORDER : Object.keys(bloodCombined)).map((type) => {
                      const count = bloodCombined[type] || 0
                      const pct = loadingMetrics ? 0 : Math.max(6, Math.round((count / bloodMax) * 100))
                      return (
                        <div className="blood-row" key={type}>
                          <span className="blood-label">{BLOOD_LABELS[type]}</span>
                          <div className="blood-bar-track">
                            <div className="blood-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="blood-count">{loadingMetrics ? '—' : count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ───────── Columna lateral ───────── */}
          <div className="col-side">
            <section className="dashboard-section">
              <div className="section-header-row">
                <h2 className="section-title">Reportes Médicos</h2>
              </div>
              <button className="section-card reportes-summary-card" onClick={() => navigate('/reportes')}>
                <p className="reportes-summary-total">{loadingMetrics ? '—' : metrics.reportes.total}</p>
                <p className="dashboard-note" style={{ margin: '0 0 14px' }}>reportes en el sistema</p>

                {!loadingMetrics && reportesTotal > 0 && (
                  <div className="reportes-bar">
                    <div className="reportes-bar-segment" style={{ width: `${reportesPct(metrics.reportes.pendientes)}%`, background: '#fef0c7' }} />
                    <div className="reportes-bar-segment" style={{ width: `${reportesPct(metrics.reportes.enRevision)}%`, background: '#f0f4ff' }} />
                    <div className="reportes-bar-segment" style={{ width: `${reportesPct(metrics.reportes.completados)}%`, background: '#d1fadf' }} />
                  </div>
                )}

                <div className="reportes-legend">
                  <span><i className="legend-dot" style={{ background: '#b54708' }} />Pendientes <b>{loadingMetrics ? '—' : metrics.reportes.pendientes}</b></span>
                  <span><i className="legend-dot" style={{ background: '#3538cd' }} />En revisión <b>{loadingMetrics ? '—' : metrics.reportes.enRevision}</b></span>
                  <span><i className="legend-dot" style={{ background: '#027a48' }} />Completados <b>{loadingMetrics ? '—' : metrics.reportes.completados}</b></span>
                </div>
              </button>
            </section>

            <section className="dashboard-section">
              <div className="section-header-row">
                <h2 className="section-title">{ICONS.clock} Actividad Reciente</h2>
              </div>
              <div className="section-card recent-card">
                {loadingMetrics ? (
                  <p className="dashboard-note">Cargando actividad...</p>
                ) : recentEntries.length === 0 ? (
                  <p className="dashboard-note">Aún no hay registros recientes.</p>
                ) : (
                  <ul className="recent-list">
                    {recentEntries.map((entry, i) => (
                      <li className="recent-item" key={i}>
                        <span className="recent-icon">{entry.icon}</span>
                        <div className="recent-info">
                          <p className="recent-name">{entry.name || 'Sin nombre'}</p>
                          <p className="recent-meta">{entry.label} · {timeAgo(entry.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard