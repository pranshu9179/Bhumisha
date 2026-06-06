import { zodResolver } from '@hookform/resolvers/zod'
import { Edit3, Power, ShieldCheck, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { Field } from '@/components/forms/field'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { DeleteActionButton } from '@/features/shared/components/delete-action-button'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { formatDate } from '@/lib/format'
import { useUserDeleteMutation, useUserRoleMutation, useUserSaveMutation, useUserStatusToggleMutation, useUsers } from '@/services/api/hooks'

const schema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email('Valid email required').or(z.literal('')).optional(),
  role: z.string().min(1, 'Role is required'),
  status: z.string().min(1, 'Status is required'),
  phone: z.string().min(8, 'Phone is required'),
  region: z.string().optional(),
  company: z.string().optional(),
  specialty: z.string().optional(),
  department: z.string().optional(),
})

function initials(name) {
  return name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function UserDialog({ open, onOpenChange, initialUser, fixedRole }) {
  const mutation = useUserSaveMutation()
  const roleMutation = useUserRoleMutation()
  const statusMutation = useUserStatusToggleMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      role: fixedRole || 'employee',
      status: 'active',
      phone: '',
      region: '',
      company: '',
      specialty: '',
      department: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: initialUser?.name || '',
        username: initialUser?.username || '',
        email: initialUser?.email || '',
        role: initialUser?.role || fixedRole || 'employee',
        status: initialUser?.status || 'active',
        phone: initialUser?.phone || '',
        region: initialUser?.region || '',
        company: initialUser?.company || '',
        specialty: initialUser?.specialty || '',
        department: initialUser?.department || '',
      })
    }
  }, [fixedRole, initialUser, open, reset])

  const onSubmit = async (values) => {
    const { role, status, ...profileValues } = values

    await mutation.mutateAsync({
      id: initialUser?.id,
      payload: initialUser ? profileValues : values,
    })

    if (initialUser?.id && role !== initialUser.role) {
      await roleMutation.mutateAsync({ id: initialUser.id, role })
    }

    if (initialUser?.id && status !== initialUser.status) {
      await statusMutation.mutateAsync(initialUser.id)
    }

    toast.success(initialUser ? 'User updated successfully.' : 'User added successfully.')
    onOpenChange(false)
  }

  const isSaving = mutation.isPending || roleMutation.isPending || statusMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialUser ? 'Edit user profile' : 'Add new user'}</DialogTitle>
          <DialogDescription>Manage access-ready demo users for role-based workflows.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Name" error={errors.name?.message}>
            <Input {...register('name')} />
          </Field>
          <Field label="Username" error={errors.username?.message}>
            <Input {...register('username')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...register('email')} />
          </Field>
          <Field label="Role" error={errors.role?.message}>
            <NativeSelect {...register('role')} disabled={Boolean(fixedRole)}>
              <option value="admin">Admin</option>
              <option value="expert">Expert</option>
              <option value="employee">Employee</option>
              <option value="vendor">Vendor</option>
            </NativeSelect>
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <NativeSelect {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </NativeSelect>
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register('phone')} />
          </Field>
          <Field label="Region" error={errors.region?.message}>
            <Input {...register('region')} />
          </Field>
          <Field label="Company">
            <Input {...register('company')} />
          </Field>
          <Field label="Specialty / Department">
            <Input
              {...register(fixedRole === 'expert' ? 'specialty' : fixedRole === 'employee' ? 'department' : 'company')}
            />
          </Field>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save user'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PeopleDirectoryPage({
  title,
  description,
  roleFilter,
  verifyMode = false,
  actionLabel = 'Add user',
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const { data = [] } = useUsers(roleFilter ? { role: roleFilter } : {})
  const mutation = useUserSaveMutation()
  const roleMutation = useUserRoleMutation()
  const statusMutation = useUserStatusToggleMutation()
  const deleteMutation = useUserDeleteMutation()

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
            onChange={(event) =>
              roleMutation
                .mutateAsync({ id: row.original.id, role: event.target.value })
                .then(() => toast.success('Role updated successfully.'))
            }
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
        cell: ({ row }) => formatDate(row.original.lastActive, 'DD MMM · hh:mm A'),
      },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.name} details`}
              description="Profile data available for this workspace user."
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
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                setEditingUser(row.original)
                setDialogOpen(true)
              }}
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
            <DeleteActionButton
              confirmMessage={`Delete ${row.original.name} from the demo workspace?`}
              onDelete={() =>
                deleteMutation
                  .mutateAsync(row.original.id)
                  .then(() => toast.success('User deleted successfully.'))
              }
            />
            {verifyMode ? (
              <Button
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  return mutation
                    .mutateAsync({
                      id: row.original.id,
                      payload: { approvalStatus: 'approved', status: 'active' },
                    })
                    .then(() => toast.success('Vendor approved.'))
                }}
              >
                <ShieldCheck className="h-4 w-4" />
                Approve
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [deleteMutation, mutation, roleMutation, statusMutation, verifyMode],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title={title}
        description={description}
        compact
        actions={
          <Button
            onClick={() => {
              setEditingUser(null)
              setDialogOpen(true)
            }}
          >
            <UserPlus className="h-4 w-4" />
            {actionLabel}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder={`Search ${title.toLowerCase()}`}
        emptyMessage={`No ${title.toLowerCase()} available.`}
      />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialUser={editingUser}
        fixedRole={roleFilter}
      />
    </div>
  )
}

export function UsersPage() {
  return (
    <PeopleDirectoryPage
      title="User directory"
      description="Manage all demo accounts, role assignments, activation status, and contact details."
    />
  )
}

export function ExpertsPage() {
  return (
    <PeopleDirectoryPage
      title="Expert network"
      description="Track agronomy experts, specialties, and current advisory staffing coverage."
      roleFilter="expert"
      actionLabel="Add expert"
    />
  )
}

export function EmployeesPage() {
  return (
    <PeopleDirectoryPage
      title="Employee operations"
      description="Coordinate support staff, monitoring specialists, and vendor support owners."
      roleFilter="employee"
      actionLabel="Add employee"
    />
  )
}

export function VendorsPage() {
  return (
    <PeopleDirectoryPage
      title="Vendor verification"
      description="Approve marketplace vendors, review KYC-like metadata, and activate their storefront workspace."
      roleFilter="vendor"
      verifyMode
      actionLabel="Add vendor"
    />
  )
}
