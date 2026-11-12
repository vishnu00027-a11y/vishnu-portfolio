const ROLES = [
  { company: "servicenow", title: "staff product designer, ai", from: "mar 2026", to: "sep 2026", length: "7 mos" },
  { company: "sense", title: "staff product designer, ai & new initiatives", from: "jul 2024", to: "mar 2026", length: "1 yr 9 mos" },
  { company: "freshworks", title: "lead product designer, crm (freshsales)", from: "dec 2023", to: "jul 2024", length: "8 mos" },
  { company: "mycaptain", title: "head of design", from: "nov 2022", to: "sep 2023", length: "11 mos" },
  { company: "alfheimr.tech", title: "lead product designer / founder (acquired)", from: "oct 2018", to: "nov 2022", length: "4 yrs 2 mos" },
]

const nodes = ROLES.map((role) => ({
  name: `${role.company}/`,
  kids: [role.title, `${role.from} – ${role.to} · ${role.length}`],
}))

const footer = `${ROLES.length} companies · since ${ROLES[ROLES.length - 1].from.split(" ")[1]}`

export const TREE_COLS = Math.max(
  footer.length,
  ...nodes.flatMap((node) => [6 + node.name.length + 2, ...node.kids.map((kid) => 8 + kid.length)]),
)

const TREE_ROWS = 1 + nodes.length + Math.max(...nodes.map((node) => node.kids.length)) + 2

function lines(cursor, open, shown) {
  const out = ["~/experience"]
  nodes.forEach((node, i) => {
    const last = i === nodes.length - 1
    const branch = last ? "└─" : "├─"
    const mark = i === cursor ? "> " : "─ "
    const plus = i !== open || shown === 0 ? " +" : ""
    out.push(`${branch}${mark}${node.name}${plus}`)
    if (i === open) {
      for (let k = 0; k < shown; k++) {
        const pad = last ? "    " : "│   "
        const elbow = k === node.kids.length - 1 ? "└── " : "├── "
        out.push(`${pad}${elbow}${node.kids[k]}`)
      }
    }
  })
  return out
}

function paint(body) {
  const rows = [...body]
  while (rows.length < TREE_ROWS - 1) rows.push("")
  rows.push(footer)
  return rows.map((row) => row.padEnd(TREE_COLS)).join("\n")
}

function buildFrames() {
  const frames = []
  let at = 0
  let cursor = 0
  const push = (cursorIndex, open, shown, dur) => {
    frames.push({ at, text: paint(lines(cursorIndex, open, shown)) })
    at += dur
  }
  push(0, -1, 0, 0.9)
  nodes.forEach((node, i) => {
    while (cursor < i) push(++cursor, -1, 0, 0.13)
    push(cursor, i, 0, 0.3)
    for (let n = 1; n <= node.kids.length; n++) push(cursor, i, n, n === node.kids.length ? 2.4 : 0.07)
    for (let n = node.kids.length - 1; n >= 0; n--) push(cursor, i, n, n === 0 ? 0.3 : 0.07)
  })
  while (cursor > 0) push(--cursor, -1, 0, 0.13)
  return { frames, duration: at }
}

const film = buildFrames()

export function restFrame() {
  return film.frames[0].text
}

export function frameAt(time) {
  const t = ((time % film.duration) + film.duration) % film.duration
  let i = 0
  while (i + 1 < film.frames.length && film.frames[i + 1].at <= t) i++
  return film.frames[i].text
}

export const treeLabel = `Experience: ${ROLES.map((role) => `${role.title} at ${role.company}, ${role.from} to ${role.to}`).join("; ")}`
