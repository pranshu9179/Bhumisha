import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useForgotPasswordMutation } from '@/services/api/hooks'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const mutation = useForgotPasswordMutation()
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
      title="Forgot password"
      description="This frontend-only flow simulates reset instructions so you can validate the UX without any backend integration."
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
        <Field label="Email address" error={errors.email?.message}>
          <Input placeholder="name@company.com" {...register('email')} />
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
          <Mail className="h-4 w-4" />
          {mutation.isPending ? 'Sending...' : 'Send reset instructions'}
        </Button>
      </form>
    </AuthCard>
  )
}
