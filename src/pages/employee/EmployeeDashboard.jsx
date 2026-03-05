import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function EmployeeDashboard() {
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
  

  const stats = {
    enrolled: enrollments.length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    inProgress: enrollments.filter(e => e.status === 'in_progress').length,
    certificates: enrollments.filter(e => e.status === 'completed').length,
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
          <h2 className="text-2xl font-bold text-slate-800">Welcome, {profile?.name} 👋</h2>
          <p className="text-slate-500 text-sm mt-1">Here's your learning progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Enrolled', value: stats.enrolled, color: 'text-blue-600' },
            { label: 'Completed', value: stats.completed, color: 'text-green-600' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-purple-600' },
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

        {/* Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : enrollments.length === 0 ? (
              <p className="text-slate-500 text-sm">You are not enrolled in any courses yet.</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((e) => (
                  <div key={e.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-800">{e.courses?.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(e.status)}`}>
                            {e.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm mb-3">{e.courses?.description}</p>
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
                      <div className="ml-4">
                        {e.status === 'completed' ? (
                          <span className="text-green-600 text-sm font-medium">✓ Done</span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => updateProgress(e.id, e.courses?.id, e.progress_pct)}
                          >
                            {e.progress_pct === 0 ? 'Start' : 'Continue'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}