import { useState } from 'react'
import { useData, useApi } from '../lib/data'
import { C, serif, mono, card, input, btnDark, labelSm, pill } from '../lib/theme'
import { Empty, TaskRow, clickable } from '../components/ui'
import { group, TODAY } from '../lib/format'

const FILTERS = ['Open', 'High', 'Overdue', 'All']
const GROUP_ORDER = ['Overdue', 'Today', 'Tomorrow', 'Next 7 days', 'Later']

export default function Tasks({ starTask, starMsg }) {
  const d = useData()
  const api = useApi()
  const [title, setTitle] = useState('')
  const [cid, setCid] = useState('none')
  const [due, setDue] = useState(TODAY)
  const [priority, setPriority] = useState('Normal')
  const [filter, setFilter] = useState('Open')

  const openTasks = d.tasks.filter((t) => !t.done)
  const starred = openTasks.filter((t) => t.focus)
  const clientName = (id) => d.clients.find((c) => c.id === id)?.name || ''

  const add = () => {
    const t = title.trim()
    if (!t) return
    api.addTask({
      cid: cid === 'none' ? '' : cid,
      title: t,
      due: due || TODAY,
      priority,
      done: false,
      focus: false,
    })
    setTitle('')
    setCid('none')
    setPriority('Normal')
  }

  const filtered = d.tasks.filter((t) => {
    if (filter === 'Open') return !t.done
    if (filter === 'High') return !t.done && t.priority === 'High'
    if (filter === 'Overdue') return !t.done && group(t.due) === 'Overdue'
    return true
  })

  const groups = GROUP_ORDER.map((g) => ({
    title: g,
    items: filtered.filter((t) => group(t.due) === g).sort((a, b) => (a.due || '').localeCompare(b.due || '')),
  })).filter((g) => g.items.length)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
      <section style={{ ...card, padding: '18px 20px' }}>
        <div style={{ ...labelSm, letterSpacing: '0.14em', marginBottom: 12 }}>New task</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="What needs doing?"
          style={{ ...input, width: '100%', padding: '11px 13px', borderRadius: 9, fontSize: 14, marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={cid} onChange={(e) => setCid(e.target.value)} style={{ ...input, flex: '1 1 190px' }}>
            <option value="none">No client</option>
            {d.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.stage === 'Settled' ? ' (settled)' : ''}
              </option>
            ))}
          </select>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ ...input, flex: '0 1 140px' }} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ ...input, flex: '0 1 130px' }}>
            <option value="High">High priority</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
          <button onClick={add} style={{ ...btnDark, padding: '10px 20px' }}>
            Add task
          </button>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map((f) => (
          <div key={f} {...clickable(() => setFilter(f))} style={pill(filter === f)}>
            {f === 'High' ? 'High priority' : f}
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted }}>
          {openTasks.length} open · {starred.length}/3 starred · {d.tasks.filter((t) => t.done).length} done
        </span>
      </div>

      {starMsg ? (
        <div style={{ padding: '11px 14px', borderRadius: 9, background: '#f6e3e0', color: C.red, fontSize: 12.5 }}>
          {starMsg}
        </div>
      ) : null}

      {groups.map((g) => (
        <section key={g.title} style={{ ...card, padding: '20px 22px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 20 }}>{g.title}</h2>
            <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>
              {g.items.filter((t) => !t.done).length} open
            </span>
          </div>
          {g.items.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              meta={(t.cid && clientName(t.cid) ? `${clientName(t.cid)} · ` : '') + t.priority}
              onToggle={() => api.updateTask(t.id, { done: !t.done })}
              onStar={() => starTask(t)}
              onDelete={() => api.removeTask(t.id)}
              style={{ marginTop: 8 }}
            />
          ))}
        </section>
      ))}

      {!groups.length && (
        <section style={card}>
          <Empty style={{ padding: 0 }}>
            {d.tasks.length
              ? `Nothing matches "${filter}".`
              : 'No tasks yet — add the first one above. Star up to three to pin them to Today.'}
          </Empty>
        </section>
      )}
    </div>
  )
}
