import { useMemo, useState } from 'react'
import { useData, useApi } from '../lib/data'
import {
  C, serif, mono, card, input, inputWhite, btnDark, labelSm, grid, linkAction, segment, segmentWrap, stageBadge,
} from '../lib/theme'
import { Empty, XDel, clickable, taskBoxStyle, taskTitleStyle } from '../components/ui'
import EditField, { SelectField } from '../components/EditField'
import { money, dateLabel, dueText, TODAY } from '../lib/format'

const STAGES = ['Lead', 'Application', 'Submitted', 'Approved', 'Settled']
const STAGE_ORDER = { Lead: 0, Application: 1, Submitted: 2, Approved: 3, Settled: 4 }

const ROW_GRID = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(180px,1.6fr) minmax(96px,1fr) minmax(104px,1fr) minmax(104px,1fr) minmax(96px,1fr)',
  gap: 12,
  minWidth: 660,
}

export default function Clients({ selId, setSelId, openModal }) {
  const d = useData()
  const api = useApi()
  const [tab, setTab] = useState('active')
  const [sortBy, setSortBy] = useState('stage')

  const [newPick, setNewPick] = useState('new')
  const [newName, setNewName] = useState('')
  const [newReferrer, setNewReferrer] = useState('')
  const [newLog, setNewLog] = useState('')
  const [newTask, setNewTask] = useState('')
  const [newTaskDue, setNewTaskDue] = useState(TODAY)

  const partnerNames = d.partners.map((p) => p.name)
  const lenderNames = d.lenders.map((l) => l.name)
  const openPartners = () => openModal('partners')
  const openLenders = () => openModal('cats', 'lenders')
  const sel = d.clients.find((c) => c.id === selId) || d.clients[0] || null

  const shown = useMemo(() => {
    const list = d.clients.filter((c) => (tab === 'settled' ? c.stage === 'Settled' : c.stage !== 'Settled'))
    return list.slice().sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'referrer') return (a.referrer || '').localeCompare(b.referrer || '') || a.name.localeCompare(b.name)
      if (sortBy === 'lender') return (a.lender || '').localeCompare(b.lender || '') || a.name.localeCompare(b.name)
      if (sortBy === 'date') return (a.date || '').localeCompare(b.date || '')
      return STAGE_ORDER[b.stage] - STAGE_ORDER[a.stage] || (a.date || '').localeCompare(b.date || '')
    })
  }, [d.clients, tab, sortBy])

  const referrerOptions = partnerNames.length ? partnerNames : ['Direct']

  const addFile = async () => {
    const from = d.clients.find((c) => c.id === newPick)
    const name = from ? from.name : newName.trim()
    if (!name) return
    const id = await api.addClient({
      name,
      referrer: newReferrer || referrerOptions[0],
      status: from ? 'Repeat client — new file' : 'New lead',
      contact: from ? from.contact : '—',
    })
    setNewName('')
    setNewPick('new')
    setTab('active')
    setSelId(id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={segmentWrap}>
          <div {...clickable(() => setTab('active'))} style={segment(tab === 'active')}>
            Active files ({d.clients.filter((c) => c.stage !== 'Settled').length})
          </div>
          <div {...clickable(() => setTab('settled'))} style={segment(tab === 'settled')}>
            Settled ({d.clients.filter((c) => c.stage === 'Settled').length})
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ ...labelSm, letterSpacing: '0.14em' }}>Sort</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...inputWhite, padding: '8px 11px' }}>
            <option value="stage">Stage</option>
            <option value="date">Key date</option>
            <option value="name">Client name</option>
            <option value="lender">Bank</option>
            <option value="referrer">Referral partner</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
          <div {...clickable(openLenders)} style={linkAction}>
            Edit banks
          </div>
          <div {...clickable(openPartners)} style={linkAction}>
            Edit referral partners
          </div>
        </div>
      </div>

      <div style={grid(480)}>
        <section style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <div
            style={{
              padding: '16px 18px',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
              borderBottom: `1px solid ${C.lineFaint}`,
              background: C.cardTint,
            }}
          >
            <select value={newPick} onChange={(e) => {
              setNewPick(e.target.value)
              const from = d.clients.find((c) => c.id === e.target.value)
              if (from) setNewReferrer(from.referrer)
            }} style={{ ...inputWhite, flex: '1 1 180px' }}>
              <option value="new">+ New client…</option>
              {d.clients
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — new file
                  </option>
                ))}
            </select>
            {newPick === 'new' && (
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFile()}
                placeholder="New client name"
                style={{ ...inputWhite, flex: '1 1 170px' }}
              />
            )}
            <select
              value={newReferrer || referrerOptions[0]}
              onChange={(e) => setNewReferrer(e.target.value)}
              style={{ ...inputWhite, flex: '0 1 170px' }}
            >
              {referrerOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button onClick={addFile} style={btnDark}>
              Add file
            </button>
          </div>

          <div
            style={{
              ...ROW_GRID,
              padding: '13px 18px',
              background: C.cardTint,
              borderBottom: `1px solid ${C.line}`,
              ...labelSm,
              letterSpacing: '0.14em',
            }}
          >
            <div>Client · referrer</div>
            <div>Loan</div>
            <div>Bank</div>
            <div>Stage</div>
            <div>Key date</div>
          </div>

          {shown.map((c) => (
            <div
              key={c.id}
              {...clickable(() => setSelId(c.id), `Open ${c.name}`)}
              style={{
                ...ROW_GRID,
                alignItems: 'center',
                padding: '15px 18px',
                borderBottom: `1px solid ${C.lineFaint}`,
                cursor: 'pointer',
                background: sel?.id === c.id ? C.cardTint : C.card,
                boxShadow: `inset 2px 0 0 ${sel?.id === c.id ? C.accent : 'transparent'}`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.name}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {(c.kind || '').split(' · ')[0]} · via {c.referrer}
                </span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 12.5 }}>{money(c.amount)}</div>
              <div
                style={{
                  fontSize: 12.5,
                  color: c.lender ? C.inkSoft : C.dim,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {c.lender || '—'}
              </div>
              <div>
                <span style={stageBadge(c.stage)}>{c.stage}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted2 }}>
                {dateLabel(c.date)} — {c.dateKind}
              </div>
            </div>
          ))}

          {!shown.length && (
            <Empty style={{ padding: '26px 18px' }}>
              {tab === 'active'
                ? 'No active files yet — add one above to start a pipeline.'
                : 'Nothing settled yet.'}
            </Empty>
          )}
        </section>

        {sel ? (
          <ClientPanel
            key={sel.id}
            client={sel}
            referrerOptions={referrerOptions}
            lenderOptions={lenderNames}
            openLenders={openLenders}
            tasks={d.tasks.filter((t) => t.cid === sel.id)}
            api={api}
            allTasks={d.tasks}
            newLog={newLog}
            setNewLog={setNewLog}
            newTask={newTask}
            setNewTask={setNewTask}
            newTaskDue={newTaskDue}
            setNewTaskDue={setNewTaskDue}
          />
        ) : (
          <aside style={{ ...card, padding: 24 }}>
            <h2 style={{ margin: '0 0 8px', fontFamily: serif, fontWeight: 400, fontSize: 27 }}>No file selected</h2>
            <Empty>
              Add your first client on the left. Each file gets its own conversation log, tasks, and key dates.
            </Empty>
          </aside>
        )}
      </div>
    </div>
  )
}

