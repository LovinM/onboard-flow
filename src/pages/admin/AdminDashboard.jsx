import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, certificates: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentUsers()
  }, [])

  const fetchStats = async () => {
    const [users, courses, enrollments, certificates] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('certificates').select('*', { count: 'exact', head: true }),
    ])
    setStats({
      users: users.count || 0,
      courses: courses.count || 0,
      enrollments: enrollments.count || 0,
      certificates: certificates.count || 0,
    })
  }

  const fetchRecentUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentUsers(data || [])
    setLoading(false)
  }

  const roleColor = (role) => {
    if (role === 'admin') return 'bg-red-100 text-red-700'
    if (role === 'dept_head') return 'bg-purple-100 text-purple-700'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Overview of OnboardFlow activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.users, color: 'text-blue-600' },
            { label: 'Active Courses', value: stats.courses, color: 'text-green-600' },
            { label: 'Enrollments', value: stats.enrollments, color: 'text-purple-600' },
            { label: 'Certificates', value: stats.certificates, color: 'text-orange-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Name</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Email</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Role</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user, i) => (
                    <tr key={user.id} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-2 px-3 font-medium">{user.name}</td>
                      <td className="py-2 px-3 text-slate-500">{user.email}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">{user.department || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}