import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const handleRoleChange = async (userId, newRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    fetchUsers()
  }

  const roleColor = (role) => {
    if (role === 'admin') return 'bg-red-100 text-red-700'
    if (role === 'dept_head') return 'bg-purple-100 text-purple-700'
    return 'bg-blue-100 text-blue-700'
  }
  const formatRole = (role) => {
    if (role === 'dept_head') return 'Dept Head'
    if (role === 'admin') return 'Admin'
    return 'Employee'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Users</h2>
            <p className="text-slate-500 text-sm mt-1">Manage all platform users</p>
          </div>
          <Button onClick={() => window.location.href = '/register'}>
            + Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
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
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Department</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Role</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={user.id} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-2 px-3 font-medium">{user.name}</td>
                      <td className="py-2 px-3 text-slate-500">{user.email}</td>
                      <td className="py-2 px-3 text-slate-500">{user.department || '—'}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={formatRole(user.role)}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="employee">Employee</option>
                          <option value="dept_head">Dept Head</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
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