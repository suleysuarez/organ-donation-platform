import { useLocation } from 'react-router-dom'
import logo from '../assets/Logo_UI.png'
import '../styles/AppBrandLogo.css'

function AppBrandLogo() {
  const location = useLocation()
  const hiddenRoutes = ['/', '/dashboard']

  if (hiddenRoutes.includes(location.pathname)) return null

  return (
    <img
      src={logo}
      alt="SaveMe"
      className="app-brand-logo"
    />
  )
}

export default AppBrandLogo
