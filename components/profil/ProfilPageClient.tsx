'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Bell, BellOff, Briefcase, Shield, Pencil, Check, Swords, CalendarDays, ScrollText } from 'lucide-react'
import Link from 'next/link'

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
      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgb(var(--deep-blue)/0.92) 0%, rgb(var(--primary)/0.1) 100%)',
        border: '1px solid rgb(var(--primary)/0.2)',
      }}>
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full opacity-30"
            style={{ background: 'rgb(var(--character-glow))', filter: 'blur(48px)' }} />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'rgb(var(--primary))', filter: 'blur(32px)' }} />
        </div>
        <div className="relative z-10 pt-8 pb-6 px-6 text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center font-serif text-xl font-bold mb-3"
            style={{
              background: 'rgb(var(--primary)/0.15)',
              border: '2px solid rgb(var(--primary)/0.35)',
              color: 'rgb(var(--primary))',
            }}>
            {(fieldValues.display_name || 'A')[0].toUpperCase()}
          </div>
          <EditableText
            value={fieldValues.display_name}
            isEditing={editingField === 'display_name'}
            onStartEdit={() => setEditingField('display_name')}
            onChange={(v) => setFieldValues((prev) => ({ ...prev, display_name: v }))}
            onSave={() => saveField('display_name')}
            className="font-serif text-2xl text-foreground font-bold"
          />
          {fieldValues.pseudonym && (
            <p className="font-sans text-[12px] text-foreground/35 italic">&ldquo;{fieldValues.pseudonym}&rdquo;</p>
          )}
          <p className="font-sans text-[11px] text-foreground/30">
            Niveau {profile.current_level || 1} · {profile.total_points || 0} XP
          </p>
          {fieldValues.motto && (
            <p className="font-sans text-[11px] italic mt-1" style={{ color: 'rgb(var(--primary)/0.65)' }}>
              {fieldValues.motto}
            </p>
          )}
        </div>
      </div>

      {/* Personal info */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Informations personnelles
        </p>

        <div className="space-y-1">
          <InfoRow label="Email" value={email} />
          <InfoRow label="Mot de passe" value="••••••••" action="Modifier" />

          <div className="space-y-1.5 py-3 border-b border-border/40">
            <label className="font-sans text-[12px] text-foreground/25">Pseudonyme</label>
            <EditableText
              value={fieldValues.pseudonym}
              placeholder="Votre pseudonyme"
              isEditing={editingField === 'pseudonym'}
              onStartEdit={() => setEditingField('pseudonym')}
              onChange={(v) => setFieldValues((prev) => ({ ...prev, pseudonym: v }))}
              onSave={() => saveField('pseudonym')}
              className="font-sans font-semibold text-[14px] text-foreground/60"
            />
          </div>

          <div className="space-y-1.5 py-3 border-b border-border/40">
            <label className="font-sans text-[12px] text-foreground/25">Devise</label>
            <EditableText
              value={fieldValues.motto}
              placeholder="Votre devise"
              isEditing={editingField === 'motto'}
              onStartEdit={() => setEditingField('motto')}
              onChange={(v) => setFieldValues((prev) => ({ ...prev, motto: v }))}
              onSave={() => saveField('motto')}
              className="font-sans text-[14px] text-foreground/50 italic"
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Preferences
        </p>

        <ToggleRow
          icon={notifications ? Bell : BellOff}
          label="Notifications"
          description="Recevoir des rappels de quetes"
          value={notifications}
          onChange={async () => {
            const next = !notifications
            setNotifications(next)
            await supabase.from('profiles').update({ notifications_enabled: next }).eq('id', profile.id)
          }}
        />

        <ToggleRow
          icon={Briefcase}
          label="Mode travail"
          description="Adapter les horaires de quetes"
          value={workMode}
          onChange={async () => {
            const next = !workMode
            setWorkMode(next)
            await supabase.from('profiles').update({ work_mode: next }).eq('id', profile.id)
          }}
        />
      </div>

      {/* Blason */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Blason
        </p>
        <div className="flex items-center gap-4 p-4 bg-card/40 rounded-xl border border-border/60">
          {/* Blason preview */}
          <div className="w-20 h-24 rounded-lg bg-card/80 border border-border flex items-center justify-center">
            <Shield size={32} className="text-yellow/40" />
          </div>
          <div className="flex-1">
            <p className="font-sans font-semibold text-[14px] text-foreground/60">Votre blason</p>
            <p className="font-sans text-[12px] text-foreground/25 mt-0.5">
              Personnalisez couleurs et emblemes
            </p>
            <p className="font-sans text-[10px] text-foreground/15 mt-1">
              {achievements.length} embleme{achievements.length !== 1 ? 's' : ''} debloque{achievements.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
            Hauts faits
          </p>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((a) => {
              const achievement = a.achievements as any
              return (
                <div
                  key={a.id}
                  className="flex flex-col items-center gap-1 p-3 bg-card/40 rounded-xl border border-border/60"
                >
                  <span className="text-xl">{achievement?.emoji || '🏅'}</span>
                  <span className="font-sans text-[10px] text-foreground/40 text-center leading-tight">
                    {achievement?.name || 'Haut fait'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Statistiques
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-card/40 rounded-xl border border-border/60 text-center">
            <p className="font-serif text-2xl font-bold text-foreground">{profile.total_points || 0}</p>
            <p className="font-sans text-[10px] text-foreground/30">XP total</p>
          </div>
          <div className="p-3 bg-card/40 rounded-xl border border-border/60 text-center">
            <p className="font-serif text-2xl font-bold text-foreground">{profile.tasks_completed || 0}</p>
            <p className="font-sans text-[10px] text-foreground/30">Quetes</p>
          </div>
          <div className="p-3 bg-card/40 rounded-xl border border-border/60 text-center">
            <p className="font-serif text-2xl font-bold text-foreground">{profile.current_streak || 0}j</p>
            <p className="font-sans text-[10px] text-foreground/30">Serie</p>
          </div>
          <div className="p-3 bg-card/40 rounded-xl border border-border/60 text-center">
            <p className="font-serif text-2xl font-bold text-foreground">{profile.longest_streak || 0}j</p>
            <p className="font-sans text-[10px] text-foreground/30">Record</p>
          </div>
        </div>
      </div>

      {/* Raccourcis */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Raccourcis
        </p>
        <div className="space-y-1">
          <Link href="/characters">
            <div className="group flex items-center gap-3 py-3 border-b border-border/40 transition-colors">
              <Swords size={16} className="text-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <div>
                <p className="font-sans font-semibold text-[13px] text-foreground/60 group-hover:text-foreground transition-colors">Ma collection</p>
                <p className="font-sans text-[11px] text-foreground/20">Personnages collectes</p>
              </div>
            </div>
          </Link>
          <Link href="/tasks/schedule">
            <div className="group flex items-center gap-3 py-3 border-b border-border/40 transition-colors">
              <CalendarDays size={16} className="text-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <div>
                <p className="font-sans font-semibold text-[13px] text-foreground/60 group-hover:text-foreground transition-colors">Planning</p>
                <p className="font-sans text-[11px] text-foreground/20">Quetes de la semaine</p>
              </div>
            </div>
          </Link>
          <Link href="/tasks/history">
            <div className="group flex items-center gap-3 py-3 border-b border-border/40 transition-colors">
              <ScrollText size={16} className="text-foreground/30 group-hover:text-foreground/50 transition-colors" />
              <div>
                <p className="font-sans font-semibold text-[13px] text-foreground/60 group-hover:text-foreground transition-colors">Historique</p>
                <p className="font-sans text-[11px] text-foreground/20">Quetes passees</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red/[0.08] border border-red/[0.12] text-red/50 font-sans font-semibold text-[14px] hover:bg-red/[0.15] transition-colors"
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
          className={`flex-1 bg-card/60 border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow/30 ${className}`}
        />
        <button onClick={onSave} className="p-1.5 rounded-lg hover:bg-card/80">
          <Check size={14} className="text-green/60" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group cursor-pointer" onClick={onStartEdit}>
      <span className={`${className} ${!value ? 'text-foreground/20' : ''}`}>
        {value || placeholder || 'Non defini'}
      </span>
      <Pencil size={12} className="text-foreground/15 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

function InfoRow({ label, value, action }: { label: string; value: string; action?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40">
      <div>
        <p className="font-sans text-[12px] text-foreground/25">{label}</p>
        <p className="font-sans font-semibold text-[14px] text-foreground/60">{value}</p>
      </div>
      {action && (
        <button className="font-sans text-[11px] text-yellow/50 hover:text-yellow/70 transition-colors">
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
    <div className="flex items-center justify-between py-3 border-b border-border/40">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-foreground/30" />
        <div>
          <p className="font-sans font-semibold text-[13px] text-foreground/60">{label}</p>
          <p className="font-sans text-[11px] text-foreground/20">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`w-10 h-5 rounded-full transition-colors duration-200 ${
          value ? 'bg-yellow/60' : 'bg-foreground/10'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-foreground shadow transition-transform duration-200 ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
