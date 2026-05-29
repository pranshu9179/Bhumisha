import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/store/auth-slice'
import { preferencesReducer } from '@/store/preferences-slice'
import { savePreferences, saveSession } from '@/store/storage'
import { uiReducer } from '@/store/ui-slice'

export function createAppStore(preloadedState) {
  const appStore = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      preferences: preferencesReducer,
    },
    preloadedState,
  })

  appStore.subscribe(() => {
    const state = appStore.getState()
    saveSession(state.auth.session)
    savePreferences(state.preferences)
  })

  return appStore
}

export const store = createAppStore()
