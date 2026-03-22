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
      <div className="flex items-center justify-between py-3 border-b border-cream/[0.06]">
        <div>
          <p className="font-cinzel text-[14px] text-cream/70">Mode vacances</p>
          <p className="font-lora text-[11px] text-cream/25">Suspendre toutes les quetes</p>
        </div>
        <button
          onClick={() => setVacationMode(!vacationMode)}
          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
            vacationMode ? 'bg-yellow/60' : 'bg-cream/10'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-cream shadow transition-transform duration-200 ${
              vacationMode ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Task management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
            Gestion des taches
          </p>
          {isAdmin && (
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow/[0.1] border border-yellow/20 text-yellow/70 font-medieval text-[11px] hover:bg-yellow/[0.15] transition-colors">
              <Plus size={12} />
              Nouvelle
            </button>
          )}
        </div>

        <div className="space-y-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-3 border-b border-cream/[0.04] last:border-0"
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
                  <EyeOff size={16} className="text-cream/20" />
                )}
              </button>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className={`font-cinzel text-[13px] leading-tight ${
                  taskStates[task.id] ? 'text-cream/70' : 'text-cream/25 line-through'
                }`}>
                  {task.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-lora text-[11px] text-cream/20">
                    {task.categories?.emoji} {task.categories?.name}
                  </span>
                  <span className="font-lora text-[11px] text-cream/15">
                    {task.frequencies?.label}
                  </span>
                </div>
              </div>

              {/* Points */}
              <span className="font-cinzel text-[12px] text-yellow/40 flex-shrink-0">
                {task.points} or
              </span>
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="text-center font-lora text-[13px] text-cream/30 py-6">
              Aucune quete configuree
            </p>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="space-y-3">
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
          Membres
        </p>
        <div className="space-y-1">
          {members.map((member) => {
            const profile = member.profiles as any
            return (
              <div key={member.profile_id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-cream/[0.06] flex items-center justify-center">
                  <span className="font-cinzel text-[12px] text-cream/40">
                    {(profile?.display_name || 'J')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-cinzel text-[13px] text-cream/60">{profile?.display_name || 'Joueur'}</p>
                  <p className="font-lora text-[11px] text-cream/20">{member.role}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invite */}
      <div className="space-y-3">
        <p className="font-medieval text-[11px] text-cream/25 tracking-widest uppercase">
          Inviter
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-cream/[0.04] rounded-lg px-3 py-2.5 border border-cream/[0.06]">
            <p className="font-cinzel text-[14px] text-cream/50 tracking-widest">{inviteCode}</p>
          </div>
          <button
            onClick={copyInviteCode}
            className="p-2.5 rounded-lg bg-cream/[0.04] border border-cream/[0.06] hover:bg-cream/[0.08] transition-colors"
          >
            {codeCopied ? <Check size={16} className="text-green/60" /> : <Copy size={16} className="text-cream/40" />}
          </button>
        </div>
      </div>
    </div>
  )
}
