import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { HeartPulse, Phone, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'

interface PublicEmergencyData {
  blood_group?: string
  allergies?: string[]
  medical_conditions?: string[]
  medications?: string[]
  emergency_contacts?: { name: string; relationship: string; phone: string }[]
}

export default function EmergencyPublicPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<PublicEmergencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    supabase
      .rpc('get_emergency_profile_by_token' as never, { token } as never)
      .then(({ data: result, error }) => {
        if (error || !result) setNotFound(true)
        else setData(result as PublicEmergencyData)
        setLoading(false)
      })
  }, [token])

  if (loading) return <LoadingSpinner className="min-h-screen" />

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h1 className="text-xl font-bold">Profile not found</h1>
          <p className="mt-2 text-sm text-slate-500">This emergency profile link is invalid or expired.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:from-slate-950 dark:to-red-950/20">
      <div className="mx-auto max-w-lg py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <HeartPulse className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 dark:text-red-400">Emergency Profile</h1>
          <p className="mt-1 text-sm text-slate-500">LifeVault · Critical medical information</p>
        </div>

        <div className="space-y-4">
          {data?.blood_group && (
            <Card className="border-red-200/50">
              <p className="text-xs font-medium uppercase text-slate-500">Blood group</p>
              <p className="text-2xl font-bold text-red-600">{data.blood_group}</p>
            </Card>
          )}

          {data?.allergies && data.allergies.length > 0 && (
            <Card>
              <p className="mb-2 text-xs font-medium uppercase text-slate-500">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {data.allergies.map((a) => (
                  <span key={a} className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                    {a}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {data?.medical_conditions && data.medical_conditions.length > 0 && (
            <Card>
              <p className="mb-2 text-xs font-medium uppercase text-slate-500">Medical conditions</p>
              <ul className="list-inside list-disc text-sm">
                {data.medical_conditions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Card>
          )}

          {data?.medications && data.medications.length > 0 && (
            <Card>
              <p className="mb-2 text-xs font-medium uppercase text-slate-500">Medications</p>
              <ul className="list-inside list-disc text-sm">
                {data.medications.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </Card>
          )}

          {data?.emergency_contacts && data.emergency_contacts.length > 0 && (
            <Card>
              <p className="mb-3 text-xs font-medium uppercase text-slate-500">Emergency contacts</p>
              <div className="space-y-3">
                {data.emergency_contacts.map((c) => (
                  <a
                    key={c.phone}
                    href={`tel:${c.phone}`}
                    className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-3 transition hover:bg-emerald-500/20"
                  >
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-slate-500">{c.relationship}</p>
                    </div>
                    <span className="ml-auto font-mono text-sm text-emerald-600">{c.phone}</span>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Powered by LifeVault · Information shared by account owner
        </p>
      </div>
    </div>
  )
}
