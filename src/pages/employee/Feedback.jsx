import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function Feedback() {
  const { profile } = useAuth()
  const [completedCourses, setCompletedCourses] = useState([])
  const [feedbackGiven, setFeedbackGiven] = useState([])
  const [form, setForm] = useState({ course_id: '', rating: 5, comments: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) fetchData()
  }, [profile])

  const fetchData = async () => {
    const [enrollRes, feedRes] = await Promise.all([
      supabase.from('enrollments')
        .select('*, courses(id, title)')
        .eq('user_id', profile.id)
        .eq('status', 'completed'),
      supabase.from('feedback')
        .select('course_id')
        .eq('user_id', profile.id),
    ])
    setCompletedCourses(enrollRes.data || [])
    setFeedbackGiven(feedRes.data?.map(f => f.course_id) || [])
  }

  const pendingCourses = completedCourses.filter(e => !feedbackGiven.includes(e.courses?.id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.from('feedback').insert({
      user_id: profile.id,
      course_id: form.course_id,
      rating: form.rating,
      comments: form.comments,
    })

    if (error) { setError(error.message); setSaving(false); return }

    setSuccess('Feedback submitted successfully!')
    setForm({ course_id: '', rating: 5, comments: '' })
    fetchData()
    setSaving(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Course Feedback</h2>
          <p className="text-slate-500 text-sm mt-1">Rate courses you have completed</p>
        </div>

        {pendingCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Course</label>
                  <select
                    value={form.course_id}
                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    required
                  >
                    <option value="">-- Select a completed course --</option>
                    {pendingCourses.map((e) => (
                      <option key={e.courses?.id} value={e.courses?.id}>
                        {e.courses?.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Rating: {form.rating} / 5
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className={`text-2xl ${star <= form.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Comments</label>
                  <textarea
                    value={form.comments}
                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    placeholder="Share your thoughts about this course..."
                    rows={4}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}
                {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">{success}</div>}

                <Button type="submit" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {pendingCourses.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-500 text-sm">
                {completedCourses.length === 0
                  ? 'Complete a course first to leave feedback!'
                  : '✓ You have submitted feedback for all completed courses!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}