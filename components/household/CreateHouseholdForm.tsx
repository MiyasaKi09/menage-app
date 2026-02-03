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

const createHouseholdSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
})

type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>

export function CreateHouseholdForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateHouseholdInput>({
    resolver: zodResolver(createHouseholdSchema),
  })

  const onSubmit = async (data: CreateHouseholdInput) => {
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

      // Créer le foyer
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: data.name,
          created_by: user.id,
        })
        .select()
        .single()

      if (householdError) {
        console.error('Household creation error:', householdError)
        setError(`Erreur: ${householdError.message}`)
        setIsLoading(false)
        return
      }

      // Ajouter l'utilisateur comme membre admin
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          profile_id: user.id,
          role: 'admin',
        })

      if (memberError) {
        console.error('Member addition error:', memberError)
        setError(`Erreur lors de l'ajout au foyer: ${memberError.message}`)
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
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nom du foyer
        </label>
        <Input
          id="name"
          placeholder="ex: Famille Dupont, Coloc Paris..."
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : 'Créer le foyer'}
      </Button>
    </form>
  )
}
