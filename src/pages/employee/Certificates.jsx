import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function Certificates() {
  const { profile } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) fetchCertificates()
  }, [profile])

  const fetchCertificates = async () => {
    const { data } = await supabase
      .from('certificates')
      .select(`*, courses(title, duration_hours)`)
      .eq('user_id', profile.id)
      .order('issued_at', { ascending: false })
    setCertificates(data || [])
    setLoading(false)
  }

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
          <div class="name">${profile.name}</div>
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
    a.download = `Certificate_${cert.courses?.title.replace(/ /g, '_')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Certificates</h2>
          <p className="text-slate-500 text-sm mt-1">Certificates earned from completed courses</p>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-500 text-sm">No certificates yet. Complete a course to earn one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs text-center leading-tight">
                        USIU<br/>SEAL
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{cert.courses?.title}</h3>
                        <p className="text-slate-500 text-sm">
                          Duration: {cert.courses?.duration_hours} hours
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          Issued: {new Date(cert.issued_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleDownload(cert)}>
                        ⬇ Download
                      </Button>
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