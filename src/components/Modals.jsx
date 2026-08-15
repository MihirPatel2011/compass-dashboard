import { useEffect, useState } from 'react'
import Modal from './Modal'
import { useData, useApi } from '../lib/data'
import { C, mono, sans, serif, input, inputWhite, btnDark, btnGhost, labelSm, segment, segmentWrap } from '../lib/theme'
import { Empty, XDel, clickable } from '../components/ui'
import { rolledLogs } from '../lib/goals'
import { TODAY, THIS_MONTH, dateLabel, unitVal } from '../lib/format'

const fieldLabel = { display: 'flex', flexDirection: 'column', gap: 6, ...labelSm }
const textInput = {
  padding: '11px 13px',
  border: `1px solid ${C.field}`,
  borderRadius: 9,
  background: C.cardTint,
  fontFamily: sans,
  fontSize: 14,
  letterSpacing: 0,
  textTransform: 'none',
  color: C.ink,
}

export default function Modals({ modal, closeModal }) {
  const d = useData()
  if (!modal) return null

  const goal = modal.goalId ? d.goals.find((g) => g.id === modal.goalId) : null

  return (
    <>
      <NewGoalModal open={modal.kind === 'newGoal'} close={closeModal} />
      <LogModal open={modal.kind === 'log'} goal={goal} close={closeModal} />
      <HistoryModal open={modal.kind === 'history'} goal={goal} close={closeModal} />
      <PartnersModal open={modal.kind === 'partners'} close={closeModal} />
      <CatsModal open={modal.kind === 'cats'} listKind={modal.listKind} close={closeModal} />
    </>
  )
}

/* ------------------------------- new goal -------------------------------- */

function NewGoalModal({ open, close }) {
  const d = useData()
  const api = useApi()
  const annual = d.goals.filter((g) => g.type === 'annual')
  const full = annual.length >= 3

  const [type, setType] = useState('annual')
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('money')
  const [month, setMonth] = useState(THIS_MONTH)
  const [link, setLink] = useState(false)
  const [parent, setParent] = useState('')

  useEffect(() => {
    if (!open) return
    setType(full ? 'monthly' : 'annual')
    setLink(full && annual.length > 0)
    setParent(annual[0]?.id || '')
    setTitle('')
    setTag('')
    setTarget('')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    const t = title.trim()
    const tgt = parseFloat(String(target).replace(/[^0-9.]/g, ''))
    if (!t || !tgt) return
    const monthly = type === 'monthly'
    if (!monthly && full) return
    const q = tgt / 4
    api.addGoal({
      type: monthly ? 'monthly' : 'annual',
      tag: tag.trim() || 'Personal',
      title: t,
      unit,
      target: tgt,
      month: monthly ? month : '',
      parentId: monthly && link ? parent || annual[0]?.id || '' : '',
      qTargets: monthly ? [0, 0, 0, 0] : [q, q, q, q],
    })
    close()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New goal"
      sub="Yearly goals track quarters. Monthly goals can roll into a yearly one."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...segmentWrap, width: 'fit-content' }}>
          <div
            {...clickable(() => !full && setType('annual'))}
            style={{ ...segment(type === 'annual'), ...(full ? { opacity: 0.42 } : null) }}
          >
            {full ? 'Yearly (3 of 3)' : 'Yearly goal'}
          </div>
          <div {...clickable(() => setType('monthly'))} style={segment(type === 'monthly')}>
            Monthly goal
          </div>
        </div>
        {full && (
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
            Three yearly goals is the limit — clear one to add another.
          </div>
        )}

        <label style={fieldLabel}>
          Goal
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Settle $18M in loans" style={textInput} />
        </label>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ ...fieldLabel, flex: '1 1 130px' }}>
            Area
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Mortgage broking" style={{ ...textInput, fontSize: 13, padding: '10px 12px' }} />
          </label>
          <label style={{ ...fieldLabel, flex: '0 1 120px' }}>
            Target
            <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="5000000" style={{ ...textInput, fontFamily: mono, fontSize: 13, padding: '10px 12px' }} />
          </label>
          <label style={{ ...fieldLabel, flex: '0 1 120px' }}>
            Measured in
            <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ ...textInput, fontSize: 13, padding: '10px 11px' }}>
              <option value="money">Dollars</option>
              <option value="count">Count</option>
            </select>
          </label>
        </div>

        {type === 'monthly' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              padding: 16,
              borderRadius: 11,
              background: C.cardTint,
              border: '1px solid #eee7da',
            }}
          >
            <label style={fieldLabel}>
              Month
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...textInput, background: C.card, fontSize: 13, padding: '10px 12px' }} />
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, cursor: 'pointer', lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={link}
                onChange={(e) => setLink(e.target.checked)}
                disabled={!annual.length}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: C.accent }}
              />
              <span>
                {annual.length
                  ? 'Roll this into a yearly goal — progress logged here counts toward it and its quarter.'
                  : 'Create a yearly goal first to roll monthly progress into it.'}
              </span>
            </label>
            {link && annual.length > 0 && (
              <select value={parent} onChange={(e) => setParent(e.target.value)} style={{ ...inputWhite, padding: '10px 11px', borderRadius: 9, fontSize: 13 }}>
                {annual.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button onClick={close} style={{ ...btnGhost, padding: '10px 16px', borderRadius: 9, fontSize: 12.5 }}>
            Cancel
          </button>
          <button onClick={save} style={{ ...btnDark, padding: '10px 20px', borderRadius: 9 }}>
            Create goal
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* --------------------------------- log ----------------------------------- */

function LogModal({ open, goal, close }) {
  const api = useApi()
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(TODAY)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setAmount('')
      setNote('')
      setDate(TODAY)
    }
  }, [open])

  const save = () => {
    const amt = parseFloat(String(amount).replace(/[^0-9.-]/g, ''))
    if (!goal || !amt) return
    api.addGoalLog(goal.id, { date: date || TODAY, amount: amt, note: note.trim() || 'Logged' })
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Log progress" sub={goal?.title || ''}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ ...fieldLabel, flex: '0 1 140px' }}>
            {goal?.unit === 'money' ? 'Amount $' : 'How many'}
            <input value={amount} onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} style={{ ...textInput, fontFamily: mono }} />
          </label>
          <label style={{ ...fieldLabel, flex: '0 1 160px' }}>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...textInput, fontSize: 13, padding: '10px 12px' }} />
          </label>
        </div>
        <label style={fieldLabel}>
          What was it
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="e.g. Two refinances settled"
            style={{ ...textInput, fontSize: 13.5 }}
          />
        </label>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button onClick={close} style={{ ...btnGhost, padding: '10px 16px', borderRadius: 9, fontSize: 12.5 }}>
            Cancel
          </button>
          <button onClick={save} style={{ ...btnDark, padding: '10px 20px', borderRadius: 9 }}>
            Save entry
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ------------------------------- history --------------------------------- */

