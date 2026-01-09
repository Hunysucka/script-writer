import type { AppState, AppAction } from '@/types'

export const initialState: AppState = {
  reports: [],
  scripts: [],
  activeJob: null,
  isLoading: false,
  error: null,
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_REPORTS':
      return { ...state, reports: action.payload }

    case 'ADD_REPORT':
      return { ...state, reports: [action.payload, ...state.reports] }

    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      }

    case 'DELETE_REPORT':
      return {
        ...state,
        reports: state.reports.filter((r) => r.id !== action.payload),
      }

    case 'SET_SCRIPTS':
      return { ...state, scripts: action.payload }

    case 'ADD_SCRIPT':
      return { ...state, scripts: [action.payload, ...state.scripts] }

    case 'UPDATE_SCRIPT':
      return {
        ...state,
        scripts: state.scripts.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      }

    case 'DELETE_SCRIPT':
      return {
        ...state,
        scripts: state.scripts.filter((s) => s.id !== action.payload),
      }

    case 'SET_ACTIVE_JOB':
      return { ...state, activeJob: action.payload }

    case 'UPDATE_JOB_PROGRESS':
      if (!state.activeJob) return state
      return {
        ...state,
        activeJob: {
          ...state.activeJob,
          progress: action.payload.progress,
          status: action.payload.status ?? state.activeJob.status,
        },
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    default:
      return state
  }
}
