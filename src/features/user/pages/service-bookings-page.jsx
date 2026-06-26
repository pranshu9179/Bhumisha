import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCheck } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/features/shared/components/page-header'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useServiceBookingCreateMutation, useServiceProviders, useVendorCategories, useVendorsByCategory } from '@/services/api/hooks'

const bookingSchema = z.object({
  category_id: z.string().min(1, 'Service category is required'),
  vendor_id: z.string().min(1, 'Vendor is required'),
  name: z.string().trim().min(2, 'Name is required'),
  phone_number: z.string().trim().min(10, 'Phone number is required'),
  remark: z.string().optional(),
})

function apiId(value) {
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}

function vendorLabel(vendor) {
  return vendor?.company_name || vendor?.companyName || vendor?.full_name || vendor?.fullName || vendor?.name || vendor?.username || vendor?.id
}

export default function ServiceBookingsPage() {
  const user = useCurrentUser()
  const { data: vendorCategories = [] } = useVendorCategories({ status: 'all' })
  const { data: serviceProviders = [] } = useServiceProviders()
  const mutation = useServiceBookingCreateMutation()
  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      category_id: '',
      vendor_id: '',
      name: user?.name || '',
      phone_number: user?.phone || '',
      remark: '',
    },
  })
  const selectedCategoryId = useWatch({ control: form.control, name: 'category_id' })
  const { data: categoryVendors = [] } = useVendorsByCategory(selectedCategoryId, { limit: 100 })

  useEffect(() => {
    form.reset((values) => ({
      ...values,
      name: values.name || user?.name || '',
      phone_number: values.phone_number || user?.phone || '',
    }))
  }, [form, user])

  const serviceCategories = useMemo(
    () =>
      vendorCategories.filter((category) => {
        const allowed = String(category.allowed_services || category.allowedServices || '').toLowerCase()
        return category.status !== 'deleted' && allowed !== 'product_only'
      }),
    [vendorCategories],
  )
  const vendors = selectedCategoryId ? categoryVendors : serviceProviders

  const createBooking = async (values) => {
    await mutation.mutateAsync({
      vendor_id: apiId(values.vendor_id),
      category_id: apiId(values.category_id),
      name: values.name.trim(),
      phone_number: values.phone_number.trim(),
      remark: values.remark?.trim() || undefined,
    })
    form.reset({
      category_id: '',
      vendor_id: '',
      name: user?.name || '',
      phone_number: user?.phone || '',
      remark: '',
    })
    toast.success('Service booking created successfully.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service request"
        title="Book a farming service"
        description="Choose a service category, select a vendor, and submit your request for admin follow-up."
        compact
      />

      <Card className="max-w-4xl">
        <CardContent className="p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(createBooking)}>
            <Field label="Service category" error={form.formState.errors.category_id?.message}>
              <NativeSelect {...form.register('category_id')}>
                <option value="">Select category</option>
                {serviceCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.name_hi ? ` / ${category.name_hi}` : ''}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Vendor" error={form.formState.errors.vendor_id?.message}>
              <NativeSelect {...form.register('vendor_id')}>
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendorLabel(vendor)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register('name')} />
            </Field>
            <Field label="Phone number" error={form.formState.errors.phone_number?.message}>
              <Input inputMode="tel" {...form.register('phone_number')} />
            </Field>
            <Field label="Remark" error={form.formState.errors.remark?.message} className="md:col-span-2">
              <Textarea rows={4} {...form.register('remark')} />
            </Field>
            <div className="flex justify-end md:col-span-2">
              <Button type="submit" disabled={mutation.isPending}>
                <CalendarCheck className="h-4 w-4" />
                {mutation.isPending ? 'Booking...' : 'Create booking'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
