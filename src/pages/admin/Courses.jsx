import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', duration_hours: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('courses').insert({
      title: form.title,
      description: form.description,
      duration_hours: parseInt(form.duration_hours),
      created_by: user.id,
      status: 'published',
    })

    if (error) { setError(error.message); setSaving(false); return }

    setForm({ title: '', description: '', duration_hours: '' })
    setShowForm(false)
    fetchCourses()
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return
    await supabase.from('courses').delete().eq('id', id)
    fetchCourses()
  }

  const toggleStatus = async (course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published'
    await supabase.from('courses').update({ status: newStatus }).eq('id', course.id)
    fetchCourses()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Courses</h2>
            <p className="text-slate-500 text-sm mt-1">Manage training courses</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Course'}
          </Button>
        </div>

        {/* Create course form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Course Title</Label>
                  <Input name="title" placeholder="e.g. Onboarding Fundamentals" value={form.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    name="description"
                    placeholder="What will employees learn?"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <Input name="duration_hours" type="number" placeholder="e.g. 8" value={form.duration_hours} onChange={handleChange} required />
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Course'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Courses list */}
        <Card>
          <CardHeader>
            <CardTitle>All Courses ({courses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : courses.length === 0 ? (
              <p className="text-slate-500 text-sm">No courses yet. Create one above!</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Title</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Duration</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, i) => (
                    <tr key={course.id} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-2 px-3">
                        <div className="font-medium">{course.title}</div>
                        <div className="text-slate-400 text-xs">{course.description?.substring(0, 60)}...</div>
                      </td>
                      <td className="py-2 px-3 text-slate-500">{course.duration_hours}h</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleStatus(course)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {course.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
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