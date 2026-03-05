import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function Reports() {
  const { profile } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) fetchReport()
  }, [profile])

  const fetchReport = async () => {
    const { data: members } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', profile.department)
      .eq('role', 'employee')

    if (!members || members.length === 0) {
      setData([])
      setLoading(false)
      return
    }

    const memberIds = members.map(m => m.id)

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, courses(title)')
      .in('user_id', memberIds)

    const { data: certs } = await supabase
      .from('certificates')
      .select('*')
      .in('user_id', memberIds)

    const { data: feedbacks } = await supabase
      .from('feedback')
      .select('*, courses(title)')
      .in('user_id', memberIds)

    const report = members.map(member => {
      const memberEnrollments = enrollments?.filter(e => e.user_id === member.id) || []
      const memberCerts = certs?.filter(c => c.user_id === member.id) || []
      const memberFeedback = feedbacks?.filter(f => f.user_id === member.id) || []
      const avgProgress = memberEnrollments.length > 0
        ? Math.round(memberEnrollments.reduce((sum, e) => sum + e.progress_pct, 0) / memberEnrollments.length)
        : 0
      const avgRating = memberFeedback.length > 0
        ? (memberFeedback.reduce((sum, f) => sum + f.rating, 0) / memberFeedback.length).toFixed(1)
        : 'N/A'

      return {
        ...member,
        totalEnrolled: memberEnrollments.length,
        completed: memberEnrollments.filter(e => e.status === 'completed').length,
        inProgress: memberEnrollments.filter(e => e.status === 'in_progress').length,
        certificates: memberCerts.length,
        avgProgress,
        avgRating,
      }
    })

    setData(report)
    setLoading(false)
  }

  const totalStats = {
    enrolled: data.reduce((sum, m) => sum + m.totalEnrolled, 0),
    completed: data.reduce((sum, m) => sum + m.completed, 0),
    certificates: data.reduce((sum, m) => sum + m.certificates, 0),
    avgProgress: data.length > 0
      ? Math.round(data.reduce((sum, m) => sum + m.avgProgress, 0) / data.length)
      : 0,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Department Reports</h2>
            <p className="text-slate-500 text-sm mt-1">{profile?.department} training summary</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Enrollments', value: totalStats.enrolled, color: 'text-blue-600' },
            { label: 'Completions', value: totalStats.completed, color: 'text-green-600' },
            { label: 'Certificates Issued', value: totalStats.certificates, color: 'text-orange-600' },
            { label: 'Avg. Progress', value: `${totalStats.avgProgress}%`, color: 'text-purple-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Per employee report */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Training Report</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : data.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Employee</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Enrolled</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Completed</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">In Progress</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Certificates</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Avg Progress</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((member, i) => (
                    <tr key={member.id} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-2 px-3">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-slate-400">{member.email}</div>
                      </td>
                      <td className="py-2 px-3 text-slate-500">{member.totalEnrolled}</td>
                      <td className="py-2 px-3">
                        <span className="text-green-600 font-medium">{member.completed}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-blue-600 font-medium">{member.inProgress}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-orange-600 font-medium">{member.certificates}</span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${member.avgProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{member.avgProgress}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-yellow-600 font-medium">
                          {member.avgRating !== 'N/A' ? `⭐ ${member.avgRating}` : '—'}
                        </span>
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