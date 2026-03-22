'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Bell, BellOff, Briefcase, Shield, Pencil, Check } from 'lucide-react'

interface ProfilPageClientProps {
  profile: any
  email: string
  achievements: any[]
}

export function ProfilPageClient({ profile, email, achievements }: ProfilPageClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [notifications, setNotifications] = useState(profile.notifications_enabled ?? true)
  const [workMode, setWorkMode] = useState(profile.work_mode ?? false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldValues, setFieldValues] = useState({
    display_name: profile.display_name || '',
    pseudonym: profile.pseudonym || '',
    motto: profile.motto || '',
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const saveField = async (field: string) => {
    await supabase
      .from('profiles')
      .update({ [field]: fieldValues[field as keyof typeof fieldValues] })
      .eq('id', profile.id)
    setEditingField(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-8">
      {/* Player name */}
      <div className="text-center space-y-2">
        <EditableText
          value={fieldValues.display_name}
          isEditing={editingField === 'display_name'}
          onStartEdit={() => setEditingField('display_name')}
          onChange={(v) => setFieldValues((prev) => ({ ...prev, display_name: v }))}
          onSave={() => saveField('display_name')}
          className="font-cinzel text-2xl text-cream font-bold"
        />
        <p className="font-medieval text-[11px] text-cream/25">Niveau {profile.current_level || 1}</p>
      </div>

      {/* Personal info */}
      <div className="space-y-3">
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
          Informations personnelles
        </p>

        <div className="space-y-1">
          <InfoRow label="Email" value={email} />
          <InfoRow label="Mot de passe" value="••••••••" action="Modifier" />

          <div className="space-y-1.5 py-3 border-b border-cream/[0.04]">
            <label className="font-lora text-[12px] text-cream/25">Pseudonyme</label>
            <EditableText
              value={fieldValues.pseudonym}
              placeholder="Votre pseudonyme"
              isEditing={editingField === 'pseudonym'}
              onStartEdit={() => setEditingField('pseudonym')}
              onChange={(v) => setFieldValues((prev) => ({ ...prev, pseudonym: v }))}
              onSave={() => saveField('pseudonym')}
              className="font-cinzel text-[14px] text-cream/60"
            />
          </div>

          <div className="space-y-1.5 py-3 border-b border-cream/[0.04]">
            <label className="font-lora text-[12px] text-cream/25">Devise</label>
            <EditableText
              value={fieldValues.motto}
              placeholder="Votre devise"
              isEditing={editingField === 'motto'}
              onStartEdit={() => setEditingField('motto')}
              onChange={(v) => setFieldValues((prev) => ({ ...prev, motto: v }))}
              onSave={() => saveField('motto')}
              className="font-lora text-[14px] text-cream/50 italic"
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
          Preferences
        </p>

        <ToggleRow
          icon={notifications ? Bell : BellOff}
          label="Notifications"
          description="Recevoir des rappels de quetes"
          value={notifications}
          onChange={() => setNotifications(!notifications)}
        />

        <ToggleRow
          icon={Briefcase}
          label="Mode travail"
          description="Adapter les horaires de quetes"
          value={workMode}
          onChange={() => setWorkMode(!workMode)}
        />
      </div>

      {/* Blason */}
      <div className="space-y-3">
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
          Blason
        </p>
        <div className="flex items-center gap-4 p-4 bg-cream/[0.03] rounded-xl border border-cream/[0.06]">
          {/* Blason preview */}
          <div className="w-20 h-24 rounded-lg bg-cream/[0.06] border border-cream/[0.08] flex items-center justify-center">
            <Shield size={32} className="text-yellow/40" />
          </div>
          <div className="flex-1">
            <p className="font-cinzel text-[14px] text-cream/60">Votre blason</p>
            <p className="font-lora text-[12px] text-cream/25 mt-0.5">
              Personnalisez couleurs et emblemes
            </p>
            <p className="font-medieval text-[10px] text-cream/15 mt-1">
              {achievements.length} embleme{achievements.length !== 1 ? 's' : ''} debloque{achievements.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
            Hauts faits
          </p>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((a) => {
              const achievement = a.achievements as any
              return (
                <div
                  key={a.id}
                  className="flex flex-col items-center gap-1 p-3 bg-cream/[0.03] rounded-xl border border-cream/[0.06]"
                >
                  <span className="text-xl">{achievement?.emoji || '🏅'}</span>
                  <span className="font-medieval text-[10px] text-cream/40 text-center leading-tight">
                    {achievement?.name || 'Haut fait'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red/[0.08] border border-red/[0.12] text-red/50 font-cinzel text-[14px] hover:bg-red/[0.15] transition-colors"
      >
        <LogOut size={16} />
        Deconnexion
      </button>
    </div>
  )
}

function EditableText({
  value,
  placeholder,
  isEditing,
  onStartEdit,
  onChange,
  onSave,
  className = '',
}: {
  value: string
  placeholder?: string
  isEditing: boolean
  onStartEdit: () => void
  onChange: (v: string) => void
  onSave: () => void
  className?: string
}) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          className={`flex-1 bg-cream/[0.04] border border-cream/[0.08] rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow/30 ${className}`}
        />
        <button onClick={onSave} className="p-1.5 rounded-lg hover:bg-cream/[0.06]">
          <Check size={14} className="text-green/60" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group cursor-pointer" onClick={onStartEdit}>
      <span className={`${className} ${!value ? 'text-cream/20' : ''}`}>
        {value || placeholder || 'Non defini'}
      </span>
      <Pencil size={12} className="text-cream/15 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

function InfoRow({ label, value, action }: { label: string; value: string; action?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-cream/[0.04]">
      <div>
        <p className="font-lora text-[12px] text-cream/25">{label}</p>
        <p className="font-cinzel text-[14px] text-cream/60">{value}</p>
      </div>
      {action && (
        <button className="font-medieval text-[11px] text-yellow/50 hover:text-yellow/70 transition-colors">
          {action}
        </button>
      )}
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: any
  label: string
  description: string
  value: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-cream/[0.04]">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-cream/30" />
        <div>
          <p className="font-cinzel text-[13px] text-cream/60">{label}</p>
          <p className="font-lora text-[11px] text-cream/20">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-10 h-5 rounded-full transition-colors duration-200 ${
          value ? 'bg-yellow/60' : 'bg-cream/10'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-cream shadow transition-transform duration-200 ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
