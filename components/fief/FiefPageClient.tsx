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
  const [activeTab, setActiveTab] = useState<TabId>('admin')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="font-serif text-2xl text-foreground font-semibold">{householdName}</h1>
        <p className="font-sans text-[11px] text-foreground/25 mt-1">Votre fief</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center justify-center gap-1 bg-white/60 rounded-xl p-1">
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
                  : 'text-foreground/30 hover:text-foreground/50'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
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
          {activeTab === 'quartier' && <QuartierTab householdId={householdId} userId={userId} />}
          {activeTab === 'parametres' && <ParametresTab householdId={householdId} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
