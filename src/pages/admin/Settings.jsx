import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export default function Settings() {
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .single()
    setOrgName(data?.organization_name || 'OnboardFlow')
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const { error } = await supabase
      .from('settings')
      .update({ organization_name: orgName, updated_at: new Date().toISOString() })
      .eq('id', (await supabase.from('settings').select('id').single()).data.id)

    if (error) { setError(error.message); setSaving(false); return }

    setSuccess('Settings saved successfully!')
    setSaving(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage platform settings</p>
        </div>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. USIU-Africa"
                    required
                  />
                  <p className="text-xs text-slate-400">
                    This name will appear on all certificates issued by the platform.
                  </p>
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}
                {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">✓ {success}</div>}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}