import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'

const adminLinks = [
  { label: 'Dashboard', path: '/admin', icon: '⊞' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Courses', path: '/admin/courses', icon: '📚' },
  { label: 'Enrollments', path: '/admin/enrollments', icon: '📋' },
  { label: 'Certificates', path: '/admin/certificates', icon: '🏅' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
]

const employeeLinks = [
  { label: 'Dashboard', path: '/employee', icon: '⊞' },
  { label: 'My Courses', path: '/employee/courses', icon: '📚' },
  { label: 'Certificates', path: '/employee/certificates', icon: '🏅' },
  { label: 'Feedback', path: '/employee/feedback', icon: '💬' },
]

const deptHeadLinks = [
  { label: 'Dashboard', path: '/depthead', icon: '⊞' },
  { label: 'My Team', path: '/depthead/team', icon: '👥' },
  { label: 'Reports', path: '/depthead/reports', icon: '📊' },
]

export default function Sidebar({ role }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, profile } = useAuth()

  const links = role === 'admin' ? adminLinks : role === 'dept_head' ? deptHeadLinks : employeeLinks

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="w-56 min-h-screen bg-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-white font-bold text-lg">OnboardFlow</h1>
        <p className="text-slate-400 text-xs mt-1">{profile?.name}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              location.pathname === link.path
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full text-slate-300 hover:text-white hover:bg-slate-700"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}