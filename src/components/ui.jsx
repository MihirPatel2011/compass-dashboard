import { C, mono, serif, labelSm } from '../lib/theme'
import { bar, dueText, group, pct as pctOf } from '../lib/format'

/**
 * The design uses plain divs for most controls. This keeps the look but gives
 * them real button semantics — focusable, keyboard-activatable, announced.
 */
export function clickable(onClick, ariaLabel) {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-label': ariaLabel,
    onClick,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(e)
      }
    },
  }
}

export function XDel({ onClick, size = 16, style, label = 'Delete' }) {
  return (
    <div className="x-del" {...clickable(onClick, label)} style={{ fontSize: size, ...style }}>
      ×
    </div>
  )
}

export function Bar({ pct, color = C.accent, height = 6, track = C.lineSoft, style }) {
  return (
    <div style={{ height, borderRadius: 99, background: track, overflow: 'hidden', ...style }}>
      <div style={bar(pct, color)} />
    </div>
  )
}

export function Empty({ children, style }) {
  return <div className="empty-note" style={style}>{children}</div>
}

export function Label({ children, style }) {
  return <div style={{ ...labelSm, ...style }}>{children}</div>
}

export function Progress({ title, pctLabel, left, right, barPct, color }) {
  return (
    <div style={{ padding: '15px 0 0', borderTop: `1px solid ${C.lineSoft}`, marginTop: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontSize: 13 }}>{title}</span>
        <span style={{ fontFamily: mono, fontSize: 12.5 }}>{pctLabel}</span>
      </div>
      <Bar pct={barPct} color={color} style={{ margin: '9px 0 7px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11.5, color: C.muted }}>
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  )
}

/* ------------------------------- task rows -------------------------------- */

export const taskBoxStyle = (done) => ({
  width: 17,
  height: 17,
  flex: '0 0 17px',
  marginTop: 1,
  borderRadius: 5,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  color: '#fff',
  border: `1.5px solid ${done ? C.accent : '#cfc6b3'}`,
  background: done ? C.accent : 'transparent',
})

export const taskTitleStyle = (done) => ({
  fontSize: 13.5,
  lineHeight: 1.4,
  ...(done ? { color: '#a29a89', textDecoration: 'line-through' } : { color: C.inkSoft }),
})

const duePill = (due) => {
  const g = group(due)
  const over = g === 'Overdue'
  const now = g === 'Today'
  return {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '5px 9px',
    borderRadius: 99,
    whiteSpace: 'nowrap',
    background: over ? '#f6e3e0' : now ? '#f1e6d3' : '#f2efe8',
    color: over ? C.red : now ? '#7d5720' : C.muted2,
  }
}

const pdot = (p) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  flex: '0 0 6px',
  background: p === 'High' ? C.red : p === 'Low' ? C.dim : C.blue,
})

export function TaskRow({ task, meta, onToggle, onStar, onDelete, style }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: '13px 0',
        borderTop: `1px solid ${C.lineSoft}`,
        ...style,
      }}
    >
      <div {...clickable(onToggle, task.done ? 'Mark as not done' : 'Mark as done')} style={taskBoxStyle(task.done)}>
        {task.done ? '✓' : ''}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={taskTitleStyle(task.done)}>{task.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: C.muted }}>
          <span style={pdot(task.priority)} />
          <span>{meta}</span>
        </div>
      </div>
      <div style={duePill(task.due)}>{dueText(task.due)}</div>
      {onStar && (
        <div
          {...clickable(onStar, task.focus ? 'Unstar task' : 'Star task')}
          style={{
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: '1px 2px',
            color: task.focus ? C.accent : '#d2cabb',
          }}
        >
          {task.focus ? '★' : '☆'}
        </div>
      )}
      {onDelete && <XDel onClick={onDelete} />}
    </div>
  )
}

export { pctOf, serif }
