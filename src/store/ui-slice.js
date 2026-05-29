import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    mobileSidebarOpen: false,
    notificationsOpen: false,
    activeFilters: {},
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setMobileSidebarOpen(state, action) {
      state.mobileSidebarOpen = action.payload
    },
    setNotificationsOpen(state, action) {
      state.notificationsOpen = action.payload
    },
    setActiveFilter(state, action) {
      const { key, value } = action.payload
      state.activeFilters[key] = value
    },
  },
})

export const { setActiveFilter, setMobileSidebarOpen, setNotificationsOpen, toggleSidebar } = uiSlice.actions
export const uiReducer = uiSlice.reducer
