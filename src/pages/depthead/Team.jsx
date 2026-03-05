import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function Team() {
  const { profile } = useAuth()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) fetchTeam()
  }, [profile])

  const fetchTeam = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', profile.department)
      .eq('role', 'employee')
    setTeam(data || [])
    setLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Team</h2>
          <p className="text-slate-500 text-sm mt-1">{profile?.department} department members</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({team.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : team.length === 0 ? (
              <p className="text-slate-500 text-sm">No employees in your department yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Name</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Email</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Department</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((member, i) => (
                    <tr key={member.id} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-2 px-3 font-medium">{member.name}</td>
                      <td className="py-2 px-3 text-slate-500">{member.email}</td>
                      <td className="py-2 px-3 text-slate-500">{member.department}</td>
                      <td className="py-2 px-3 text-slate-500">
                        {new Date(member.created_at).toLocaleDateString()}
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