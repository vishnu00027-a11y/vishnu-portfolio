const FILES = [
  "/vendor/intro/turbopack.js",
  "/vendor/intro/1dvth-ke6hh4n.js",
  "/vendor/intro/1kwipkwj7x_vq.js",
  "/vendor/intro/212q5uhvbncxk.js",
  "/vendor/intro/3pm2zqtfp1cfr.js",
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

export function loadIntroRuntime() {
  if (globalThis.__designIntro) return Promise.resolve(globalThis.__designIntro)
  if (pending) return pending
  pending = (async () => {
    for (const src of FILES) await loadScript(src)
    if (!globalThis.__designIntro && !globalThis.__designIntroError) {
      globalThis.TURBOPACK.push([
        "intro-hook",
        900001,
        (runtime) => {
          try {
            const intro = runtime.i(15425)
            const svg = runtime.i(32364)
            globalThis.__designIntro = {
              canRun3D: intro.canRun3D,
              run3D: intro.run3D,
              runSvg: svg.K,
            }
          } catch (error) {
            globalThis.__designIntroError = error
          }
        },
      ])
      globalThis.TURBOPACK.push({ otherChunks: [], runtimeModuleIds: [900001] })
    }
    for (let i = 0; i < 150; i++) {
      if (globalThis.__designIntro) return globalThis.__designIntro
      if (globalThis.__designIntroError) throw globalThis.__designIntroError
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
    throw new Error("Intro runtime did not start")
  })().catch((error) => {
    pending = null
    throw error
  })
  return pending
}
