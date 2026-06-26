import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { useUserProfileUpdateMutation } from '@/services/api/hooks'
import { setSession } from '@/store/auth-slice'

const profileFields = [
  'full_name',
  'father_name',
  'district',
  'tehsil',
  'patwari_halka',
  'village',
  'khasara_number',
  'category',
  'gender',
  'aadhar_number',
  'land_area',
]

const optionalText = z.string().trim().optional()

const schema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  father_name: optionalText,
  district: optionalText,
  tehsil: optionalText,
  patwari_halka: optionalText,
  village: optionalText,
  khasara_number: optionalText,
  category: optionalText,
  gender: optionalText,
  aadhar_number: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{12}$/.test(value), 'Aadhar number must be 12 digits'),
  land_area: optionalText,
})

function readProfileValue(user, key) {
  if (key === 'full_name') {
    return user?.full_name || user?.name || user?.username || ''
  }

  return user?.[key] || ''
}

function buildDefaultValues(user) {
  return Object.fromEntries(profileFields.map((field) => [field, readProfileValue(user, field)]))
}

function cleanProfilePayload(values) {
  return Object.fromEntries(
    profileFields.map((field) => [field, typeof values[field] === 'string' ? values[field].trim() : values[field] || '']),
  )
}

function mergeUpdatedUser(user, result, payload) {
  const updatedUser = {
    ...user,
    ...payload,
    ...(result || {}),
  }

  updatedUser.full_name = updatedUser.full_name || payload.full_name
  updatedUser.name = updatedUser.name || updatedUser.full_name || user?.name

  if (payload.full_name) {
    updatedUser.name = payload.full_name
  }

  return updatedUser
}

export function UserProfileForm({ user, onSuccess }) {
  const dispatch = useDispatch()
  const session = useSelector((state) => state.auth.session)
  const updateProfileMutation = useUserProfileUpdateMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(user),
  })

  useEffect(() => {
    reset(buildDefaultValues(user))
  }, [reset, user])

  const onSubmit = async (values) => {
    const payload = cleanProfilePayload(values)

    try {
      const result = await updateProfileMutation.mutateAsync(payload)
      const updatedUser = mergeUpdatedUser(user, result, payload)
      dispatch(setSession({ ...(session || {}), user: updatedUser }))
      toast.success('Profile updated.')
      onSuccess?.(updatedUser)
    } catch (error) {
      toast.error(error?.displayMessage || 'Could not update profile.')
    }
  }

  return (
    <form className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Full name" error={errors.full_name?.message}>
        <Input {...register('full_name')} />
      </Field>
      <Field label="Father name" error={errors.father_name?.message}>
        <Input {...register('father_name')} />
      </Field>
      <Field label="District" error={errors.district?.message}>
        <Input {...register('district')} />
      </Field>
      <Field label="Tehsil" error={errors.tehsil?.message}>
        <Input {...register('tehsil')} />
      </Field>
      <Field label="Patwari halka" error={errors.patwari_halka?.message}>
        <Input {...register('patwari_halka')} />
      </Field>
      <Field label="Village" error={errors.village?.message}>
        <Input {...register('village')} />
      </Field>
      <Field label="Khasara number" error={errors.khasara_number?.message}>
        <Input {...register('khasara_number')} />
      </Field>
      <Field label="Category" error={errors.category?.message}>
        <Input {...register('category')} />
      </Field>
      <Field label="Gender" error={errors.gender?.message}>
        <NativeSelect {...register('gender')}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </NativeSelect>
      </Field>
      <Field label="Aadhar number" error={errors.aadhar_number?.message}>
        <Input inputMode="numeric" maxLength={12} {...register('aadhar_number')} />
      </Field>
      <Field label="Land area" error={errors.land_area?.message}>
        <Input {...register('land_area')} />
      </Field>
      <div className="flex justify-end md:col-span-2">
        <Button type="submit" disabled={updateProfileMutation.isPending}>
          <Save className="h-4 w-4" />
          {updateProfileMutation.isPending ? 'Saving...' : 'Save profile'}
        </Button>
      </div>
    </form>
  )
}
