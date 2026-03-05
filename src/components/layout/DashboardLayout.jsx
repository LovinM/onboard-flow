import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout({ children }) {
  const { profile } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={profile?.role} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
