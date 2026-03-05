import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function DeptHeadDashboard() {
  const { profile } = useAuth()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) fetchTeam()
  }, [profile])

  const fetchTeam = async () => {
    const { data: members } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', profile.department)
      .eq('role', 'employee')

    if (!members || members.length === 0) {
      setTeam([])
      setLoading(false)
      return
    }

    const memberIds = members.map(m => m.id)

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, courses(title)')
      .in('user_id', memberIds)

    const { data: certificates } = await supabase
      .from('certificates')
      .select('*')
      .in('user_id', memberIds)

    const teamWithStats = members.map(member => {
      const memberEnrollments = enrollments?.filter(e => e.user_id === member.id) || []
      const memberCerts = certificates?.filter(c => c.user_id === member.id) || []
      const avgProgress = memberEnrollments.length > 0
        ? Math.round(memberEnrollments.reduce((sum, e) => sum + e.progress_pct, 0) / memberEnrollments.length)
        : 0

      return {
        ...member,
        enrollments: memberEnrollments,
        certificates: memberCerts,
        avgProgress,
        completed: memberEnrollments.filter(e => e.status === 'completed').length,
        total: memberEnrollments.length,
      }
    })

    setTeam(teamWithStats)
    setLoading(false)
  }

  const stats = {
    members: team.length,
    avgProgress: team.length > 0
      ? Math.round(team.reduce((sum, m) => sum + m.avgProgress, 0) / team.length)
      : 0,
    completed: team.reduce((sum, m) => sum + m.completed, 0),
    atRisk: team.filter(m => m.avgProgress < 20 && m.total > 0).length,
  }

  const progressColor = (pct) => {
    if (pct >= 80) return 'bg-green-500'
    if (pct >= 40) return 'bg-blue-500'
    if (pct >= 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const statusBadge = (pct, total) => {
    if (total === 0) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">No courses</span>
    if (pct === 100) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Done</span>
    if (pct >= 80) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">On Track</span>
    if (pct >= 40) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Active</span>
    if (pct >= 20) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Behind</span>
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">At Risk</span>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Team Overview</h2>
          <p className="text-slate-500 text-sm mt-1">{profile?.department} department</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Team Members', value: stats.members, color: 'text-blue-600' },
            { label: 'Avg. Progress', value: `${stats.avgProgress}%`, color: 'text-purple-600' },
            { label: 'Completions', value: stats.completed, color: 'text-green-600' },
            { label: 'At Risk', value: stats.atRisk, color: 'text-red-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team progress */}
        <Card>
          <CardHeader>
            <CardTitle>Team Training Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : team.length === 0 ? (
              <p className="text-slate-500 text-sm">No employees in your department yet.</p>
            ) : (
              <div className="space-y-4">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center gap-4">
                    <div className="w-32 flex-shrink-0">
                      <div className="font-medium text-sm text-slate-800">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.total} course{member.total !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-slate-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${progressColor(member.avgProgress)}`}
                            style={{ width: `${member.avgProgress}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500 w-10">{member.avgProgress}%</span>
                      </div>
                    </div>
                    <div className="w-24 flex-shrink-0">
                      {statusBadge(member.avgProgress, member.total)}
                    </div>
                    <div className="w-24 flex-shrink-0 text-xs text-slate-400">
                      {member.completed}/{member.total} done
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed table */}
        <Card>
          <CardHeader>
            <CardTitle>Course Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : team.length === 0 ? (
              <p className="text-slate-500 text-sm">No data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Employee</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Course</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Progress</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.flatMap(member =>
                    member.enrollments.length > 0
                      ? member.enrollments.map((e, i) => (
                          <tr key={e.id} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                            <td className="py-2 px-3 font-medium">{member.name}</td>
                            <td className="py-2 px-3 text-slate-500">{e.courses?.title}</td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${e.progress_pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">{e.progress_pct}%</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                e.status === 'completed' ? 'bg-green-100 text-green-700' :
                                e.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {e.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      : [(
                          <tr key={member.id}>
                            <td className="py-2 px-3 font-medium">{member.name}</td>
                            <td className="py-2 px-3 text-slate-400" colSpan={3}>No enrollments</td>
                          </tr>
                        )]
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}