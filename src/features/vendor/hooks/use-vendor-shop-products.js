import { useMemo } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useShopProducts, useVendorProfile } from '@/services/api/hooks'

function addIdentifier(values, value) {
  if (value !== undefined && value !== null && value !== '') {
    values.add(String(value))
  }
}

export function vendorIdentifiers(user, vendorProfile) {
  const values = new Set()
  addIdentifier(values, user?.id)
  addIdentifier(values, user?.user_id)
  addIdentifier(values, user?.userId)
  addIdentifier(values, user?.vendor_id)
  addIdentifier(values, user?.vendorId)
  addIdentifier(values, vendorProfile?.id)
  addIdentifier(values, vendorProfile?.user_id)
  addIdentifier(values, vendorProfile?.userId)
  return values
}

export function productVendorIdentifiers(product) {
  const values = new Set()
  addIdentifier(values, product?.vendorId)
  addIdentifier(values, product?.vendor_id)
  addIdentifier(values, product?.user_id)
  addIdentifier(values, product?.userId)
  addIdentifier(values, product?.vendor?.id)
  addIdentifier(values, product?.vendor?.user_id)
  addIdentifier(values, product?.vendor?.userId)
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
