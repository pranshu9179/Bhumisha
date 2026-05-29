import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useResetPasswordMutation } from '@/services/api/hooks'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  const mutation = useResetPasswordMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    const response = await mutation.mutateAsync(values)
    toast.success(response.message)
  }

  return (
    <AuthCard
      title="Reset password"
      description="Mock reset screens let you validate form UX, field validation, and success states without sending real tokens."
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
