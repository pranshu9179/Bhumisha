import { zodResolver } from '@hookform/resolvers/zod'
import { Leaf, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DemoCredentials } from '@/features/auth/components/demo-credentials'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useLoginMutation } from '@/services/api/hooks'
import { setSession } from '@/store/auth-slice'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
      email: 'admin@bhumisha.test',
      password: 'Admin@123',
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
      title="Sign in to Bhumisha Nexus"
      description="Use the seeded demo accounts to explore the role-based advisory and marketplace workflows."
      footer={
        <p className="text-sm text-slate-500">
          Need help accessing your workspace?{' '}
          <Link to="/forgot-password" className="font-semibold text-primary">
            Reset your password
          </Link>
        </p>
      }
    >
      <div className="rounded-2xl border border-accent/15 bg-accent/8 p-4 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-dark">
          <Leaf className="h-4 w-4 text-primary" />
          Demo credentials
        </div>
        <p className="mt-1">
          Pick any role below, then replace the login form with the matching credentials if you want to switch personas quickly.
        </p>
      </div>

      <DemoCredentials />

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Work email" error={errors.email?.message}>
          <Input placeholder="name@company.com" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input type="password" placeholder="Enter password" {...register('password')} />
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
          <LogIn className="h-4 w-4" />
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}
