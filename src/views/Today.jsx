import { useMemo } from 'react'
import { useData, useApi } from '../lib/data'
import { C, serif, mono, card, label, grid, linkAction, sectionTitle } from '../lib/theme'
import { Bar, Empty, Progress, TaskRow, clickable } from '../components/ui'
import { annualView, monthlyView } from '../lib/goals'
import {
  short, money, days, THIS_MONTH, monthLabel, MONTH_NAMES, TODAY, CURRENT_QUARTER,
} from '../lib/format'

export default function Today({ setView, starTask }) {
  const d = useData()
  const api = useApi()

  const openTasks = d.tasks.filter((t) => !t.done)
  const activeFiles = d.clients.filter((c) => c.stage !== 'Settled' && c.stage !== 'Lead')
  const pipeline = activeFiles.reduce((a, c) => a + c.amount, 0)
  const totalAssets = d.assets.reduce((a, x) => a + x.value, 0)
  const totalLiabs = d.liabs.reduce((a, x) => a + x.value, 0)

  const annual = useMemo(
    () => d.goals.filter((g) => g.type === 'annual').map((g) => annualView(g, d.goals)),
    [d.goals],
  )
  const monthly = useMemo(
    () =>
      d.goals
        .filter((g) => g.type === 'monthly' && g.month === THIS_MONTH)
        .map((g) => monthlyView(g, d.goals)),
    [d.goals],
  )

  const starred = openTasks.filter((t) => t.focus)
  const focusPool = starred.length ? starred : openTasks.filter((t) => days(t.due) <= 0)
  const focus = focusPool.slice(0, 3)

  const monthEnd = `${THIS_MONTH}-31`
  const settlingSoon = d.clients
    .filter((c) => c.stage === 'Approved' && c.date <= monthEnd)
    .reduce((a, c) => a + c.amount, 0)
  const settlingNames = d.clients
    .filter((c) => c.stage === 'Approved' && c.date <= monthEnd)
    .map((c) => c.name.split(' ')[0])
  const lead = annual[0]

  const thisMonth = (x) => x.date?.slice(0, 7) === THIS_MONTH
  const bizNetMonth =
    d.income.filter(thisMonth).reduce((a, x) => a + x.amount, 0) -
    d.expenses.filter(thisMonth).reduce((a, x) => a + x.amount, 0)

  const netGoal = annual.find((g) => g.goal.tag === 'Personal')

  const stats = [
    {
      label: 'Pipeline',
      value: short(pipeline),
      sub: activeFiles.length ? `${activeFiles.length} files in progress` : 'No active files yet',
    },
    {
      label: 'Settling this month',
      value: short(settlingSoon),
      sub: settlingNames.length ? settlingNames.join(', ') : 'Nothing approved yet',
    },
    {
      label: 'Open tasks',
      value: String(openTasks.length),
      sub: openTasks.length
        ? `${openTasks.filter((t) => days(t.due) < 0).length} overdue · ${
            openTasks.filter((t) => days(t.due) === 0).length
          } due today`
        : 'Nothing on the list',
    },
    {
      label: 'Year to target',
      value: lead ? `${lead.pct}%` : '—',
      sub: lead ? `${lead.current} of ${lead.target}` : 'Set a yearly goal to track this',
    },
  ]

  const clientName = (cid) => d.clients.find((c) => c.id === cid)?.name || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={grid(210, 14)}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{ ...card, padding: 18, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <div style={label}>{s.label}</div>
            <div style={{ fontFamily: serif, fontSize: 32, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: C.muted2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={grid(420)}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section style={{ ...card, padding: '22px 22px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={sectionTitle}>Focus — next 3 moves</h2>
              <span {...clickable(() => setView('tasks'))} style={linkAction}>
                All tasks
              </span>
            </div>
            <p style={{ margin: '6px 0 14px', fontSize: 11.5, color: C.muted, lineHeight: 1.55 }}>
              {starred.length
                ? 'Starred in Tasks — three at a time, tap a star to swap one out.'
                : 'Nothing starred yet — showing what is due or late. Star up to three tasks in Tasks to pin them here.'}
            </p>
            {focus.length ? (
              focus.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  meta={(t.cid && clientName(t.cid) ? `${clientName(t.cid)} · ` : '') + t.priority}
                  onToggle={() => api.updateTask(t.id, { done: !t.done })}
                  onStar={() => starTask(t)}
                />
              ))
            ) : (
              <Empty style={{ paddingBottom: 14 }}>
                Nothing due yet. Add a task in <b>Tasks</b> and star it to pin it here.
              </Empty>
            )}
          </section>

          <div style={card}>
            <div
              style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}
            >
              <h2 style={sectionTitle}>This quarter — Q{CURRENT_QUARTER + 1}</h2>
              <span {...clickable(() => setView('goals'))} style={linkAction}>
                Goals
              </span>
            </div>
            {annual.length ? (
              annual.map((g) => (
                <Progress
                  key={g.goal.id}
                  title={g.goal.title}
                  pctLabel={g.goal.qTargets?.[CURRENT_QUARTER] ? `${g.quarterPct}%` : '—'}
                  barPct={g.quarterPct}
                  left={g.quarterNote}
                  right={`${g.monthLabelValue} this month`}
                />
              ))
            ) : (
              <Empty>No yearly goals yet — set up to three in <b>Goals</b>.</Empty>
            )}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ background: C.ink, color: '#e9e3d5', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ ...label, color: C.darkMuted }}>Net position</span>
              <span {...clickable(() => setView('money'))} style={{ ...linkAction, color: '#c08a5a' }}>
                Money
              </span>
            </div>
            <div style={{ fontFamily: serif, fontSize: 44, lineHeight: 1.05, color: '#fff', margin: '10px 0 4px' }}>
              {money(totalAssets - totalLiabs)}
            </div>
            <div style={{ fontSize: 11.5, color: C.darkMuted }}>
              {netGoal
                ? `Logged +${netGoal.monthLabelValue} toward net worth this month`
                : 'Add assets and liabilities in Money to build this out'}
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', marginTop: 18, borderTop: `1px solid ${C.darkLine}` }}
            >
              {[
                { label: 'Assets', value: money(totalAssets), color: '#e9e3d5' },
                { label: 'Liabilities', value: `-${money(totalLiabs)}`, color: '#d99b8e' },
                {
                  label: `Business net · ${MONTH_NAMES[Number(TODAY.slice(5, 7)) - 1]}`,
                  value: money(bizNetMonth),
                  color: '#9ec4a3',
                },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 12,
                    padding: '11px 0',
                    borderBottom: '1px solid #221f18',
                  }}
                >
                  <span style={{ fontSize: 12.5, color: C.darkText2 }}>{r.label}</span>
                  <span style={{ fontFamily: mono, fontSize: 13, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div
              style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 2 }}
            >
              <h2 style={sectionTitle}>This month — {monthLabel(THIS_MONTH).split(' ')[0]}</h2>
              <span {...clickable(() => setView('goals'))} style={linkAction}>
                Goals
              </span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11.5, color: C.muted, lineHeight: 1.55 }}>
              {monthly.length
                ? 'Monthly goals for this month — linked ones feed straight into the yearly totals.'
                : 'No monthly goals set for this month yet.'}
            </p>
            {monthly.map((g) => (
              <Progress
                key={g.goal.id}
                title={g.goal.title}
                pctLabel={`${g.pct}%`}
                barPct={g.pct}
                color={g.parent ? C.accent : '#8f8674'}
                left={`${g.current} of ${g.target}`}
                right={g.parent ? `Feeds ${g.parent.tag}` : 'Standalone'}
              />
            ))}
            {!monthly.length && (
              <Empty>Create one in <b>Goals</b> — it can roll into a yearly goal.</Empty>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export { Bar }
