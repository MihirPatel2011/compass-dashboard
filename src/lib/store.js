import { ref, onValue, update as fbUpdate, remove as fbRemove } from 'firebase/database'
import { db, isFirebaseConfigured, ROOT } from './firebase'

// ---------------------------------------------------------------------------
// A tiny path-based store with two interchangeable backends:
//
//   • Firebase Realtime Database (when `.env.local` is filled in)
//   • localStorage (identical API, so the app is fully usable before then)
//
// Paths are slash-delimited and relative to the dashboard root, e.g.
// `clients/-Nabc123/stage`.
// ---------------------------------------------------------------------------

const LS_KEY = 'compass-dashboard'

/* ----------------------------- local backend ----------------------------- */

const listeners = new Set()
let localCache = null

function readLocal() {
  if (localCache) return localCache
  try {
    localCache = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    localCache = {}
  }
  return localCache
}

function writeLocal(next) {
  localCache = next
  localStorage.setItem(LS_KEY, JSON.stringify(next))
  listeners.forEach((fn) => fn(next))
}

function setIn(obj, path, value) {
  const parts = path.split('/').filter(Boolean)
  const next = { ...obj }
  let cursor = next
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    cursor[k] = cursor[k] && typeof cursor[k] === 'object' ? { ...cursor[k] } : {}
    cursor = cursor[k]
  }
  const last = parts[parts.length - 1]
  if (value === null || value === undefined) delete cursor[last]
  else cursor[last] = value
  return next
}

/* ------------------------------ public API ------------------------------- */

export function subscribe(callback) {
  if (isFirebaseConfigured) {
    return onValue(ref(db, ROOT), (snap) => callback(snap.val() || {}))
  }
  callback(readLocal())
  listeners.add(callback)
  return () => listeners.delete(callback)
}

/** Write a batch of absolute paths in one atomic-ish operation. */
export function updatePaths(patch) {
  if (isFirebaseConfigured) {
    return fbUpdate(ref(db, ROOT), patch)
  }
  let next = readLocal()
  Object.entries(patch).forEach(([path, value]) => {
    next = setIn(next, path, value)
  })
  writeLocal(next)
  return Promise.resolve()
}

export function setPath(path, value) {
  return updatePaths({ [path]: value })
}

export function removePath(path) {
  if (isFirebaseConfigured) return fbRemove(ref(db, `${ROOT}/${path}`))
  writeLocal(setIn(readLocal(), path, null))
  return Promise.resolve()
}

/** Realtime-DB-style push key: chronologically sortable and collision-safe. */
const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
let lastPushTime = 0
let lastRandChars = []

export function newId() {
  let now = Date.now()
  const duplicate = now === lastPushTime
  lastPushTime = now

  const timeChars = new Array(8)
  for (let i = 7; i >= 0; i--) {
    timeChars[i] = PUSH_CHARS.charAt(now % 64)
    now = Math.floor(now / 64)
  }
  let id = timeChars.join('')

  if (!duplicate) {
    for (let i = 0; i < 12; i++) lastRandChars[i] = Math.floor(Math.random() * 64)
  } else {
    let i = 11
    for (; i >= 0 && lastRandChars[i] === 63; i--) lastRandChars[i] = 0
    lastRandChars[i]++
  }
  for (let i = 0; i < 12; i++) id += PUSH_CHARS.charAt(lastRandChars[i])
  return id
}

/** Turn a Firebase map ({id: {...}}) into a sorted array of {id, ...}. */
export function toList(map, sortKey) {
  if (!map) return []
  const arr = Object.entries(map).map(([id, v]) => ({ ...v, id }))
  if (sortKey) {
    arr.sort((a, b) => String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? '')))
  }
  return arr
}
