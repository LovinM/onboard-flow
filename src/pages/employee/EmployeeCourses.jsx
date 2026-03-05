import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function EmployeeCourses() {
  const { profile } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) fetchEnrollments()
  }, [profile])

  const fetchEnrollments = async () => {
    const { data } = await supabase
      .from('enrollments')
      .select(`*, courses(id, title, description, duration_hours)`)
      .eq('user_id', profile.id)
      .order('enrolled_at', { ascending: false })
    setEnrollments(data || [])
    setLoading(false)
  }

  const updateProgress = async (enrollmentId, courseId, currentProgress) => {
    const newProgress = Math.min(currentProgress + 20, 100)
    const isCompleted = newProgress === 100

    const { error: updateError } = await supabase.from('enrollments').update({
      progress_pct: newProgress,
      status: isCompleted ? 'completed' : 'in_progress',
      completed_at: isCompleted ? new Date().toISOString() : null,
    }).eq('id', enrollmentId)

    if (updateError) { console.error('Enrollment update error:', updateError); return }

    if (isCompleted) {
      const { error: certError } = await supabase.from('certificates').insert({
        user_id: profile.id,
        course_id: courseId,
      })
      if (certError) console.error('Certificate insert error:', certError)
    }

    fetchEnrollments()
  }

  const statusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'in_progress') return 'bg-blue-100 text-blue-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Courses</h2>
          <p className="text-slate-500 text-sm mt-1">All your enrolled courses</p>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : enrollments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-500 text-sm">You are not enrolled in any courses yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {enrollments.map((e) => (
              <Card key={e.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-800 text-lg">{e.courses?.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(e.status)}`}>
                          {e.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mb-4">{e.courses?.description}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500">Duration: {e.courses?.duration_hours}h</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">Progress: {e.progress_pct}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${e.progress_pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500 w-10">{e.progress_pct}%</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      {e.status === 'completed' ? (
                        <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                      ) : (
                        <Button
                          onClick={() => updateProgress(e.id, e.courses?.id, e.progress_pct)}
                        >
                          {e.progress_pct === 0 ? 'Start Course' : 'Continue'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}