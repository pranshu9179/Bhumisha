// import { LogOut, RefreshCw, Settings2 } from 'lucide-react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
// import { toast } from 'sonner'
// import { PreviewableImage } from '@/components/media/previewable-image'
// import { Avatar, AvatarFallback } from '@/components/ui/avatar'
// import { buttonVariants } from '@/components/ui/button'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { cn } from '@/lib/utils'
// import { useDemoResetMutation, useLogoutMutation } from '@/services/api/hooks'
// import { logout } from '@/store/auth-slice'

// function initials(name) {
//   return name
//     ?.split(' ')
//     .slice(0, 2)
//     .map((part) => part[0])
//     .join('')
// }

// export function ProfileMenu() {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const { user } = useSelector((state) => state.auth)
//   const resetMutation = useDemoResetMutation()
//   const logoutMutation = useLogoutMutation()

//   const handleLogout = async () => {
//     try {
//       await logoutMutation.mutateAsync()
//     } catch (error) {
//       toast.error(error.displayMessage || 'Server logout failed. Local session was cleared.')
//     } finally {
//       dispatch(logout())
//       navigate('/login')
//     }
//   }

//   const preferencesPath = user?.role === 'admin' ? '/admin/settings' : `/${user?.role}`

//   const handleReset = async () => {
//     await resetMutation.mutateAsync()
//     toast.success('Demo data has been restored.')
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <div role="button" tabIndex={0} className={cn(buttonVariants({ variant: 'subtle' }), 'h-11 rounded-2xl px-2')}>
//           {user?.avatar || user?.profile_image ? (
//             <PreviewableImage
//               src={user.avatar || user.profile_image}
//               alt={user?.name || 'Profile'}
//               className="h-9 w-9 rounded-full object-cover"
//               fallbackClassName="h-9 w-9 rounded-full"
//               previewTitle={`${user?.name || 'User'} profile image`}
//             />
//           ) : (
//             <Avatar className="h-9 w-9">
//               <AvatarFallback>{initials(user?.name)}</AvatarFallback>
//             </Avatar>
//           )}
//           <div className="hidden text-left md:block">
//             <p className="text-sm font-semibold text-dark">{user?.name}</p>
//             <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{user?.role}</p>
//           </div>
//         </div>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuLabel>Workspace actions</DropdownMenuLabel>
//         <DropdownMenuItem onClick={() => navigate(preferencesPath)}>
//           <Settings2 className="h-4 w-4" />
//           {user?.role === 'admin' ? 'Preferences' : 'My dashboard'}
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={handleReset}>
//           <RefreshCw className="h-4 w-4" />
//           Reset demo data
//         </DropdownMenuItem>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
//           <LogOut className="h-4 w-4" />
//           {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }





import { useRef, useState } from 'react'
import { LogOut, Camera } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useLogoutMutation, useProfileImageMutation } from '@/services/api/hooks'
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
  const fileInputRef = useRef(null)

  const { user } = useSelector((state) => state.auth)

  const logoutMutation = useLogoutMutation()
  const profileImageMutation = useProfileImageMutation()

  const [localPreview, setLocalPreview] = useState('')

  const imageSrc = localPreview || user?.avatar || user?.profile_image
  const hasImage = Boolean(user?.avatar || user?.profile_image || localPreview)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  // const handleImageChange = async (e) => {
  //   const file = e.target.files?.[0]
  //   if (!file) return

  //   const previewUrl = URL.createObjectURL(file)
  //   setLocalPreview(previewUrl)

  //   try {
  //     const result = await profileImageMutation.mutateAsync({
  //       profile_image: file,
  //     })

  //     toast.success('Profile image updated.')

  //     // If your API returns the updated user, you can sync redux here.
  //     // Example:
  //     // dispatch(setUser(result?.user || result?.data?.user || result?.data || result))
  //   } catch (error) {
  //     setLocalPreview('')
  //     toast.error(error?.displayMessage || 'Could not update profile image.')
  //   } finally {
  //     e.target.value = ''
  //   }
  // }

  const handleImageChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const previewUrl = URL.createObjectURL(file)
  setLocalPreview(previewUrl)

  try {
    const result = await profileImageMutation.mutateAsync({
      profile_image: file,
    })

    console.log('PROFILE UPDATE RESPONSE', result)

    const newImage =
      result?.user?.profile_image ||
      result?.data?.user?.profile_image ||
      result?.profile_image ||
      result?.data?.profile_image

    if (newImage) {
      const updatedUser = {
        ...user,
        avatar: newImage,
        profile_image: newImage,
      }

      localStorage.setItem(
        'auth-user',
        JSON.stringify(updatedUser),
      )
    }

    toast.success('Profile image updated.')
  } catch (error) {
    setLocalPreview('')
    toast.error(error?.displayMessage || 'Could not update profile image.')
  } finally {
    e.target.value = ''
  }
}
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      toast.error(error.displayMessage || 'Server logout failed. Local session was cleared.')
    } finally {
      dispatch(logout())
      navigate('/login')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            buttonVariants({ variant: 'subtle' }),
            'h-11 rounded-2xl px-2',
          )}
        >
          <div className="relative">
            {imageSrc ? (
              <PreviewableImage
                src={imageSrc}
                alt={user?.name || 'Profile'}
                className="h-9 w-9 rounded-full object-cover"
                fallbackClassName="h-9 w-9 rounded-full"
                previewTitle={`${user?.name || 'User'} profile image`}
              />
            ) : (
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials(user?.name)}</AvatarFallback>
              </Avatar>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                openFilePicker()
              }}
              className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow ring-1 ring-slate-200"
              aria-label={hasImage ? 'Update profile image' : 'Add profile image'}
            >
              <Camera className="h-3 w-3 text-slate-700" />
            </button>
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-dark">{user?.name}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{user?.role}</p>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Workspace actions</DropdownMenuLabel>

        <div className="flex items-center gap-3 px-2 pb-2">
          {imageSrc ? (
            <PreviewableImage
              src={imageSrc}
              alt={user?.name || 'Profile'}
              className="h-12 w-12 rounded-full object-cover"
              fallbackClassName="h-12 w-12 rounded-full"
              previewTitle={`${user?.name || 'User'} profile image`}
            />
          ) : (
            <Avatar className="h-12 w-12">
              <AvatarFallback>{initials(user?.name)}</AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-dark">{user?.name}</p>
            <p className="truncate text-xs uppercase tracking-[0.14em] text-slate-400">
              {user?.role}
            </p>
          </div>

          <button
            type="button"
            onClick={openFilePicker}
            className="rounded-full border px-3 py-1 text-xs font-medium"
          >
            {hasImage ? 'Update image' : 'Add image'}
          </button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </DropdownMenu>
  )
}
