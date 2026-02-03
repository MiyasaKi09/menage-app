'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

const joinHouseholdSchema = z.object({
  inviteCode: z.string().min(8, 'Le code doit contenir 8 caractères').max(8),
})

type JoinHouseholdInput = z.infer<typeof joinHouseholdSchema>

export function JoinHouseholdForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinHouseholdInput>({
    resolver: zodResolver(joinHouseholdSchema),
  })

  const onSubmit = async (data: JoinHouseholdInput) => {
    setIsLoading(true)
    setError(null)

    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Vous devez être connecté')
        setIsLoading(false)
        return
      }

      // Trouver le foyer avec ce code
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('id')
        .eq('invite_code', data.inviteCode.toUpperCase())
        .single()

      if (householdError || !household) {
        setError('Code invalide. Vérifiez le code et réessayez.')
        setIsLoading(false)
        return
      }

      // Vérifier si l'utilisateur n'est pas déjà membre
      const { data: existingMember } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', household.id)
        .eq('profile_id', user.id)
        .single()

      if (existingMember) {
        setError('Vous êtes déjà membre de ce foyer')
        setIsLoading(false)
        return
      }

      // Ajouter l'utilisateur comme membre
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          profile_id: user.id,
          role: 'member',
        })

      if (memberError) {
        console.error('Member addition error:', memberError)
        setError(`Erreur: ${memberError.message}`)
        setIsLoading(false)
        return
      }

      router.push('/household')
      router.refresh()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Une erreur inattendue est survenue')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="inviteCode" className="block text-sm font-medium mb-1">
          Code d'invitation
        </label>
        <Input
          id="inviteCode"
          placeholder="ABC12345"
          {...register('inviteCode')}
          disabled={isLoading}
          className="uppercase"
          maxLength={8}
        />
        {errors.inviteCode && (
          <p className="text-sm text-red-500 mt-1">{errors.inviteCode.message}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Le code vous a été communiqué par un membre du foyer
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : 'Rejoindre le foyer'}
      </Button>
    </form>
  )
}
