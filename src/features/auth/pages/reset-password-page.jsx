import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useResetPasswordMutation } from '@/services/api/hooks'

const schema = z
  .object({
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mutation = useResetPasswordMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: searchParams.get('phone') || '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      const response = await mutation.mutateAsync(values)
      toast.success(response.message || 'Password changed successfully.')
      navigate('/login')
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to reset password.')
    }
  }

  return (
    <AuthCard
      title="Reset password"
      description="Use the OTP generated for your registered phone number to set a new password."
      footer={
        <p className="text-sm text-slate-500">
          Return to the{' '}
          <Link to="/login" className="font-semibold text-primary">
            login screen
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Phone number" error={errors.phone?.message}>
          <Input inputMode="numeric" placeholder="9876543210" {...register('phone')} />
        </Field>
        <Field label="OTP" error={errors.otp?.message}>
          <Input inputMode="numeric" placeholder="123456" {...register('otp')} />
        </Field>
        <Field label="New password" error={errors.password?.message}>
          <Input type="password" placeholder="Set a strong password" {...register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <Input type="password" placeholder="Repeat the new password" {...register('confirmPassword')} />
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
          <LockKeyhole className="h-4 w-4" />
          {mutation.isPending ? 'Saving...' : 'Save new password'}
        </Button>
      </form>
    </AuthCard>
  )
}
