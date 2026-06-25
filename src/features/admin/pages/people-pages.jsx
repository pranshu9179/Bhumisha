import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUp, Plus, Power, UserPlus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Field } from '@/components/forms/field'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { VendorRegistrationForm } from '@/features/vendor/pages/commerce/vendor-store-setup-page'
import { formatDate } from '@/lib/format'
import { useAdminUserCreateMutation, useUserRoleMutation, useUserStatusToggleMutation, useUsers } from '@/services/api/hooks'

const createUserSchema = z.object({
  username: z.string().trim().min(2, 'Username is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Vendor', 'Expert', 'Employee']),
  profile_image: z
    .any()
    .optional()
    .refine((files) => !files?.length || files[0].size <= 50 * 1024 * 1024, 'Profile image must be 50MB or smaller'),
})

function toApiCreateRole(role) {
  const roleMap = {
    vendor: 'Vendor',
    expert: 'Expert',
    employee: 'Employee',
  }
  return roleMap[String(role || '').toLowerCase()] || 'Expert'
}

function initials(name) {
  return name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function CreateUserDialog({ defaultRole = 'Expert' }) {
  const [open, setOpen] = useState(false)
  const mutation = useAdminUserCreateMutation()
  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      phone: '',
      password: '',
      role: defaultRole,
      profile_image: undefined,
    },
  })

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen)
    if (nextOpen) {
      form.reset({
        username: '',
        phone: '',
        password: '',
        role: defaultRole,
        profile_image: undefined,
      })
    }
  }

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values)
      toast.success(`${values.role} account created successfully.`)
      handleOpenChange(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to create account.')
    }
  }

  return (
    <>
      <Button type="button" onClick={() => handleOpenChange(true)}>
        <Plus className="h-4 w-4" />
        Add user
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>Create a vendor, expert, or employee account using the documented register API.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Username" error={form.formState.errors.username?.message}>
              <Input placeholder="Enter username" {...form.register('username')} />
            </Field>
            <Field label="Phone number" error={form.formState.errors.phone?.message}>
              <Input inputMode="numeric" placeholder="9876543210" {...form.register('phone')} />
            </Field>
            <Field label="Password" error={form.formState.errors.password?.message}>
              <Input type="password" placeholder="Minimum 6 characters" {...form.register('password')} />
            </Field>
            <Field label="Role" error={form.formState.errors.role?.message}>
              <NativeSelect {...form.register('role')}>
                <option value="Vendor">Vendor</option>
                <option value="Expert">Expert</option>
                <option value="Employee">Employee</option>
              </NativeSelect>
            </Field>
            <Field label="Profile image" hint="Optional JPEG, PNG, or JPG up to 50MB." error={form.formState.errors.profile_image?.message}>
              <div className="relative">
                <ImageUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-11" type="file" accept="image/jpeg,image/png,image/jpg" {...form.register('profile_image')} />
              </div>
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                <UserPlus className="h-4 w-4" />
                {mutation.isPending ? 'Creating...' : 'Create user'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PeopleDirectoryPage({ title, description, roleFilter, verifyMode = false }) {
  const { data = [] } = useUsers(roleFilter ? { role: roleFilter } : {})
  const roleMutation = useUserRoleMutation()
  const statusMutation = useUserStatusToggleMutation()
  const createDefaultRole = toApiCreateRole(roleFilter)
  const [vendorRegistrationUser, setVendorRegistrationUser] = useState(null)

  const handleRoleChange = useCallback(
    async (user, nextRole) => {
      if (nextRole === user.role) return
      if (nextRole === 'vendor') {
        setVendorRegistrationUser(user)
        return
      }

      try {
        await roleMutation.mutateAsync({ id: user.id, role: nextRole })
        toast.success('Role updated successfully.')
      } catch (error) {
        toast.error(error.displayMessage || 'Unable to update role.')
      }
    },
    [roleMutation],
  )

  const columns = useMemo(
    () => [
      {
        header: 'User',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.avatar || row.original.profile_image ? (
              <PreviewableImage
                src={row.original.avatar || row.original.profile_image}
                alt={row.original.name || 'User profile'}
                className="h-10 w-10 rounded-full object-cover"
                fallbackClassName="h-10 w-10 rounded-full"
                previewTitle={`${row.original.name || 'User'} profile image`}
              />
            ) : (
              <Avatar>
                <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-semibold text-dark">{row.original.name}</p>
              <p className="text-xs text-slate-400">{row.original.email || row.original.username || row.original.phone}</p>
            </div>
          </div>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ row }) => (
          <NativeSelect
            value={row.original.role}
            className="h-9 w-32 rounded-xl"
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => handleRoleChange(row.original, event.target.value)}
            disabled={roleMutation.isPending}
          >
            <option value="admin">Admin</option>
            <option value="expert">Expert</option>
            <option value="employee">Employee</option>
            <option value="vendor">Vendor</option>
            <option value="user">User</option>
          </NativeSelect>
        ),
      },
      {
        header: 'Status',
        accessorKey: verifyMode ? 'approvalStatus' : 'status',
        cell: ({ row }) => <StatusBadge value={verifyMode ? row.original.approvalStatus : row.original.status} />,
      },
      { header: 'Region', accessorKey: 'region' },
      { header: 'Phone', accessorKey: 'phone' },
      {
        header: 'Last active',
        accessorKey: 'lastActive',
        cell: ({ row }) => formatDate(row.original.lastActive, 'DD MMM - hh:mm A'),
      },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} details`}
              description="Profile data returned by the documented users endpoint."
              record={row.original}
            />
            <Button
              size="sm"
              variant={row.original.status === 'active' ? 'secondary' : 'accent'}
              onClick={(event) => {
                event.stopPropagation()
                return statusMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('User status updated successfully.'))
              }}
              disabled={statusMutation.isPending}
            >
              <Power className="h-4 w-4" />
              {row.original.status === 'active' ? 'Disable' : 'Activate'}
            </Button>
          </div>
        ),
      },
    ],
    [handleRoleChange, roleMutation.isPending, statusMutation, verifyMode],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title={title}
        description={description}
        actions={<CreateUserDialog defaultRole={createDefaultRole} />}
        compact
      />

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder={`Search ${title.toLowerCase()}`}
        emptyMessage={`No ${title.toLowerCase()} available.`}
      />

      <Dialog open={Boolean(vendorRegistrationUser)} onOpenChange={(open) => !open && setVendorRegistrationUser(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Register vendor profile</DialogTitle>
            <DialogDescription>
              Complete the vendor registration form before changing {vendorRegistrationUser?.name || 'this user'} to a vendor account.
            </DialogDescription>
          </DialogHeader>
          {vendorRegistrationUser ? (
            <VendorRegistrationForm
              key={vendorRegistrationUser.id}
              loadProfile={false}
              targetUser={vendorRegistrationUser}
              showHeader={false}
              frame={false}
              submitLabel="Create vendor account"
              successMessage="Vendor account created successfully."
              onSuccess={() => {
                setVendorRegistrationUser(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function UsersPage() {
  return (
    <PeopleDirectoryPage
      title="User directory"
      description="View users and use documented role/status endpoints."
    />
  )
}

export function ExpertsPage() {
  return (
    <PeopleDirectoryPage
      title="Expert network"
      description="View experts and manage documented account status controls."
      roleFilter="expert"
    />
  )
}

export function EmployeesPage() {
  return (
    <PeopleDirectoryPage
      title="Employee operations"
      description="View employees and manage documented account status controls."
      roleFilter="employee"
    />
  )
}

export function VendorsPage() {
  return (
    <PeopleDirectoryPage
      title="Vendor verification"
      description="View vendor accounts returned by documented user APIs."
      roleFilter="vendor"
      verifyMode
    />
  )
}
