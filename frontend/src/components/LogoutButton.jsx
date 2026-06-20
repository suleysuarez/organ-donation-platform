import { useNavigate } from 'react-router-dom'

function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <button onClick={handleLogout}>
      Cerrar sesión
    </button>
  )
}

export default LogoutButton