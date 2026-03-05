import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    const { data } = await supabase
      .from('certificates')
      .select(`*, profiles(name, email, department), courses(title, duration_hours)`)
      .order('issued_at', { ascending: false })
    setCertificates(data || [])
    setLoading(false)
  }

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this certificate? This cannot be undone.')) return
    await supabase.from('certificates').delete().eq('id', id)
    fetchCertificates()
  }

  const filtered = certificates.filter(c =>
    c.profiles?.name.toLowerCase().includes(search.toLowerCase()) ||
    c.courses?.title.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.department?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDownload = async (cert) => {
    const { data: settings } = await supabase
      .from('settings')
      .select('organization_name')
      .single()

    const orgName = settings?.organization_name || 'OnboardFlow'

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f0; }
          .cert { background: white; border: 3px solid #1E3A5F; padding: 60px; width: 700px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
          .header { background: #1E3A5F; color: white; padding: 16px; margin: -60px -60px 40px; letter-spacing: 3px; font-size: 13px; }
          .org { color: #2D7DD2; font-size: 14px; margin-bottom: 30px; }
          .certifies { color: #888; font-size: 14px; }
          .name { font-size: 36px; color: #1E3A5F; margin: 10px 0; font-weight: bold; }
          .divider { border: 1px solid #ddd; margin: 16px 0; }
          .course { font-size: 22px; color: #2D7DD2; font-weight: bold; margin: 10px 0; }
          .date { color: #888; font-size: 13px; margin-top: 20px; }
          .seal { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #2D7DD2; display: flex; align-items: center; justify-content: center; margin: 20px auto; color: #2D7DD2; font-size: 11px; font-weight: bold; line-height: 1.4; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="header">CERTIFICATE OF COMPLETION</div>
          <div class="org">${orgName}</div>
          <div class="seal">OFFICIAL<br>SEAL</div>
          <div class="certifies">This certifies that</div>
          <div class="name">${cert.profiles?.name}</div>
          <div class="divider"></div>
          <div class="certifies">has successfully completed</div>
          <div class="course">${cert.courses?.title}</div>
          <div class="date">
            Duration: ${cert.courses?.duration_hours} hours &nbsp;|&nbsp;
            Issued: ${new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </body>
      </html>
    `
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Certificate_${cert.profiles?.name.replace(/ /g, '_')}_${cert.courses?.title.replace(/ /g, '_')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Certificates</h2>
            <p className="text-slate-500 text-sm mt-1">All issued certificates</p>
          </div>
          <div className="text-sm text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-md">
            Total: {certificates.length}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by employee, course or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />

        <Card>
          <CardHeader>
            <CardTitle>Issued Certificates ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-slate-500 text-sm">No certificates found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Employee</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Course</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Department</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Issued</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cert, i) => (
                    <tr key={cert.id} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-2 px-3">
                        <div className="font-medium">{cert.profiles?.name}</div>
                        <div className="text-xs text-slate-400">{cert.profiles?.email}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div>{cert.courses?.title}</div>
                        <div className="text-xs text-slate-400">{cert.courses?.duration_hours}h</div>
                      </td>
                      <td className="py-2 px-3 text-slate-500">{cert.profiles?.department || '—'}</td>
                      <td className="py-2 px-3 text-slate-500">
                        {new Date(cert.issued_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDownload(cert)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleRevoke(cert.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Revoke
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