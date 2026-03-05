import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ user_id: '', course_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const [enrollRes, userRes, courseRes] = await Promise.all([
      supabase.from('enrollments').select(`
        *,
        profiles(name, email),
        courses(title)
      `).order('enrolled_at', { ascending: false }),
      supabase.from('profiles').select('id, name, email').eq('role', 'employee'),
      supabase.from('courses').select('id, title').eq('status', 'published'),
    ])
    setEnrollments(enrollRes.data || [])
    setUsers(userRes.data || [])
    setCourses(courseRes.data || [])
    setLoading(false)
  }

  const handleEnroll = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error } = await supabase.from('enrollments').insert({
      user_id: form.user_id,
      course_id: form.course_id,
      status: 'enrolled',
      progress_pct: 0,
    })

    if (error) { setError(error.message); setSaving(false); return }

    setForm({ user_id: '', course_id: '' })
    setShowForm(false)
    fetchAll()
    setSaving(false)
  }

  const statusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'in_progress') return 'bg-blue-100 text-blue-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Enrollments</h2>
            <p className="text-slate-500 text-sm mt-1">Manage course enrollments</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Enroll User'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Enroll a User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEnroll} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Employee</label>
                  <select
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    required
                  >
                    <option value="">-- Select Employee --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Course</label>
                  <select
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enrolling...' : 'Enroll'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Enrollments ({enrollments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : enrollments.length === 0 ? (
              <p className="text-slate-500 text-sm">No enrollments yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Employee</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Course</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Progress</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e, i) => (
                    <tr key={e.id} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-2 px-3">
                        <div className="font-medium">{e.profiles?.name}</div>
                        <div className="text-slate-400 text-xs">{e.profiles?.email}</div>
                      </td>
                      <td className="py-2 px-3">{e.courses?.title}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${e.progress_pct}%` }}
                            />
                          </div>
                          <span className="text-slate-500 text-xs">{e.progress_pct}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(e.status)}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {new Date(e.enrolled_at).toLocaleDateString()}
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