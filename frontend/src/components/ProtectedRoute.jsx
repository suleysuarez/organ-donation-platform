import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, allowedRoles = ['MEDICO'] }) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token) return <Navigate to="/" replace />
  if (!allowedRoles.includes(role)) {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
