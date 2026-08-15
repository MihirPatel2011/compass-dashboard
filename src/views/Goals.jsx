import { useMemo } from 'react'
import { useData, useApi } from '../lib/data'
import { C, serif, mono, card, btnDark, btnGhost, labelSm, grid } from '../lib/theme'
import { Bar, Empty, XDel } from '../components/ui'
import { annualView, monthlyView } from '../lib/goals'
import { monthLabel, unitVal, THIS_YEAR, CURRENT_QUARTER, quarterOf } from '../lib/format'

export default function Goals({ openModal }) {
  const d = useData()
  const api = useApi()

  const annual = useMemo(
    () => d.goals.filter((g) => g.type === 'annual').map((g) => annualView(g, d.goals)),
    [d.goals],
  )
  const monthly = useMemo(
    () =>
      d.goals
        .filter((g) => g.type === 'monthly')
        .sort((a, b) => (b.month || '').localeCompare(a.month || ''))
        .map((g) => monthlyView(g, d.goals)),
    [d.goals],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'baseline',
          flexWrap: 'wrap',
          paddingBottom: 14,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 26 }}>
          {THIS_YEAR} — three goals
        </h2>
        <span style={{ fontSize: 12.5, color: C.muted }}>
          {annual.length} of 3 set · Q{CURRENT_QUARTER + 1} in progress
        </span>
        <button onClick={() => openModal('newGoal')} style={{ ...btnDark, marginLeft: 'auto', padding: '10px 18px', borderRadius: 9 }}>
          {annual.length >= 3 ? '+ New monthly goal' : '+ New yearly goal'}
        </button>
      </div>

      {annual.length ? (
        <div style={grid(300, 18)}>
          {annual.map((g) => (
            <AnnualCard key={g.goal.id} v={g} api={api} goals={d.goals} openModal={openModal} />
          ))}
        </div>
      ) : (
        <section style={card}>
          <Empty style={{ padding: 0 }}>
            No yearly goals yet. Set up to three — each one splits into quarters, and monthly goals can roll into them.
          </Empty>
        </section>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 22 }}>Monthly goals</h2>
          <span style={{ fontSize: 12, color: C.muted }}>
            {monthly.length
              ? `${monthly.filter((g) => g.parent).length} of ${monthly.length} feed a yearly goal`
              : 'None yet — monthly goals roll into the three above.'}
          </span>
        </div>
        {monthly.length ? (
          <div style={grid(280, 14)}>
            {monthly.map((g) => (
              <MonthlyCard key={g.goal.id} v={g} api={api} goals={d.goals} openModal={openModal} />
            ))}
          </div>
        ) : (
          <section style={card}>
            <Empty style={{ padding: 0 }}>
              Add a monthly goal to break a yearly target into something you can actually hit this month.
            </Empty>
          </section>
        )}
      </div>
    </div>
  )
}

function AnnualCard({ v, api, goals, openModal }) {
  const g = v.goal
  return (
    <section style={{ ...card, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ ...labelSm, letterSpacing: '0.14em' }}>{g.tag}</span>
        <XDel size={17} onClick={() => api.removeGoal(g.id, goals)} />
      </div>
      <h3 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 23, lineHeight: 1.2 }}>{g.title}</h3>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: serif, fontSize: 34, lineHeight: 1 }}>{v.current}</span>
          <span style={{ fontSize: 12, color: C.muted }}>
            of {v.target} · {v.pct}%
          </span>
        </div>
        <Bar pct={v.pct} height={8} style={{ marginTop: 12 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14, borderTop: `1px solid ${C.lineSoft}` }}>
        {v.qSums.map((sum, i) => {
          const target = g.qTargets?.[i] || 0
          const qp = target ? Math.round((sum / target) * 100) : 0
          const now = i === CURRENT_QUARTER
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 9.5,
                  letterSpacing: '0.08em',
                  padding: '3px 7px',
                  borderRadius: 5,
                  flex: '0 0 auto',
                  background: now ? '#f1e6d3' : '#f2efe8',
                  color: now ? '#7d5720' : C.muted,
                }}
              >
                Q{i + 1}
              </span>
              <Bar pct={qp} height={5} color={now ? C.accent : '#b8ae99'} style={{ flex: 1, minWidth: 0 }} />
              <span style={{ fontFamily: mono, fontSize: 10.5, color: C.muted2, flex: '0 0 auto', whiteSpace: 'nowrap' }}>
                {unitVal(g.unit, sum)} / {unitVal(g.unit, target)}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', paddingTop: 14, borderTop: `1px solid ${C.lineSoft}` }}>
        {[
          ['This month', v.monthLabelValue],
          ['This week', v.weekLabelValue],
          ['Left to target', v.remaining],
        ].map(([l, val]) => (
          <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ ...labelSm, fontSize: 9 }}>{l}</span>
            <span style={{ fontSize: 13.5 }}>{val}</span>
          </div>
        ))}
      </div>

      {v.kids.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 14, borderTop: `1px solid ${C.lineSoft}` }}>
          <div style={{ ...labelSm, fontSize: 9, letterSpacing: '0.14em' }}>Monthly goals feeding this</div>
          {v.kids.map((k) => {
            const kt = k.logs.reduce((a, l) => a + l.amount, 0)
            return (
              <div key={k.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontFamily: mono, fontSize: 10.5, color: C.muted, flex: '0 0 34px' }}>
                  {monthLabel(k.month).split(' ')[0]}
                </span>
                <span
                  style={{ flex: 1, minWidth: 0, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {k.title}
                </span>
                <span style={{ fontFamily: mono, fontSize: 11, flex: '0 0 auto', whiteSpace: 'nowrap', color: C.muted2 }}>
                  {unitVal(k.unit, kt)} / {unitVal(k.unit, k.target)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <button onClick={() => openModal('log', g.id)} style={{ ...btnDark, flex: 1, padding: '9px 12px', fontSize: 12 }}>
          Log progress
        </button>
        <button onClick={() => openModal('history', g.id)} style={btnGhost}>
          History
        </button>
      </div>
    </section>
  )
}

function MonthlyCard({ v, api, goals, openModal }) {
  const g = v.goal
  return (
    <section style={card}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <span
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '4px 8px',
            borderRadius: 6,
            background: C.lineSoft,
            color: '#6f6553',
          }}
        >
          {monthLabel(g.month)}
        </span>
        <span
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '4px 8px',
            borderRadius: 6,
            background: v.parent ? '#f1e6d3' : '#f2efe8',
            color: v.parent ? '#7d5720' : C.muted2,
          }}
        >
          {v.parent ? `Feeds Q${quarterOf(`${g.month}-01`) + 1} · ${v.parent.tag}` : 'Standalone'}
        </span>
        <XDel onClick={() => api.removeGoal(g.id, goals)} style={{ marginLeft: 'auto' }} />
      </div>
      <h3 style={{ margin: '0 0 12px', fontFamily: serif, fontWeight: 400, fontSize: 21, lineHeight: 1.2 }}>{g.title}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: serif, fontSize: 28, lineHeight: 1 }}>{v.current}</span>
        <span style={{ fontSize: 12, color: C.muted }}>
          of {v.target} · {v.pct}%
        </span>
      </div>
      <Bar pct={v.pct} color={v.parent ? C.accent : '#8f8674'} style={{ margin: '14px 0 16px' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => openModal('log', g.id)} style={{ ...btnDark, padding: '8px 14px', fontSize: 12 }}>
          Log progress
        </button>
        <button onClick={() => openModal('history', g.id)} style={{ ...btnGhost, padding: '8px 14px' }}>
          History
        </button>
      </div>
    </section>
  )
}
