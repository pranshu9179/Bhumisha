import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, ReceiptText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { Field } from '@/components/forms/field'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { PageHeader } from '@/features/shared/components/page-header'
import { formatCurrency } from '@/lib/format'
import {
  useAddressSaveMutation,
  useAddresses,
  useCheckoutMutation,
  useMyOrders,
  useShopProducts,
} from '@/services/api/hooks'

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone is required'),
  address_line: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(4, 'Zip code is required'),
})

function apiId(value) {
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}

export function VendorCheckoutPage() {
  const { data: products = [] } = useShopProducts({ limit: 12 })
  const { data: addresses = [] } = useAddresses()
  const { data: myOrders = [] } = useMyOrders()
  const addressMutation = useAddressSaveMutation()
  const checkoutMutation = useCheckoutMutation()
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addressId, setAddressId] = useState('')

  const selectedProduct = products.find((product) => String(product.id) === String(productId)) || products[0]
  const selectedAddress = addresses.find((address) => String(address.id) === String(addressId)) || addresses[0]
  const total = Number(selectedProduct?.price || 0) * Number(quantity || 1)

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      phone: '',
      address_line: '',
      city: '',
      state: '',
      zip_code: '',
    },
  })

  const orderColumns = useMemo(
    () => [
      { header: 'Order', accessorKey: 'id' },
      { header: 'Product', accessorKey: 'productName', cell: ({ row }) => row.original.productName || row.original.product_name || '-' },
      { header: 'Qty', accessorKey: 'quantity' },
      { header: 'Total', accessorKey: 'total', cell: ({ row }) => formatCurrency(row.original.total) },
      { header: 'Payment', accessorKey: 'paymentStatus', cell: ({ row }) => <StatusBadge value={row.original.paymentStatus} /> },
      { header: 'Status', accessorKey: 'fulfillmentStatus', cell: ({ row }) => <StatusBadge value={row.original.fulfillmentStatus} /> },
    ],
    [],
  )

  const saveAddress = async (values) => {
    await addressMutation.mutateAsync({ payload: values })
    addressForm.reset()
    toast.success('Address saved.')
  }

  const checkout = async () => {
    if (!selectedProduct || !selectedAddress) {
      toast.error('Select a product and shipping address first.')
      return
    }

    const result = await checkoutMutation.mutateAsync({
      paymentMethod: 'Online',
      shippingAddress: selectedAddress,
      cartItems: [
        {
          productId: apiId(selectedProduct.id),
          quantity: Number(quantity),
        },
      ],
    })
    toast.success(result?.message || 'PhonePe payment link generated.')
    if (result?.paymentUrl || result?.payment_url) {
      window.location.assign(result.paymentUrl || result.payment_url)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Buyer flow"
        title="Addresses and checkout"
        description="Use saved addresses, create PhonePe checkout links, and review purchase history using the commerce APIs."
        compact
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 font-semibold text-dark">
              <ReceiptText className="h-4 w-4" />
              Checkout
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product">
                <NativeSelect value={selectedProduct?.id || ''} onChange={(event) => setProductId(event.target.value)}>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Quantity">
                <Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              </Field>
              <Field label="Shipping address">
                <NativeSelect value={selectedAddress?.id || ''} onChange={(event) => setAddressId(event.target.value)}>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name} - {address.city}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Payment">
                <Input value="Online - PhonePe" readOnly />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">Order total</p>
                <p className="text-xl font-semibold text-dark">{formatCurrency(total)}</p>
              </div>
              <Button type="button" onClick={checkout} disabled={checkoutMutation.isPending || !products.length || !addresses.length}>
                {checkoutMutation.isPending ? 'Processing...' : 'Checkout'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 font-semibold text-dark">
              <MapPin className="h-4 w-4" />
              Add address
            </div>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={addressForm.handleSubmit(saveAddress)}>
              <Field label="Name" error={addressForm.formState.errors.name?.message}>
                <Input {...addressForm.register('name')} />
              </Field>
              <Field label="Phone" error={addressForm.formState.errors.phone?.message}>
                <Input {...addressForm.register('phone')} />
              </Field>
              <Field label="Address" className="md:col-span-2" error={addressForm.formState.errors.address_line?.message}>
                <Input {...addressForm.register('address_line')} />
              </Field>
              <Field label="City" error={addressForm.formState.errors.city?.message}>
                <Input {...addressForm.register('city')} />
              </Field>
              <Field label="State" error={addressForm.formState.errors.state?.message}>
                <Input {...addressForm.register('state')} />
              </Field>
              <Field label="Zip code" error={addressForm.formState.errors.zip_code?.message}>
                <Input {...addressForm.register('zip_code')} />
              </Field>
              <div className="flex justify-end md:col-span-2">
                <Button type="submit" variant="secondary" disabled={addressMutation.isPending}>
                  Save address
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={orderColumns} data={myOrders} searchPlaceholder="Search my orders" />
    </div>
  )
}

export default VendorCheckoutPage
