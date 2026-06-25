import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, LogIn, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useLoginMutation } from '@/services/api/hooks'
import { setSession } from '@/store/auth-slice'

const schema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const loginMutation = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  if (user) {
    return <Navigate to={`/${user.role}`} replace />
  }

  const onSubmit = async (values) => {
    try {
      const payload = await loginMutation.mutateAsync(values)
      dispatch(setSession(payload))
      toast.success(`Welcome back, ${payload.user.name}`)
      navigate(`/${payload.user.role}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign in.')
    }
  }

  return (
    <AuthCard
      title="Sign in"
      footer={
        <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
          <p className="min-w-0">
            New user?{' '}
            <Link to="/register" className="block font-semibold text-primary sm:inline">
              Create
            </Link>
          </p>
          <p className="min-w-0">
            Need help?{' '}
            <Link to="/forgot-password" className="block font-semibold text-primary sm:inline">
              Reset
            </Link>
          </p>
          <p className="min-w-0">
            Have an OTP?{' '}
            <Link to="/verify-otp" className="block font-semibold text-primary sm:inline">
              Verify
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Phone number" error={errors.phone?.message}>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 focus:bg-white" inputMode="numeric" placeholder="9876543210" {...register('phone')} />
          </div>
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 focus:bg-white" type="password" placeholder="Enter password" {...register('password')} />
          </div>
        </Field>
        <Button type="submit" className="h-12 w-full rounded-xl" size="lg" disabled={loginMutation.isPending}>
          <LogIn className="h-4 w-4" />
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}
