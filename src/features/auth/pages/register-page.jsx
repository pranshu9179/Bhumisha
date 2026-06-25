import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUp, LockKeyhole, Phone, UserPlus, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useRegisterMutation } from '@/services/api/hooks'

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  profile_image: z
    .any()
    .optional()
    .refine((files) => !files?.length || files[0].size <= 50 * 1024 * 1024, 'Profile image must be 50MB or smaller'),
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const mutation = useRegisterMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      phone: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values)
      toast.success('Account created. Verify the OTP saved for your phone number.')
      navigate(`/verify-otp?phone=${encodeURIComponent(values.phone)}`)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to create account.')
    }
  }

  return (
    <AuthCard
      title="Create account"
      footer={
        <p className="text-center text-sm text-slate-500">
          Already verified?{' '}
          <Link to="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Full name" error={errors.full_name?.message}>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 focus:bg-white" placeholder="Enter full name" {...register('full_name')} />
          </div>
        </Field>
        <Field label="Phone number" error={errors.phone?.message}>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 focus:bg-white" inputMode="numeric" placeholder="9876543210" {...register('phone')} />
          </div>
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 focus:bg-white" type="password" placeholder="Minimum 6 characters" {...register('password')} />
          </div>
        </Field>
        <Field label="Profile image" hint="Optional JPEG, PNG, JPG, or MP4 up to 50MB." error={errors.profile_image?.message}>
          <div className="relative">
            <ImageUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-dark focus:bg-white" type="file" accept="image/jpeg,image/png,image/jpg,video/mp4" {...register('profile_image')} />
          </div>
        </Field>
        <Button type="submit" className="h-12 w-full rounded-xl" size="lg" disabled={mutation.isPending}>
          <UserPlus className="h-4 w-4" />
          {mutation.isPending ? 'Creating...' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