function HistoryModal({ open, goal, close }) {
  const d = useData()
  const api = useApi()
  if (!open) return null

  const logs = goal ? rolledLogs(goal, d.goals).sort((a, b) => (b.date || '').localeCompare(a.date || '')) : []
  const total = logs.reduce((a, l) => a + l.amount, 0)

  return (
    <Modal open={open} onClose={close} title="History" sub={goal?.title || ''}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {logs.map((l) => (
          <div key={l.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${C.lineFaint}` }}>
            <span style={{ fontFamily: mono, fontSize: 10.5, color: C.muted, flex: '0 0 52px' }}>{dateLabel(l.date)}</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.note}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{l.src}</span>
            </div>
            <span style={{ fontFamily: mono, fontSize: 12.5, whiteSpace: 'nowrap' }}>{unitVal(goal.unit, l.amount)}</span>
            <XDel size={15} onClick={() => api.removeGoalLog(l.goalId, l.id)} />
          </div>
        ))}
        {!logs.length && <Empty style={{ padding: 0 }}>Nothing logged against this goal yet.</Empty>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 8 }}>
          <span style={{ fontSize: 12.5, color: C.muted }}>{logs.length} entries</span>
          <span style={{ fontFamily: serif, fontSize: 22 }}>{goal ? unitVal(goal.unit, total) : ''}</span>
        </div>
      </div>
    </Modal>
  )
}

/* ------------------------- editable name lists --------------------------- */

function NameList({ items, onRename, onRemove, onAdd, placeholder, countFor, emptyNote }) {
  const [draft, setDraft] = useState('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it) => (
        <div key={it.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            defaultValue={it.name}
            onBlur={(e) => e.target.value.trim() && e.target.value !== it.name && onRename(it, e.target.value.trim())}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            style={{ ...input, flex: 1, padding: '9px 11px', fontSize: 13 }}
          />
          <span style={{ fontFamily: mono, fontSize: 10.5, color: C.muted, flex: '0 0 66px', textAlign: 'right' }}>
            {countFor(it)}
          </span>
          <XDel onClick={() => onRemove(it)} />
        </div>
      ))}
      {!items.length && <Empty style={{ padding: 0 }}>{emptyNote}</Empty>}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingTop: 14, borderTop: `1px solid ${C.lineSoft}` }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              onAdd(draft.trim())
              setDraft('')
            }
          }}
          placeholder={placeholder}
          style={{ ...input, flex: 1, padding: '10px 12px', fontSize: 13 }}
        />
        <button
          onClick={() => {
            if (!draft.trim()) return
            onAdd(draft.trim())
            setDraft('')
          }}
          style={{ ...btnDark, padding: '10px 18px' }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

function PartnersModal({ open, close }) {
  const d = useData()
  const api = useApi()
  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={close}
      title="Referral partners"
      sub="Rename, remove, or add partners — they appear in every referrer dropdown."
    >
      <NameList
        items={d.partners}
        countFor={(p) => `${d.clients.filter((c) => c.referrer === p.name).length} files`}
        onRename={(p, name) => api.renamePartner(p.id, p.name, name, d.clients)}
        onRemove={(p) => api.removeSetting('partners', p.id)}
        onAdd={(name) => api.addSetting('partners', name)}
        placeholder="Add a referral partner…"
        emptyNote="No partners yet — add “Direct”, “Repeat client”, or an agency to get going."
      />
    </Modal>
  )
}

function CatsModal({ open, listKind, close }) {
  const d = useData()
  const api = useApi()
  if (!open) return null

  const config = {
    expenses: {
      list: 'expCats',
      items: d.expCats,
      title: 'Expense categories',
      sub: 'Rename, remove, or add categories — they apply to every entry and every total.',
      placeholder: 'Add a category…',
      empty: 'No expense categories yet — try “Software & subscriptions” or “Referral fees”.',
      countFor: (it) => `${d.expenses.filter((r) => r.cat === it.name).length} entries`,
      rename: (it, name) => api.renameCategory('expCats', it.id, it.name, name, d.expenses, 'expenses'),
    },
    income: {
      list: 'incCats',
      items: d.incCats,
      title: 'Income categories',
      sub: 'Rename, remove, or add categories — they apply to every entry and every total.',
      placeholder: 'Add a category…',
      empty: 'No income categories yet — try “Commissions”, “Store sales”, or “Rent”.',
      countFor: (it) => `${d.income.filter((r) => r.cat === it.name).length} entries`,
      rename: (it, name) => api.renameCategory('incCats', it.id, it.name, name, d.income, 'income'),
    },
    buckets: {
      list: 'buckets',
      items: d.buckets,
      title: 'Businesses',
      sub: 'Each business gets its own monthly P&L and annualised run rate.',
      placeholder: 'Add a business or income stream…',
      empty: 'No businesses yet — add one so entries can be split by where the money came from.',
      countFor: (it) =>
        `${d.income.filter((r) => r.bucket === it.name).length + d.expenses.filter((r) => r.bucket === it.name).length} entries`,
      rename: (it, name) => api.renameBucket(it.id, it.name, name, d.income, d.expenses),
    },
    lenders: {
      list: 'lenders',
      items: d.lenders,
      title: 'Banks & lenders',
      sub: 'Rename, remove, or add lenders — they appear in the lender dropdown on every file.',
      placeholder: 'Add a bank or lender…',
      empty: 'No lenders yet — add the banks you actually write to, e.g. CBA, Macquarie, ING.',
      countFor: (it) => `${d.clients.filter((c) => c.lender === it.name).length} files`,
      rename: (it, name) => api.renameLender(it.id, it.name, name, d.clients),
    },
  }[listKind || 'expenses']

  return (
    <Modal open={open} onClose={close} title={config.title} sub={config.sub}>
      <NameList
        items={config.items}
        countFor={config.countFor}
        onRename={config.rename}
        onRemove={(it) => api.removeSetting(config.list, it.id)}
        onAdd={(name) => api.addSetting(config.list, name)}
        placeholder={config.placeholder}
        emptyNote={config.empty}
      />
    </Modal>
  )
}
