import { createSlice } from '@reduxjs/toolkit'
import { loadSession } from '@/store/storage'

const initialSession = loadSession()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    session: initialSession,
    user: initialSession?.user ?? null,
    redirectTo: initialSession?.user ? `/${initialSession.user.role}` : '/login',
  },
  reducers: {
    setSession(state, action) {
      state.session = action.payload
      state.user = action.payload?.user ?? null
      state.redirectTo = action.payload?.user ? `/${action.payload.user.role}` : '/login'
    },
    setRedirectTo(state, action) {
      state.redirectTo = action.payload
    },
    logout(state) {
      state.session = null
      state.user = null
      state.redirectTo = '/login'
    },
  },
})

export const { logout, setRedirectTo, setSession } = authSlice.actions
export const authReducer = authSlice.reducer
