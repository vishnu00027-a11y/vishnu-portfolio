const FILES = [
  "/vendor/intro/turbopack.js",
  "/vendor/intro/1kwipkwj7x_vq.js",
  "/vendor/intro/pond.js",
]

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-intro-src="${src}"]`)
    if (existing) {
      if (existing.dataset.ready === "1") resolve()
      else existing.addEventListener("load", () => resolve(), { once: true })
      return
    }
    const script = document.createElement("script")
    script.src = src
    script.async = false
    script.dataset.introSrc = src
    script.onload = () => {
      script.dataset.ready = "1"
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

let pending

export function loadPondRuntime() {
  if (globalThis.__designPond) return Promise.resolve(globalThis.__designPond)
  if (pending) return pending
  pending = (async () => {
    for (const src of FILES) await loadScript(src)
    if (!globalThis.__designPond && !globalThis.__designPondError) {
      globalThis.TURBOPACK.push([
        "pond-hook",
        900002,
        (runtime) => {
          try {
            const pond = runtime.i(85676)
            globalThis.__designPond = {
              canRunPond: pond.canRunPond,
              mountPond: pond.mountPond,
            }
          } catch (error) {
            globalThis.__designPondError = error
          }
        },
      ])
      globalThis.TURBOPACK.push({ otherChunks: [], runtimeModuleIds: [900002] })
    }
    for (let i = 0; i < 150; i++) {
      if (globalThis.__designPond) return globalThis.__designPond
      if (globalThis.__designPondError) throw globalThis.__designPondError
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
    throw new Error("Pond runtime did not start")
  })().catch((error) => {
    pending = null
    throw error
  })
  return pending
}
