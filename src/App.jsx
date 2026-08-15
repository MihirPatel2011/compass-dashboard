import { useState } from 'react'
import { DataProvider, useData, useApi, isFirebaseConfigured } from './lib/data'
import { AuthProvider, useAuth } from './lib/auth'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Modals from './components/Modals'
import Today from './views/Today'
import Clients from './views/Clients'
import Tasks from './views/Tasks'
import Goals from './views/Goals'
import Notes from './views/Notes'
import Money from './views/Money'
import { C, serif, mono } from './lib/theme'
import { headerDate, short } from './lib/format'

const TITLES = {
  today: ['Today', 'Your starred tasks, the money, and where this quarter stands.'],
  clients: ['Clients', 'Active and settled files, sortable, each with its own log and tasks.'],
  tasks: ['Tasks', 'One list with due dates and priority. Star up to three to pin them to Today.'],
  goals: ['Goals', 'Three goals for the year, each broken into quarters, with monthly goals feeding them.'],
  notes: ['Notes', 'Free-form thinking and ideas.'],
  money: ['Money', 'A month at a time, categorised, with a date-range view and the annualised picture.'],
}

function Shell() {
  const d = useData()
  const api = useApi()
  const { needsAuth, email, signOut } = useAuth()
  const [view, setView] = useState('today')
  const [selId, setSelId] = useState(null)
  const [noteId, setNoteId] = useState(null)
  const [modal, setModal] = useState(null)
  const [starMsg, setStarMsg] = useState('')

  const openModal = (kind, arg) =>
    setModal({ kind, goalId: kind === 'log' || kind === 'history' ? arg : null, listKind: kind === 'cats' ? arg : null })
  const closeModal = () => setModal(null)

  const starTask = (t) => {
    const starredOpen = d.tasks.filter((x) => x.focus && !x.done)
    if (!t.focus && starredOpen.length >= 3) {
      setStarMsg('Focus holds three tasks — unstar one before starring another.')
      return
    }
    setStarMsg('')
    api.updateTask(t.id, { focus: !t.focus })
  }

  const openTasks = d.tasks.filter((t) => !t.done)
  const activeFiles = d.clients.filter((c) => c.stage !== 'Settled' && c.stage !== 'Lead')
  const pipeline = activeFiles.reduce((a, c) => a + c.amount, 0)

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: C.paper,
        color: C.ink,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <Sidebar
        view={view}
        setView={setView}
        counts={{
          clients: String(d.clients.length || ''),
          tasks: String(openTasks.length || ''),
          goals: String(d.goals.length || ''),
          notes: String(d.notes.length || ''),
        }}
        pipelineValue={short(pipeline)}
        pipelineNote={
          d.clients.length || openTasks.length
            ? `${activeFiles.length} active files · ${openTasks.length} open tasks`
            : 'Nothing in the pipeline yet'
        }
        account={needsAuth ? { email, signOut } : null}
      />

      <main style={{ flex: 1, minWidth: 0, padding: '34px 44px 80px', maxWidth: 1240 }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            paddingBottom: 22,
            borderBottom: `1px solid #e4ded1`,
            marginBottom: 30,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.muted,
              }}
            >
              {headerDate()}
            </div>
            <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 40, lineHeight: 1 }}>
              {TITLES[view][0]}
            </h1>
          </div>
          <div style={{ fontSize: 12.5, color: C.muted2, textAlign: 'right', maxWidth: 330, lineHeight: 1.5 }}>
            {TITLES[view][1]}
          </div>
        </header>

        {!d.ready ? (
          <div style={{ fontSize: 12.5, color: C.muted }}>Loading…</div>
        ) : (
          <>
            {view === 'today' && <Today setView={setView} starTask={starTask} />}
            {view === 'clients' && (
              <Clients selId={selId} setSelId={setSelId} openModal={openModal} />
            )}
            {view === 'tasks' && <Tasks starTask={starTask} starMsg={starMsg} />}
            {view === 'goals' && <Goals openModal={openModal} />}
            {view === 'notes' && <Notes noteId={noteId} setNoteId={setNoteId} />}
            {view === 'money' && <Money openModal={openModal} />}
          </>
        )}

        {!isFirebaseConfigured && (
          <div
            style={{
              marginTop: 40,
              paddingTop: 16,
              borderTop: `1px solid ${C.lineSoft}`,
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#b4ab99',
            }}
          >
            Local storage mode · add your Firebase keys to .env.local to sync
          </div>
        )}
      </main>

      <Modals modal={modal} closeModal={closeModal} />
    </div>
  )
}

function Gate() {
  const { ready, signedIn } = useAuth()

  // Avoid flashing the login screen while Firebase restores the session.
  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: C.paper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.muted,
        }}
      >
        Loading
      </div>
    )
  }

  if (!signedIn) return <Login />

  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
