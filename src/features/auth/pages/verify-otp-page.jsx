import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useResendOtpMutation, useVerifyOtpMutation } from '@/services/api/hooks'

const schema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const verifyMutation = useVerifyOtpMutation()
  const resendMutation = useResendOtpMutation()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: searchParams.get('phone') || '',
      otp: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      await verifyMutation.mutateAsync(values)
      toast.success('Phone number verified. You can sign in now.')
      navigate('/login')
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to verify OTP.')
    }
  }

  const onResend = async () => {
    const phone = getValues('phone')
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Enter a valid 10 digit phone number first.')
      return
    }

    try {
      await resendMutation.mutateAsync({ phone })
      toast.success('New OTP generated for this phone number.')
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to resend OTP.')
    }
  }

  return (
    <AuthCard
      title="Verify OTP"
      description="Enter the six digit OTP generated for your registered phone number."
      footer={
        <p className="text-sm text-slate-500">
          Already verified?{' '}
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
        <Field label="OTP" error={errors.otp?.message}>
          <Input inputMode="numeric" placeholder="123456" {...register('otp')} />
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={verifyMutation.isPending}>
          <ShieldCheck className="h-4 w-4" />
          {verifyMutation.isPending ? 'Verifying...' : 'Verify account'}
        </Button>
        <Button type="button" className="w-full" variant="secondary" disabled={resendMutation.isPending} onClick={onResend}>
          {resendMutation.isPending ? 'Sending...' : 'Resend OTP'}
        </Button>
      </form>
    </AuthCard>
  )
}
