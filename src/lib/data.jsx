import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { subscribe, updatePaths, setPath, removePath, newId, toList } from './store'
import { isFirebaseConfigured } from './firebase'
import { TODAY } from './format'

const DataCtx = createContext(null)

/**
 * Realtime Database shape (all under the `compass` root):
 *
 *   clients/{id}          { name, kind, referrer, amount, stage, date, dateKind,
 *                           lender, status, rate, lvr, docs, contact, createdAt,
 *                           log/{logId} { date, text, ts } }
 *   tasks/{id}            { cid, title, due, priority, done, focus, createdAt }
 *   notes/{id}            { title, body, updatedAt }
 *   goals/{id}            { type, tag, title, unit, target, month, parentId,
 *                           qTargets[4], logs/{logId} { date, amount, note } }
 *   assets/{id}           { name, kind, value }
 *   liabs/{id}            { name, kind, value }
 *   expenses/{id}         { date, bucket, cat, desc, amount }
 *   income/{id}           { date, bucket, cat, desc, amount }
 *   settings/partners/{id}  { name }   referral partners
 *   settings/lenders/{id}   { name }   banks / lenders
 *   settings/expCats/{id}   { name }   expense categories
 *   settings/incCats/{id}   { name }   income categories
 *   settings/buckets/{id}   { name }   businesses / income streams
 */

export function DataProvider({ children }) {
  const [raw, setRaw] = useState(null)

  useEffect(() => subscribe(setRaw), [])

  const value = useMemo(() => {
    const d = raw || {}
    const clients = toList(d.clients).map((c) => ({
      ...c,
      amount: Number(c.amount) || 0,
      log: toList(c.log).sort((a, b) => (b.ts || 0) - (a.ts || 0)),
    }))
    const goals = toList(d.goals).map((g) => ({
      ...g,
      target: Number(g.target) || 0,
      qTargets: g.qTargets || [0, 0, 0, 0],
      logs: toList(g.logs).map((l) => ({ ...l, amount: Number(l.amount) || 0 })),
    }))
    const money = (k) =>
      toList(d[k])
        .map((x) => ({ ...x, amount: Number(x.amount) || 0 }))
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))

    return {
      ready: raw !== null,
      clients,
      goals,
      tasks: toList(d.tasks).map((t) => ({ ...t, done: !!t.done, focus: !!t.focus })),
      notes: toList(d.notes).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
      assets: toList(d.assets).map((a) => ({ ...a, value: Number(a.value) || 0 })),
      liabs: toList(d.liabs).map((l) => ({ ...l, value: Number(l.value) || 0 })),
      expenses: money('expenses'),
      income: money('income'),
      partners: toList(d.settings?.partners),
      lenders: toList(d.settings?.lenders),
      expCats: toList(d.settings?.expCats),
      incCats: toList(d.settings?.incCats),
      buckets: toList(d.settings?.buckets),
    }
  }, [raw])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}

export function useData() {
  const ctx = useContext(DataCtx)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}

/* --------------------------------- writes -------------------------------- */

