import { C, serif, mono } from '../lib/theme'
import { clickable } from './ui'

export default function Sidebar({ view, setView, counts, pipelineValue, pipelineNote, account }) {
  const items = [
    ['today', 'Today', ''],
    ['clients', 'Clients', counts.clients || ''],
    ['tasks', 'Tasks', counts.tasks || ''],
    ['goals', 'Goals', counts.goals || ''],
    ['notes', 'Notes', counts.notes || ''],
    ['money', 'Money', ''],
  ]

  return (
    <aside
      style={{
        width: 236,
        flex: '0 0 236px',
        background: C.ink,
        color: C.darkText,
        padding: '26px 18px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 8 }}>
        <div style={{ fontFamily: serif, fontSize: 26, color: '#f4efe4' }}>Compass</div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: C.darkMuted,
          }}
        >
          Personal HQ
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map(([key, label, count]) => {
          const on = view === key
          return (
            <div
              key={key}
              {...clickable(() => setView(key), `Go to ${label}`)}
              aria-current={on ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13.5,
                color: on ? '#fdfaf3' : C.darkText2,
                background: on ? '#262218' : 'transparent',
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: on ? C.accent : '#3a352b',
                }}
              />
              <span style={{ flex: 1 }}>{label}</span>
              <span style={{ fontFamily: mono, fontSize: 10, color: C.darkMuted }}>{count}</span>
            </div>
          )
        })}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 14,
          border: `1px solid ${C.darkLine}`,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.darkMuted,
          }}
        >
          Pipeline value
        </div>
        <div style={{ fontFamily: serif, fontSize: 30, lineHeight: 1, color: '#f4efe4' }}>
          {pipelineValue}
        </div>
        <div style={{ fontSize: 11.5, color: C.darkMuted, lineHeight: 1.5 }}>{pipelineNote}</div>
      </div>

      {account ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 4,
            marginTop: -12,
          }}
        >
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 11,
              color: C.darkMuted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={account.email}
          >
            {account.email}
          </span>
          <span
            {...clickable(account.signOut, 'Sign out')}
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#c08a5a',
              cursor: 'pointer',
              flex: '0 0 auto',
            }}
          >
            Sign out
          </span>
        </div>
      ) : null}
    </aside>
  )
}
