const ROLES = [
  { company: "meta", title: "full stack developer / sde 2", note: "current" },
  { company: "shivank.tech", title: "founder", note: "web and app studio" },
  { company: "worksquare.co", title: "founder", note: "career platform" },
]

const nodes = ROLES.map((role) => ({
  name: `${role.company}/`,
  kids: [role.title, role.note],
}))

const footer = "3 roles · english · hindi"

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

export const treeLabel = `Experience: ${ROLES.map((role) => `${role.title} at ${role.company}`).join("; ")}. English and Hindi.`
