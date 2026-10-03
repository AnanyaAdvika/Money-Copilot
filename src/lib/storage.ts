import { STORAGE_KEYS, type AppSettings } from '@/types'
import {
  createSampleBudgets,
  createSampleGoals,
  createSampleRecurring,
  createSampleTransactions,
  defaultSettings,
} from '@/data/sampleData'

function scopedKey(key: string, userId?: string) {
  return userId ? `mc_user_${userId}_${key}` : key
}

export function loadJSON<T>(key: string, fallback: T, userId?: string): T {
  try {
    const raw = localStorage.getItem(scopedKey(key, userId))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T, userId?: string): void {
  localStorage.setItem(scopedKey(key, userId), JSON.stringify(value))
}

export function initializeStorage(userId?: string, userName?: string) {
  const settings = loadJSON<AppSettings | null>(STORAGE_KEYS.settings, null, userId)

  if (!settings) {
    const sampleTx = createSampleTransactions()
    const sampleBudgets = createSampleBudgets()
    const sampleGoals = createSampleGoals()
    const sampleRecurring = createSampleRecurring()
    const initialSettings = { ...defaultSettings, userName: userName || defaultSettings.userName }

    saveJSON(STORAGE_KEYS.transactions, sampleTx, userId)
    saveJSON(STORAGE_KEYS.budgets, sampleBudgets, userId)
    saveJSON(STORAGE_KEYS.goals, sampleGoals, userId)
    saveJSON(STORAGE_KEYS.recurring, sampleRecurring, userId)
    saveJSON(STORAGE_KEYS.settings, initialSettings, userId)

    return {
      transactions: sampleTx,
      budgets: sampleBudgets,
      goals: sampleGoals,
      recurring: sampleRecurring,
      settings: initialSettings,
    }
  }

  return {
    transactions: loadJSON(STORAGE_KEYS.transactions, [], userId),
    budgets: loadJSON(STORAGE_KEYS.budgets, [], userId),
    goals: loadJSON(STORAGE_KEYS.goals, [], userId),
    recurring: loadJSON(STORAGE_KEYS.recurring, [], userId),
    settings,
  }
}

export function clearDemoData(userId?: string) {
  const tx = loadJSON(STORAGE_KEYS.transactions, [] as { isDemo?: boolean }[], userId)
  saveJSON(STORAGE_KEYS.transactions, tx.filter((t) => !t.isDemo), userId)
  const settings = loadJSON(STORAGE_KEYS.settings, defaultSettings, userId)
  saveJSON(STORAGE_KEYS.settings, { ...settings, demoDataLoaded: false }, userId)
}

export function resetToSampleData(userId?: string) {
  saveJSON(STORAGE_KEYS.transactions, createSampleTransactions(), userId)
  saveJSON(STORAGE_KEYS.budgets, createSampleBudgets(), userId)
  saveJSON(STORAGE_KEYS.goals, createSampleGoals(), userId)
  saveJSON(STORAGE_KEYS.recurring, createSampleRecurring(), userId)
  saveJSON(STORAGE_KEYS.settings, { ...defaultSettings, demoDataLoaded: true }, userId)
}