function ClientPanel({
  client: c, referrerOptions, lenderOptions, openLenders, tasks, api, allTasks,
  newLog, setNewLog, newTask, setNewTask, newTaskDue, setNewTaskDue,
}) {
  const up = (patch) => api.updateClient(c.id, patch)

  const addLog = () => {
    const text = newLog.trim()
    if (!text) return
    api.addClientLog(c.id, { date: dateLabel(TODAY), text, ts: Date.now() })
    setNewLog('')
  }

  const addTask = () => {
    const title = newTask.trim()
    if (!title) return
    api.addTask({ cid: c.id, title, due: newTaskDue || TODAY, priority: 'Normal', done: false, focus: false })
    setNewTask('')
  }

  return (
    <aside style={{ ...card, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, alignSelf: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ ...stageBadge(c.stage), alignSelf: 'flex-start' }}>{c.stage}</span>
        <EditField
          value={c.name}
          onCommit={(v) => up({ name: v || 'Untitled file' })}
          fontSize={27}
          placeholder="Client name"
          style={{ marginTop: 2 }}
        />
        <EditField value={c.kind} onCommit={(v) => up({ kind: v })} fontSize={12} placeholder="Purchase · Owner occupied" />
        <EditField value={c.contact} onCommit={(v) => up({ contact: v })} fontSize={12} placeholder="email · phone" />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={c.stage} onChange={(e) => up({ stage: e.target.value })} style={{ ...input, flex: '1 1 120px' }}>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={c.referrer} onChange={(e) => up({ referrer: e.target.value })} style={{ ...input, flex: '1 1 150px' }}>
          {[...new Set([...referrerOptions, c.referrer].filter(Boolean))].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          onClick={() => api.removeClient(c.id, allTasks)}
          style={{
            padding: '8px 12px',
            border: '1px solid #e2cec9',
            borderRadius: 8,
            background: C.card,
            color: C.red,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Delete file
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
          gap: '14px 12px',
          padding: '16px 0',
          borderTop: `1px solid ${C.lineSoft}`,
          borderBottom: `1px solid ${C.lineSoft}`,
        }}
      >
        <EditField label="Loan amount" value={c.amount ? money(c.amount) : ''} type="number" placeholder="$0" onCommit={(v) => up({ amount: v })} />
        <SelectField
          label="Lender"
          value={c.lender}
          options={lenderOptions}
          placeholder="Pick a bank"
          onCommit={(v) => up({ lender: v })}
          onManage={openLenders}
          manageLabel="Edit"
        />
        <EditField label="Rate / type" value={c.rate} onCommit={(v) => up({ rate: v })} />
        <EditField label="LVR" value={c.lvr} onCommit={(v) => up({ lvr: v })} />
        <EditField label="Doc type" value={c.docs} onCommit={(v) => up({ docs: v })} />
        <EditField label="Key date" value={c.date} type="date" onCommit={(v) => up({ date: v })} />
        <EditField label="Date is for" value={c.dateKind} placeholder="settlement" onCommit={(v) => up({ dateKind: v })} />
        <EditField label="Status" value={c.status} onCommit={(v) => up({ status: v })} />
      </div>

      <div style={grid(240)}>
        <div>
          <div style={{ ...labelSm, letterSpacing: '0.14em', marginBottom: 10 }}>Conversation log</div>
          <textarea
            value={newLog}
            onChange={(e) => setNewLog(e.target.value)}
            placeholder="Log a call or conversation…"
            style={{ ...input, width: '100%', minHeight: 62, resize: 'vertical', padding: '10px 11px', lineHeight: 1.5 }}
          />
          <button
            onClick={addLog}
            style={{
              margin: '8px 0 14px',
              padding: '9px 14px',
              border: `1px solid ${C.ink}`,
              borderRadius: 8,
              background: 'transparent',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Save note
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 250, overflow: 'auto' }}>
            {c.log.map((l) => (
              <div
                key={l.id}
                style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingLeft: 12, borderLeft: '2px solid #ecd9b7' }}
              >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>{l.date}</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.55, color: '#3c382f' }}>{l.text}</span>
                </div>
                <XDel size={15} onClick={() => api.removeClientLog(c.id, l.id)} />
              </div>
            ))}
            {!c.log.length && <Empty style={{ padding: 0 }}>No conversations logged yet.</Empty>}
          </div>
        </div>

        <div>
          <div style={{ ...labelSm, letterSpacing: '0.14em', marginBottom: 10 }}>Tasks for this client</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {tasks.map((t) => (
              <div key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div {...clickable(() => api.updateTask(t.id, { done: !t.done }))} style={taskBoxStyle(t.done)}>
                  {t.done ? '✓' : ''}
                </div>
                <div style={{ ...taskTitleStyle(t.done), flex: 1, minWidth: 0 }}>{t.title}</div>
                <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{dueText(t.due)}</span>
                <XDel size={15} onClick={() => api.removeTask(t.id)} />
              </div>
            ))}
            {!tasks.length && <Empty style={{ padding: 0 }}>Nothing to do on this file yet.</Empty>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a task…"
              style={{ ...input, flex: '1 1 140px' }}
            />
            <input
              type="date"
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              style={{ ...input, flex: '0 1 130px', padding: '8px 10px', fontSize: 12 }}
            />
            <button onClick={addTask} style={{ ...btnDark, padding: '9px 14px', fontSize: 12 }}>
              Add
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
