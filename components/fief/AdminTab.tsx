'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Copy, Check, Eye, EyeOff } from 'lucide-react'

interface AdminTabProps {
  tasks: any[]
  members: any[]
  inviteCode: string
  isAdmin: boolean
  householdId: string
}

export function AdminTab({ tasks, members, inviteCode, isAdmin }: AdminTabProps) {
  const [vacationMode, setVacationMode] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>(
    Object.fromEntries(tasks.map((t) => [t.id, t.is_active]))
  )

  const supabase = createClient()

  const toggleTask = async (taskId: string) => {
    const newState = !taskStates[taskId]
    setTaskStates((prev) => ({ ...prev, [taskId]: newState }))

    await supabase
      .from('household_tasks')
      .update({ is_active: newState })
      .eq('id', taskId)
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Vacation mode */}
      <div className="flex items-center justify-between py-3 border-b border-border/60">
        <div>
          <p className="font-sans font-semibold text-[14px] text-foreground/70">Mode vacances</p>
          <p className="font-sans text-[11px] text-foreground/25">Suspendre toutes les quetes</p>
        </div>
        <button
          onClick={() => setVacationMode(!vacationMode)}
          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
            vacationMode ? 'bg-yellow/60' : 'bg-foreground/10'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-foreground shadow transition-transform duration-200 ${
              vacationMode ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Task management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
            Gestion des taches
          </p>
          {isAdmin && (
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow/[0.1] border border-yellow/20 text-yellow/70 font-sans text-[11px] hover:bg-yellow/[0.15] transition-colors">
              <Plus size={12} />
              Nouvelle
            </button>
          )}
        </div>

        <div className="space-y-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0"
            >
              {/* Toggle */}
              <button
                onClick={() => toggleTask(task.id)}
                className="flex-shrink-0"
                disabled={!isAdmin}
              >
                {taskStates[task.id] ? (
                  <Eye size={16} className="text-green/60" />
                ) : (
                  <EyeOff size={16} className="text-foreground/20" />
                )}
              </button>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className={`font-sans font-semibold text-[13px] leading-tight ${
                  taskStates[task.id] ? 'text-foreground/70' : 'text-foreground/25 line-through'
                }`}>
                  {task.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-sans text-[11px] text-foreground/20">
                    {task.categories?.emoji} {task.categories?.name}
                  </span>
                  <span className="font-sans text-[11px] text-foreground/15">
                    {task.frequencies?.label}
                  </span>
                </div>
              </div>

              {/* Points */}
              <span className="font-sans font-semibold text-[12px] text-yellow/40 flex-shrink-0">
                {task.points} or
              </span>
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="text-center font-sans text-[13px] text-foreground/30 py-6">
              Aucune quete configuree
            </p>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Membres
        </p>
        <div className="space-y-1">
          {members.map((member) => {
            const profile = member.profiles as any
            return (
              <div key={member.profile_id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  <span className="font-sans font-semibold text-[12px] text-foreground/40">
                    {(profile?.display_name || 'J')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-sans font-semibold text-[13px] text-foreground/60">{profile?.display_name || 'Joueur'}</p>
                  <p className="font-sans text-[11px] text-foreground/20">{member.role}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invite */}
      <div className="space-y-3">
        <p className="font-sans text-[11px] text-foreground/25 tracking-widest uppercase">
          Inviter
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/60 rounded-lg px-3 py-2.5 border border-border/60">
            <p className="font-sans font-semibold text-[14px] text-foreground/50 tracking-widest">{inviteCode}</p>
          </div>
          <button
            onClick={copyInviteCode}
            className="p-2.5 rounded-lg bg-white/60 border border-border/60 hover:bg-white transition-colors"
          >
            {codeCopied ? <Check size={16} className="text-green/60" /> : <Copy size={16} className="text-foreground/40" />}
          </button>
        </div>
      </div>
    </div>
  )
}