export function useApi() {
  return useMemo(
    () => ({
      /* clients */
      addClient(fields) {
        const id = newId()
        return setPath(`clients/${id}`, {
          name: '',
          kind: 'New enquiry',
          referrer: 'Direct',
          amount: 0,
          stage: 'Lead',
          date: TODAY,
          dateKind: 'first call',
          lender: '',
          status: 'New lead',
          rate: '—',
          lvr: '—',
          docs: '—',
          contact: '—',
          createdAt: Date.now(),
          ...fields,
        }).then(() => id)
      },
      updateClient: (id, patch) =>
        updatePaths(
          Object.fromEntries(Object.entries(patch).map(([k, v]) => [`clients/${id}/${k}`, v])),
        ),
      removeClient: (id, tasks) =>
        updatePaths({
          [`clients/${id}`]: null,
          ...Object.fromEntries(tasks.filter((t) => t.cid === id).map((t) => [`tasks/${t.id}`, null])),
        }),
      addClientLog: (cid, entry) => setPath(`clients/${cid}/log/${newId()}`, entry),
      removeClientLog: (cid, lid) => removePath(`clients/${cid}/log/${lid}`),

      /* tasks */
      addTask: (fields) => setPath(`tasks/${newId()}`, { createdAt: Date.now(), ...fields }),
      updateTask: (id, patch) =>
        updatePaths(Object.fromEntries(Object.entries(patch).map(([k, v]) => [`tasks/${id}/${k}`, v]))),
      removeTask: (id) => removePath(`tasks/${id}`),

      /* notes */
      addNote() {
        const id = newId()
        return setPath(`notes/${id}`, {
          title: 'Untitled note',
          body: '',
          updatedAt: Date.now(),
        }).then(() => id)
      },
      updateNote: (id, patch) =>
        updatePaths({
          ...Object.fromEntries(Object.entries(patch).map(([k, v]) => [`notes/${id}/${k}`, v])),
          [`notes/${id}/updatedAt`]: Date.now(),
        }),
      removeNote: (id) => removePath(`notes/${id}`),

      /* goals */
      addGoal: (fields) => setPath(`goals/${newId()}`, fields),
      removeGoal: (id, goals) =>
        updatePaths({
          [`goals/${id}`]: null,
          ...Object.fromEntries(
            goals.filter((g) => g.parentId === id).map((g) => [`goals/${g.id}/parentId`, '']),
          ),
        }),
      addGoalLog: (gid, entry) => setPath(`goals/${gid}/logs/${newId()}`, entry),
      removeGoalLog: (gid, lid) => removePath(`goals/${gid}/logs/${lid}`),

      /* balance sheet */
      addBalance: (kind, row) => setPath(`${kind}/${newId()}`, row),
      removeBalance: (kind, id) => removePath(`${kind}/${id}`),

      /* ledger */
      addEntry: (kind, row) => setPath(`${kind}/${newId()}`, row),
      removeEntry: (kind, id) => removePath(`${kind}/${id}`),

      /* settings lists: partners / expCats / incCats */
      addSetting: (list, name) => setPath(`settings/${list}/${newId()}`, { name }),
      renameSetting: (list, id, name) => setPath(`settings/${list}/${id}/name`, name),
      removeSetting: (list, id) => removePath(`settings/${list}/${id}`),

      /** Rename a partner everywhere it is referenced. */
      renamePartner: (id, from, to, clients) =>
        updatePaths({
          [`settings/partners/${id}/name`]: to,
          ...Object.fromEntries(
            clients.filter((c) => c.referrer === from).map((c) => [`clients/${c.id}/referrer`, to]),
          ),
        }),

      /** Rename a lender everywhere it is referenced. */
      renameLender: (id, from, to, clients) =>
        updatePaths({
          [`settings/lenders/${id}/name`]: to,
          ...Object.fromEntries(
            clients.filter((c) => c.lender === from).map((c) => [`clients/${c.id}/lender`, to]),
          ),
        }),

      /** Rename a business/bucket everywhere it is referenced. */
      renameBucket: (id, from, to, income, expenses) =>
        updatePaths({
          [`settings/buckets/${id}/name`]: to,
          ...Object.fromEntries(income.filter((r) => r.bucket === from).map((r) => [`income/${r.id}/bucket`, to])),
          ...Object.fromEntries(expenses.filter((r) => r.bucket === from).map((r) => [`expenses/${r.id}/bucket`, to])),
        }),

      /** Rename a category everywhere it is referenced. */
      renameCategory: (list, id, from, to, rows, kind) =>
        updatePaths({
          [`settings/${list}/${id}/name`]: to,
          ...Object.fromEntries(
            rows.filter((r) => r.cat === from).map((r) => [`${kind}/${r.id}/cat`, to]),
          ),
        }),
    }),
    [],
  )
}

export { isFirebaseConfigured }

/** Small helper for the many "controlled input with local echo" cases. */
export function useField(initial = '') {
  const [v, setV] = useState(initial)
  const onChange = useCallback((e) => setV(e.target.value), [])
  return [v, setV, onChange]
}
