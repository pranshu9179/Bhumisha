import { zodResolver } from '@hookform/resolvers/zod'
import { Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Field } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/features/shared/components/page-header'
import { useCurrentUser } from '@/hooks/use-current-user'
import { setSession } from '@/store/auth-slice'
import { useVendorCategories, useVendorProfile, useVendorProfileSaveMutation, useVendorRegistrationMutation } from '@/services/api/hooks'
// add at the top of the file alongside other useState imports
import { useRef } from 'react'
const schema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  designation: z.string().trim().min(2, 'Designation is required'),
  company_name: z.string().trim().min(2, 'Company name is required'),
  mobile_number: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  email: z.string().email('Valid email required'),
  state: z.string().trim().min(2, 'State is required'),
  district: z.string().trim().min(2, 'District is required'),
  city: z.string().trim().min(2, 'City is required'),
  vendor_type: z.string().trim().min(2, 'Vendor type is required'),
  landline_number: z.string().optional(),
  whatsapp_number: z.string().optional(),
  short_description: z.string().optional(),
  other_query: z.string().optional(),
  razorpay_key_id: z.string().optional(),
  razorpay_key_secret: z.string().optional(),
})

function cleanPhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-10)
}
// drop-in replacement for the Vendor categories Field
function CategoryDropdown({ vendorCategories, activeCategoryIds, setSelectedCategoryIds }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = (id) => {
    const sid = String(id)
    setSelectedCategoryIds(
      activeCategoryIds.includes(sid)
        ? activeCategoryIds.filter((v) => v !== sid)
        : [...activeCategoryIds, sid]
    )
  }

  const selectedNames = activeCategoryIds
    .map((id) => vendorCategories.find((c) => String(c.id) === id)?.name)
    .filter(Boolean)

  const triggerLabel =
    activeCategoryIds.length === 0
      ? 'Select categories...'
      : activeCategoryIds.length === 1
      ? selectedNames[0]
      : `${activeCategoryIds.length} categories selected`

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={activeCategoryIds.length === 0 ? 'text-muted-foreground' : 'font-medium text-foreground'}>
          {triggerLabel}
        </span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Pill tags shown when dropdown is closed */}
      {!open && activeCategoryIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[200] overflow-hidden rounded-md border border-border bg-white shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gray-50 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {activeCategoryIds.length} selected
            </span>
            {activeCategoryIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategoryIds([])}
                className="text-xs text-destructive hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 bg-white">
            {vendorCategories.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No categories available
              </p>
            )}
            {vendorCategories.map((category) => {
              const checked = activeCategoryIds.includes(String(category.id))
              return (
                <label
                  key={category.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    checked ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-gray-100'
                  }`}
                >
                  {/* ✅ Real hidden checkbox — this is what was missing */}
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggle(category.id)}
                  />
                  {/* Custom checkbox visual */}
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                  }`}>
                    {checked && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span>{category.name}</span>
                </label>
              )
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-gray-50 px-3 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Done
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
export function VendorRegistrationForm({
  loadProfile = true,
  upgradeSessionOnSuccess = false,
  targetUser,
  showHeader = true,
  frame = true,
  submitLabel = 'Submit vendor profile',
  successMessage,
  onSuccess,
  title = 'Store setup',
  eyebrow = 'Vendor onboarding',
  description = 'Submit the documented vendor profile, operating location, categories, and optional Razorpay credentials.',
}) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const user = targetUser || currentUser
  const session = useSelector((state) => state.auth.session)
  const { data: vendorCategories = [] } = useVendorCategories()
  const { data: vendorProfile } = useVendorProfile({ enabled: loadProfile })
  const registrationMutation = useVendorRegistrationMutation()
  const profileMutation = useVendorProfileSaveMutation()
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.name || user?.username || '',
      designation: 'Owner',
      company_name: user?.company || user?.name || user?.username || '',
      mobile_number: cleanPhone(user?.phone),
      email: user?.email || '',
      state: '',
      district: '',
      city: '',
      vendor_type: 'Dealer',
      landline_number: '',
      whatsapp_number: cleanPhone(user?.phone),
      short_description: '',
      other_query: '',
      razorpay_key_id: '',
      razorpay_key_secret: '',
    },
  })

  useEffect(() => {
    if (!loadProfile || !vendorProfile?.id) return
    reset({
      full_name: vendorProfile.full_name || user?.name || user?.username || '',
      designation: vendorProfile.designation || 'Owner',
      company_name: vendorProfile.company_name || user?.company || user?.name || user?.username || '',
      mobile_number: cleanPhone(vendorProfile.mobile_number || user?.phone),
      email: vendorProfile.email || user?.email || '',
      state: vendorProfile.state || '',
      district: vendorProfile.district || '',
      city: vendorProfile.city || '',
      vendor_type: vendorProfile.vendor_type || 'Dealer',
      landline_number: vendorProfile.landline_number || '',
      whatsapp_number: vendorProfile.whatsapp_number || cleanPhone(user?.phone),
      short_description: vendorProfile.short_description || '',
      other_query: vendorProfile.other_query || '',
      razorpay_key_id: vendorProfile.razorpay_key_id || '',
      razorpay_key_secret: '',
    })
  }, [loadProfile, reset, user, vendorProfile])

  useEffect(() => {
    if (loadProfile) return
    reset({
      full_name: user?.name || user?.username || '',
      designation: 'Owner',
      company_name: user?.company || user?.name || user?.username || '',
      mobile_number: cleanPhone(user?.phone),
      email: user?.email || '',
      state: user?.state || '',
      district: user?.district || '',
      city: user?.city || '',
      vendor_type: 'Dealer',
      landline_number: '',
      whatsapp_number: cleanPhone(user?.phone),
      short_description: '',
      other_query: '',
      razorpay_key_id: '',
      razorpay_key_secret: '',
    })
  }, [loadProfile, reset, user])

  const activeCategoryIds = selectedCategoryIds ?? (vendorProfile?.categories || []).map(String)

  const onSubmit = async (values) => {
    if (!activeCategoryIds.length) {
      toast.error('Select at least one vendor category.')
      return
    }

    try {
      const payload = {
        ...values,
        userId: user?.id,
        user_id: user?.id,
        categories: activeCategoryIds.map((id) => {
          const numeric = Number(id)
          return Number.isNaN(numeric) ? id : numeric
        }),
      }
      const canUpdateProfile = loadProfile && vendorProfile?.id
      const result = canUpdateProfile
        ? await profileMutation.mutateAsync({ id: vendorProfile.id, payload })
        : await registrationMutation.mutateAsync(payload)

      toast.success(successMessage || result?.message || (canUpdateProfile ? 'Vendor profile updated.' : 'Vendor registration details submitted.'))

      if (upgradeSessionOnSuccess) {
        const upgradedUser = {
          ...user,
          ...(result?.user || {}),
          role: 'vendor',
        }
        dispatch(setSession({ ...(session || {}), user: upgradedUser }))
        navigate('/vendor/store-setup', { replace: true })
      }

      onSuccess?.(result)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to submit vendor registration.')
    }
  }

  const form = (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Full name" error={errors.full_name?.message}>
        <Input {...register('full_name')} />
      </Field>
      <Field label="Designation" error={errors.designation?.message}>
        <Input {...register('designation')} />
      </Field>
      <Field label="Company name" error={errors.company_name?.message}>
        <Input {...register('company_name')} />
      </Field>
      <Field label="Mobile number" error={errors.mobile_number?.message}>
        <Input inputMode="numeric" {...register('mobile_number')} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" {...register('email')} />
      </Field>
      <Field label="Vendor type" error={errors.vendor_type?.message}>
        <Input placeholder="Dealer, service provider, distributor..." {...register('vendor_type')} />
      </Field>
      <Field label="State" error={errors.state?.message}>
        <Input {...register('state')} />
      </Field>
      <Field label="District" error={errors.district?.message}>
        <Input {...register('district')} />
      </Field>
      <Field label="City" error={errors.city?.message}>
        <Input {...register('city')} />
      </Field>
      {/* <Field label="Vendor categories" hint="Hold Ctrl to select multiple marketplace capabilities.">
        <NativeSelect
          multiple
          value={activeCategoryIds}
          className="min-h-28"
          onChange={(event) => {
            setSelectedCategoryIds(Array.from(event.target.selectedOptions).map((option) => option.value))
          }}
        >
          {vendorCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </NativeSelect>
      </Field> */}
     <Field label="Vendor categories" hint="Select all applicable marketplace capabilities.">
  <CategoryDropdown
    vendorCategories={vendorCategories}
    activeCategoryIds={activeCategoryIds}
    setSelectedCategoryIds={setSelectedCategoryIds}
  />
</Field>
      <Field label="Landline number">
        <Input {...register('landline_number')} />
      </Field>
      <Field label="WhatsApp number">
        <Input inputMode="numeric" {...register('whatsapp_number')} />
      </Field>
      <Field label="Short description" className="md:col-span-2">
        <Textarea rows={3} {...register('short_description')} />
      </Field>
      <Field label="Other query" className="md:col-span-2">
        <Textarea rows={3} {...register('other_query')} />
      </Field>
      <Field label="Razorpay key ID">
        <Input {...register('razorpay_key_id')} />
      </Field>
      <Field label="Razorpay key secret">
        <Input type="password" {...register('razorpay_key_secret')} />
      </Field>
      <div className="flex justify-end md:col-span-2">
        <Button type="submit" disabled={registrationMutation.isPending || profileMutation.isPending}>
          <Building2 className="h-4 w-4" />
          {registrationMutation.isPending || profileMutation.isPending ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {showHeader ? (
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          compact
        />
      ) : null}
      {frame ? (
        <Card>
          <CardContent className="p-6">
            {form}
          </CardContent>
        </Card>
      ) : form}
    </div>
  )
}

export function VendorStoreSetupPage() {
  return <VendorRegistrationForm />
}

export default VendorStoreSetupPage
