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

      // Utiliser la fonction RPC pour créer le foyer avec l'admin
      const { data: household, error: householdError } = await supabase
        .rpc('create_household_with_admin', {
          household_name: data.name,
          creator_id: user.id,
        })
        .single()

      if (householdError) {
        console.error('Household creation error:', householdError)
        setError(`Erreur: ${householdError.message}`)
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
