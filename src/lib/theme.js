// Design tokens lifted verbatim from the Compass v4 design so every screen
// keeps the same paper-and-ink feel.

export const C = {
  accent: '#a75c2c',
  ink: '#17150f',
  inkSoft: '#211e18',
  paper: '#f7f4ee',
  card: '#ffffff',
  cardTint: '#faf7f1',
  line: '#e6e0d4',
  lineSoft: '#efeae0',
  lineFaint: '#f4f0e8',
  field: '#e0d9cb',
  muted: '#8d8474',
  muted2: '#7c7466',
  dim: '#c2b9a6',
  green: '#3d6b45',
  red: '#98392e',
  blue: '#3f5a70',
  darkMuted: '#8a8272',
  darkText: '#d9d3c5',
  darkText2: '#b6ae9d',
  darkLine: '#2c2921',
}

export const serif = "'Instrument Serif', Georgia, serif"
export const mono = "'IBM Plex Mono', monospace"
export const sans = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export const label = {
  fontFamily: mono,
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: C.muted,
}

export const labelSm = { ...label, fontSize: 9.5, letterSpacing: '0.12em' }

export const card = {
  background: C.card,
  border: `1px solid ${C.line}`,
  borderRadius: 14,
  padding: 22,
}

export const input = {
  padding: '9px 11px',
  border: `1px solid ${C.field}`,
  borderRadius: 8,
  background: C.cardTint,
  fontSize: 12.5,
  minWidth: 0,
}

export const inputWhite = { ...input, background: C.card }

export const btnDark = {
  padding: '9px 16px',
  border: 'none',
  borderRadius: 8,
  background: C.ink,
  color: '#f4efe4',
  fontSize: 12.5,
  cursor: 'pointer',
}

export const btnGhost = {
  padding: '9px 14px',
  border: `1px solid ${C.field}`,
  borderRadius: 8,
  background: C.card,
  fontSize: 12,
  cursor: 'pointer',
}

export const sectionTitle = {
  margin: 0,
  fontFamily: serif,
  fontWeight: 400,
  fontSize: 22,
}

export const pill = (active) => ({
  padding: '7px 14px',
  borderRadius: 99,
  cursor: 'pointer',
  fontSize: 12.5,
  border: `1px solid ${active ? C.ink : C.field}`,
  background: active ? C.ink : C.card,
  color: active ? '#f4efe4' : '#5d564a',
})

export const segment = (active) => ({
  padding: '7px 16px',
  borderRadius: 99,
  cursor: 'pointer',
  fontSize: 12.5,
  background: active ? C.card : 'transparent',
  color: active ? C.ink : C.muted2,
  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
})

export const segmentWrap = {
  display: 'flex',
  gap: 6,
  padding: 4,
  background: C.lineSoft,
  borderRadius: 99,
}

export const chip = (on) => ({
  padding: '6px 11px',
  borderRadius: 99,
  cursor: 'pointer',
  fontSize: 11.5,
  whiteSpace: 'nowrap',
  border: `1px solid ${on ? C.ink : C.field}`,
  background: on ? C.ink : 'transparent',
  color: on ? '#f4efe4' : '#5d564a',
})

export const stageBadge = (stage) => {
  const map = {
    Lead: ['#efe9dc', '#6f6553'],
    Application: ['#e6ecf1', C.blue],
    Submitted: ['#f1e6d3', '#7d5720'],
    Approved: ['#e3eee4', C.green],
    Settled: [C.ink, '#e9e3d5'],
  }
  const c = map[stage] || map.Lead
  return {
    display: 'inline-block',
    fontFamily: mono,
    fontSize: 9.5,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '5px 9px',
    borderRadius: 6,
    background: c[0],
    color: c[1],
  }
}

export const linkAction = {
  fontFamily: mono,
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: C.accent,
  cursor: 'pointer',
}

export const grid = (min, gap = 22) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`,
  gap,
  alignItems: 'start',
})
