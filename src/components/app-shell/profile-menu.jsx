import { LogOut, RefreshCw, Settings2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDemoResetMutation } from '@/services/api/hooks'
import { logout } from '@/store/auth-slice'

function initials(name) {
  return name
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export function ProfileMenu() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const resetMutation = useDemoResetMutation()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const preferencesPath = user?.role === 'admin' ? '/admin/settings' : `/${user?.role}`

  const handleReset = async () => {
    await resetMutation.mutateAsync()
    toast.success('Demo data has been restored.')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="subtle" className="h-11 rounded-2xl px-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-dark">{user?.name}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{user?.role}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Workspace actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate(preferencesPath)}>
          <Settings2 className="h-4 w-4" />
          {user?.role === 'admin' ? 'Preferences' : 'My dashboard'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
          Reset demo data
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
