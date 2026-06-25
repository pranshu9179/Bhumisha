import { VendorRegistrationForm } from '@/features/vendor/pages/commerce/vendor-store-setup-page'

export default function BecomeVendorPage() {
  return (
    <VendorRegistrationForm
      loadProfile={false}
      upgradeSessionOnSuccess
      eyebrow="Vendor registration"
      title="Become a vendor"
      description="Fill the documented vendor profile form. After successful registration your account will move to the vendor workspace."
    />
  )
}
