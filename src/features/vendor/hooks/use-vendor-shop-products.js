import { useMemo } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useShopProducts, useVendorProfile } from '@/services/api/hooks'

function addIdentifier(values, value) {
  if (value !== undefined && value !== null && value !== '') {
    values.add(String(value))
  }
}

function addTextIdentifier(values, label, value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized) values.add(`${label}:${normalized}`)
}

function cleanPhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-10)
}

export function vendorIdentifiers(user, vendorProfile) {
  const values = new Set()
  addIdentifier(values, user?.id)
  addIdentifier(values, user?.user_id)
  addIdentifier(values, user?.userId)
  addIdentifier(values, user?.vendor_id)
  addIdentifier(values, user?.vendorId)
  addIdentifier(values, vendorProfile?.id)
  addIdentifier(values, vendorProfile?.vendor_id)
  addIdentifier(values, vendorProfile?.vendorId)
  addIdentifier(values, vendorProfile?.user_id)
  addIdentifier(values, vendorProfile?.userId)
  addIdentifier(values, vendorProfile?.user?.id)
  addIdentifier(values, vendorProfile?.vendor?.id)
  addIdentifier(values, vendorProfile?.vendor?.user_id)
  addIdentifier(values, vendorProfile?.vendor?.userId)
  addTextIdentifier(values, 'email', user?.email)
  addTextIdentifier(values, 'email', vendorProfile?.email)
  addTextIdentifier(values, 'phone', cleanPhone(user?.phone))
  addTextIdentifier(values, 'phone', cleanPhone(vendorProfile?.mobile_number || vendorProfile?.phone))
  addTextIdentifier(values, 'company', user?.company)
  addTextIdentifier(values, 'company', vendorProfile?.company_name || vendorProfile?.companyName)
  return values
}

export function productVendorIdentifiers(product) {
  const values = new Set()
  addIdentifier(values, product?.vendorId)
  addIdentifier(values, product?.vendor_id)
  addIdentifier(values, product?.vendorUserId)
  addIdentifier(values, product?.vendor_user_id)
  addIdentifier(values, product?.user_id)
  addIdentifier(values, product?.userId)
  addIdentifier(values, product?.created_by)
  addIdentifier(values, product?.createdBy)
  addIdentifier(values, product?.seller_id)
  addIdentifier(values, product?.sellerId)
  addIdentifier(values, product?.vendor?.id)
  addIdentifier(values, product?.vendor?.vendor_id)
  addIdentifier(values, product?.vendor?.vendorId)
  addIdentifier(values, product?.vendor?.user_id)
  addIdentifier(values, product?.vendor?.userId)
  addIdentifier(values, product?.vendor?.user?.id)
  addTextIdentifier(values, 'email', product?.vendor_email || product?.vendorEmail || product?.vendor?.email)
  addTextIdentifier(values, 'phone', cleanPhone(product?.vendor_phone || product?.vendorPhone || product?.vendor?.phone || product?.vendor?.mobile_number))
  addTextIdentifier(values, 'company', product?.company_name || product?.companyName || product?.vendor_name || product?.vendorName || product?.vendor?.company_name || product?.vendor?.companyName || product?.vendor?.name)
  return values
}

export function belongsToVendor(product, identifiers) {
  if (!identifiers.size) return false
  for (const value of productVendorIdentifiers(product)) {
    if (identifiers.has(value)) return true
  }
  return false
}

export function useVendorShopProducts(params = {}) {
  const user = useCurrentUser()
  const { data: vendorProfile } = useVendorProfile({ enabled: Boolean(user) })
  const query = useShopProducts(params)

  const products = useMemo(() => {
    const identifiers = vendorIdentifiers(user, vendorProfile)
    return (query.data || []).filter((product) => belongsToVendor(product, identifiers))
  }, [query.data, user, vendorProfile])

  return {
    ...query,
    data: products,
  }
}
