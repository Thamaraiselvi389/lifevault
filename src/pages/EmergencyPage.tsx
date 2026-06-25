import { useEffect, useState } from 'react'
import { HeartPulse, Plus, QrCode, Save } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PageHeader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { EmergencyContact, EmergencyProfile } from '@/types/database'
import toast from 'react-hot-toast'

const FIELD_OPTIONS = [
  { id: 'blood_group', label: 'Blood group' },
  { id: 'allergies', label: 'Allergies' },
  { id: 'medical_conditions', label: 'Medical conditions' },
  { id: 'medications', label: 'Medications' },
  { id: 'emergency_contacts', label: 'Emergency contacts' },
]

export default function EmergencyPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<EmergencyProfile | null>(null)
  const [form, setForm] = useState({
    blood_group: '',
    allergies: '',
    medical_conditions: '',
    medications: '',
    emergency_contacts: [] as EmergencyContact[],
    qr_visible_fields: ['blood_group', 'allergies', 'emergency_contacts'] as string[],
  })
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' })

  useEffect(() => {
    if (!user) return
    supabase
      .from('emergency_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as EmergencyProfile | null
        if (row) {
          setProfile(row)
          setForm({
            blood_group: row.blood_group || '',
            allergies: (row.allergies || []).join(', '),
            medical_conditions: (row.medical_conditions || []).join(', '),
            medications: (row.medications || []).join(', '),
            emergency_contacts: row.emergency_contacts || [],
            qr_visible_fields: row.qr_visible_fields || ['blood_group', 'allergies', 'emergency_contacts'],
          })
        }
        setLoading(false)
      })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      blood_group: form.blood_group || null,
      allergies: form.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      medical_conditions: form.medical_conditions.split(',').map((s) => s.trim()).filter(Boolean),
      medications: form.medications.split(',').map((s) => s.trim()).filter(Boolean),
      emergency_contacts: form.emergency_contacts,
      qr_visible_fields: form.qr_visible_fields,
    }

    const { data, error } = profile
      ? await supabase.from('emergency_profiles').update(payload as never).eq('id', profile.id).select().single()
      : await supabase.from('emergency_profiles').insert(payload as never).select().single()

    setSaving(false)
    if (error) toast.error(error.message)
    else {
      setProfile(data as EmergencyProfile)
      toast.success('Emergency profile saved')
    }
  }

  const addContact = () => {
    if (!newContact.name || !newContact.phone) return
    setForm({
      ...form,
      emergency_contacts: [...form.emergency_contacts, newContact],
    })
    setNewContact({ name: '', relationship: '', phone: '' })
  }

  const toggleField = (fieldId: string) => {
    setForm((f) => ({
      ...f,
      qr_visible_fields: f.qr_visible_fields.includes(fieldId)
        ? f.qr_visible_fields.filter((x) => x !== fieldId)
        : [...f.qr_visible_fields, fieldId],
    }))
  }

  const qrUrl = profile
    ? `${window.location.origin}/emergency/${profile.public_token}`
    : ''

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Emergency Profile"
        subtitle="Medical info and emergency contacts — share via QR in emergencies"
        action={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save profile'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h3 className="mb-4 font-semibold">Medical information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Blood group" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} placeholder="e.g. O+" />
              <Input label="Allergies (comma-separated)" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Peanuts, Penicillin" />
              <Input label="Medical conditions" value={form.medical_conditions} onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })} />
              <Input label="Medications" value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold">Emergency contacts</h3>
            <div className="mb-4 space-y-2">
              {form.emergency_contacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-white/40 p-3 dark:bg-slate-800/40">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.relationship} · {c.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        emergency_contacts: form.emergency_contacts.filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
              <Input placeholder="Relationship" value={newContact.relationship} onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} />
              <Input placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
            </div>
            <Button variant="secondary" className="mt-3" onClick={addContact}>
              <Plus className="h-4 w-4" /> Add contact
            </Button>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold">QR code visible fields</h3>
            <p className="mb-4 text-sm text-slate-500">Choose which fields appear on the public emergency page</p>
            <div className="flex flex-wrap gap-2">
              {FIELD_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => toggleField(f.id)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    form.qr_visible_fields.includes(f.id)
                      ? 'bg-vault-500 text-white'
                      : 'bg-slate-200/60 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="flex flex-col items-center text-center">
          <HeartPulse className="mb-4 h-10 w-10 text-red-500" />
          <h3 className="mb-2 font-semibold">Emergency QR Code</h3>
          <p className="mb-6 text-sm text-slate-500">
            Scan to view approved emergency information — no login required
          </p>
          {profile ? (
            <>
              <div className="rounded-2xl bg-white p-4 shadow-inner">
                <QRCodeSVG value={qrUrl} size={180} level="M" />
              </div>
              <p className="mt-4 break-all text-xs text-slate-400">{qrUrl}</p>
              <Button variant="secondary" className="mt-4" onClick={() => window.open(qrUrl, '_blank')}>
                <QrCode className="h-4 w-4" /> Preview page
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-500">Save your profile to generate a QR code</p>
          )}
        </Card>
      </div>
    </div>
  )
}
