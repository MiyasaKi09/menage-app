'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminTab } from './AdminTab'
import { QuartierTab } from './QuartierTab'
import { ParametresTab } from './ParametresTab'
import { Crown, Globe, Settings } from 'lucide-react'

interface FiefPageClientProps {
  householdId: string
  householdName: string
  userId: string
  isAdmin: boolean
  tasks: any[]
  members: any[]
  inviteCode: string
}

type TabId = 'admin' | 'quartier' | 'parametres'

const tabs = [
  { id: 'admin' as const, label: 'Admin', icon: Crown },
  { id: 'quartier' as const, label: 'Quartier', icon: Globe },
  { id: 'parametres' as const, label: 'Parametres', icon: Settings },
]

export function FiefPageClient({
  householdId,
  householdName,
  userId,
  isAdmin,
  tasks,
  members,
  inviteCode,
}: FiefPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('quartier')

  const isImmersive = activeTab === 'quartier'

  return (
    <>
      {/* Tab content — quartier is rendered outside the header container (fullscreen) */}
      {activeTab === 'quartier' && <QuartierTab householdId={householdId} userId={userId} />}

      {/* Floating header (title + tabs) — above the 3D scene when in quartier */}
      <div
        className={`${isImmersive ? 'fixed top-0 left-0 right-0 z-30 pt-6 pb-3' : 'relative'} max-w-2xl mx-auto px-4 ${isImmersive ? '' : 'py-6'} space-y-4`}
      >
        {/* Title */}
        <div className="text-center">
          <h1
            className="font-serif text-2xl font-semibold"
            style={
              isImmersive
                ? { color: 'hsl(30, 40%, 25%)', textShadow: '0 1px 4px rgba(255,245,230,0.8), 0 2px 12px rgba(255,245,230,0.6)' }
                : { color: 'hsl(var(--foreground))' }
            }
          >
            {householdName}
          </h1>
          <p
            className="font-sans text-[11px] mt-1"
            style={
              isImmersive
                ? { color: 'hsl(30, 30%, 40%)', textShadow: '0 1px 3px rgba(255,245,230,0.8)' }
                : { color: 'hsl(var(--foreground) / 0.25)' }
            }
          >
            Votre fief
          </p>
        </div>

        {/* Tab bar — frosted glass in immersive mode */}
        <div
          className="flex items-center justify-center gap-1 rounded-xl p-1 max-w-sm mx-auto"
          style={
            isImmersive
              ? {
                  background: 'rgba(255,245,230,0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232,224,212,0.5)',
                  boxShadow: '0 4px 20px rgba(30,20,10,0.08)',
                }
              : { background: 'rgba(255,255,255,0.6)' }
          }
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans font-semibold text-[13px] transition-all duration-200 ${
                  isActive
                    ? 'text-foreground bg-white'
                    : 'text-foreground/40 hover:text-foreground/60'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Other tabs content */}
      {!isImmersive && (
        <div className="max-w-2xl mx-auto px-4 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'admin' && (
                <AdminTab
                  tasks={tasks}
                  members={members}
                  inviteCode={inviteCode}
                  isAdmin={isAdmin}
                  householdId={householdId}
                />
              )}
              {activeTab === 'parametres' && <ParametresTab householdId={householdId} />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  )
}
