import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/GlobalBackButton.css'

function GlobalBackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/' || location.pathname === '/dashboard') return null

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/dashboard')
  }

  return (
    <button className="global-back-button" type="button" onClick={handleBack}>
      Volver
    </button>
  )
}

export default GlobalBackButton
