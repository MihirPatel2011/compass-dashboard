import { useEffect, useRef, useState } from 'react'
import { useData, useApi } from '../lib/data'
import { C, serif, mono, card } from '../lib/theme'
import { Empty, XDel, clickable } from '../components/ui'

const FORMAT_BUTTONS = [
  { label: 'B', cmd: 'bold', style: { fontWeight: 700 } },
  { label: 'I', cmd: 'italic', style: { fontStyle: 'italic' } },
  { label: 'U', cmd: 'underline', style: { textDecoration: 'underline' } },
  { label: 'H', cmd: 'formatBlock', arg: '<h3>' },
  { label: '•', cmd: 'insertUnorderedList' },
  { label: '1.', cmd: 'insertOrderedList' },
  { label: '⌫', cmd: 'removeFormat' },
]

export default function Notes({ noteId, setNoteId }) {
  const d = useData()
  const api = useApi()
  const editor = useRef(null)
  const timer = useRef(null)
  const [saved, setSaved] = useState('Saved')

  const note = d.notes.find((n) => n.id === noteId) || d.notes[0] || null

  // Load the body into the editor whenever a different note is selected.
  useEffect(() => {
    if (editor.current && note) editor.current.innerHTML = note.body || ''
    if (editor.current && !note) editor.current.innerHTML = ''
  }, [note?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSave = () => {
    if (!note) return
    setSaved('Saving…')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      api.updateNote(note.id, { body: editor.current?.innerHTML || '' })
      setSaved('Saved')
    }, 600)
  }

  const exec = (b) => {
    editor.current?.focus()
    document.execCommand(b.cmd, false, b.arg || null)
    scheduleSave()
  }

  const addNote = async () => {
    const id = await api.addNote()
    setNoteId(id)
  }

  const btnStyle = {
    padding: '5px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    background: C.card,
    border: `1px solid ${C.line}`,
    color: '#4a453b',
    minWidth: 28,
    textAlign: 'center',
    userSelect: 'none',
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
        gap: 22,
        alignItems: 'start',
      }}
    >
      <section style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '11px 16px',
            borderBottom: `1px solid ${C.line}`,
            background: C.cardTint,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {FORMAT_BUTTONS.map((b) => (
            <div
              key={b.label}
              onMouseDown={(e) => e.preventDefault()}
              {...clickable(() => exec(b), b.cmd)}
              style={{ ...btnStyle, ...b.style }}
            >
              {b.label}
            </div>
          ))}
          <span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 10, color: C.muted }}>
            {note ? saved : ''}
          </span>
        </div>

        {note ? (
          <>
            <input
              value={note.title}
              onChange={(e) => api.updateNote(note.id, { title: e.target.value })}
              placeholder="Untitled note"
              style={{
                width: '100%',
                padding: '24px 28px 10px',
                border: 'none',
                background: 'transparent',
                fontFamily: serif,
                fontSize: 30,
              }}
            />
            <div
              ref={editor}
              contentEditable
              suppressContentEditableWarning
              onInput={scheduleSave}
              onBlur={scheduleSave}
              style={{ minHeight: 440, padding: '6px 28px 40px', fontSize: 14.5, lineHeight: 1.75, color: '#2e2b24' }}
            />
          </>
        ) : (
          <div style={{ padding: '40px 28px 60px' }}>
            <Empty style={{ padding: 0 }}>
              No notes yet. Hit <b>+ New note</b> to start writing — lender cheat sheets, playbooks, an ideas parking lot.
            </Empty>
          </div>
        )}
      </section>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420, alignSelf: 'start', order: -1 }}>
        <button
          onClick={addNote}
          style={{
            padding: '11px 14px',
            border: '1px dashed #c9c0ad',
            borderRadius: 10,
            background: 'transparent',
            fontSize: 12.5,
            cursor: 'pointer',
            color: '#5d564a',
          }}
        >
          + New note
        </button>
        {d.notes.map((n) => (
          <div
            key={n.id}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: '13px 15px',
              borderRadius: 10,
              border: `1px solid ${note?.id === n.id ? C.ink : C.line}`,
              background: note?.id === n.id ? C.card : 'transparent',
            }}
          >
            <div {...clickable(() => setNoteId(n.id))} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
              <div style={{ fontSize: 13.5, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {n.title || 'Untitled note'}
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>
                {n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </div>
            </div>
            <XDel
              onClick={() => {
                api.removeNote(n.id)
                if (note?.id === n.id) setNoteId(null)
              }}
            />
          </div>
        ))}
      </aside>
    </div>
  )
}
