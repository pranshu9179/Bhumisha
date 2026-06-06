import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useResendOtpMutation } from '@/services/api/hooks'

const schema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
})

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const mutation = useResendOtpMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    try {
      const response = await mutation.mutateAsync(values)
      toast.success(response.message || 'OTP generated for this phone number.')
      navigate(`/reset-password?phone=${encodeURIComponent(values.phone)}`)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to send OTP.')
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      description="Request a fresh OTP for your registered phone number, then use it to set a new password."
      footer={
        <p className="text-sm text-slate-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-primary">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Phone number" error={errors.phone?.message}>
          <Input inputMode="numeric" placeholder="9876543210" {...register('phone')} />
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
          <Mail className="h-4 w-4" />
          {mutation.isPending ? 'Sending...' : 'Send OTP'}
        </Button>
      </form>
    </AuthCard>
  )
}
