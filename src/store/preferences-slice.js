import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { loadPreferences } from '@/store/storage'

const storedPreferences = loadPreferences()

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: storedPreferences ?? {
    tablePageSize: DEFAULT_PAGE_SIZE,
    density: 'comfortable',
  },
  reducers: {
    setTablePageSize(state, action) {
      state.tablePageSize = action.payload
    },
    setDensity(state, action) {
      state.density = action.payload
    },
  },
})

export const { setDensity, setTablePageSize } = preferencesSlice.actions
export const preferencesReducer = preferencesSlice.reducer
