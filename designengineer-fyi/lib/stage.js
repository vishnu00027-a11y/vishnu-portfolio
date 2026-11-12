const M = { k: 170, c: 26 }
const T = { k: 1400, c: 75 }
const S = { k: 420, c: 41 }

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const rubber = (v, lim) => (v * lim * 0.55) / (lim + 0.55 * v)

function spring(pos, vel, dest, cfg, dt) {
  const acc = cfg.k * (dest - pos) - cfg.c * vel
  vel += acc * dt
  pos += vel * dt
  return [pos, vel]
}

function velocity(samples) {
  const now = performance.now()
  const recent = samples.filter((s) => now - s.t < 100)
  if (recent.length < 2) return 0
  const a = recent[0]
  const b = recent[recent.length - 1]
  return b.t > a.t ? ((b.p - a.p) / (b.t - a.t)) * 1000 : 0
}

export function mountStage(e) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)")
  const coarse = matchMedia("(max-width: 640px), (pointer: coarse)")
  const light = e.root.querySelector(".stage-light")

  let viewW = 0
  let maxScroll = 0
  let railW = 0
  let pxPerStop = 1
  let stops = [0]
  let stopEls = []
  let cards = []
  let stride = 1
  let activeIndex = -1
  let index = 0
  let scroll = 0
  let scrollV = 0
  let target = 0
  let knob = 0
  let knobTarget = 0
  let knobV = 0
  let dragging = null
  let touch = null
  let snapTimer = 0
  let suppressClick = false
  let raf = 0
  let lastT = 0

  const scrollToKnob = (s) => (maxScroll ? (s / maxScroll) * railW : 0)
  const knobToScroll = (k) => (railW ? (k / railW) * maxScroll : 0)

  const magnet = (k) => {
    let best = k
    let dist = Infinity
    for (const s of stops) {
      const kk = scrollToKnob(s)
      const d = Math.abs(kk - k)
      if (d < dist) {
        dist = d
        best = kk
      }
    }
    if (dist >= 14) return k
    const a = 1 - dist / 14
    return k + (best - k) * 0.7 * a * a
  }

  const nearestIndex = (scrollPos) =>
    stops.reduce((best, s, i) => (Math.abs(s - scrollPos) < Math.abs(stops[best] - scrollPos) ? i : best), 0)

  const setProp = (card, name, value) => {
    if (card.set.get(name) !== value) {
      card.set.set(name, value)
      card.el.style.setProperty(name, value)
    }
  }

  function aria() {
    e.slider.setAttribute("aria-valuenow", String(maxScroll ? Math.round((target / maxScroll) * 100) : 0))
    e.slider.setAttribute("aria-valuetext", index === 0 ? "Intro" : `Project ${index} of ${stops.length - 1}`)
  }

  function render() {
    e.track.style.transform = `translate3d(${(-scroll).toFixed(2)}px,0,0)`
    const span = stops[1] || maxScroll || 1
    const u = clamp(scroll / span, 0, 1)
    const d = u * u * (3 - 2 * u)
    e.intro.style.transform = `scale(${(1 - (1 - 0.92) * d).toFixed(4)})`
    e.intro.style.filter = !coarse.matches && d > 0.002 ? `blur(${(8 * d).toFixed(2)}px)` : ""
    e.intro.style.opacity = (1 - 0.5 * d).toFixed(3)
    e.intro.toggleAttribute("inert", d > 0.5)
    for (const card of cards) {
      const n = coarse.matches ? 0 : (card.centre - scroll - viewW / 2) / stride
      const rot = clamp(-(22 * n), -34, 34)
      const z = -(70 * Math.min(1.5, Math.abs(n)))
      setProp(card, "transform", `perspective(1500px) translateZ(${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg)`)
      if (coarse.matches) continue
      const rad = (rot * Math.PI) / 180
      const l = -0.5 * Math.sin(rad) + 0.79 * Math.cos(rad) - 0.79
      setProp(card, "--shade", Math.max(0, -(1.6 * l) + 0.12 * Math.min(1, Math.abs(n))).toFixed(3))
      setProp(card, "--lift", Math.max(0, 1.4 * l).toFixed(3))
      setProp(card, "--glint-x", `${(50 - 2.4 * rot).toFixed(1)}%`)
      setProp(card, "--glint", (0.1 + 0.16 * Math.max(0, 1 - Math.abs(rot + 8) / 30)).toFixed(3))
      setProp(card, "--rim", (0.08 + 0.32 * Math.max(0, -rot / 34)).toFixed(3))
      const blur = 2.4 * Math.max(0, Math.min(1.4, Math.abs(n)) - 0.15)
      setProp(card, "filter", blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "")
    }
    light?.style.setProperty("opacity", d.toFixed(3))
    e.knob.style.transform = `translate3d(${knob.toFixed(2)}px,0,0)`
    const ui = nearestIndex(knobToScroll(knob))
    if (ui !== activeIndex) {
      stopEls[activeIndex]?.removeAttribute("data-on")
      stopEls[ui]?.setAttribute("data-on", "")
      activeIndex = ui
    }
  }

  function measure() {
    viewW = e.root.clientWidth
    const nodes = Array.from(e.track.querySelectorAll("[data-card]"))
    cards = nodes
      .map((el) => ({
        el: el.querySelector(".card-body"),
        centre: el.offsetLeft + el.offsetWidth / 2,
        set: new Map(),
      }))
      .filter((c) => c.el)
    stride = nodes.length > 1 ? nodes[1].offsetLeft - nodes[0].offsetLeft : nodes[0]?.offsetWidth || 1
    maxScroll = Math.max(0, e.track.offsetWidth - viewW)
    railW = e.rail.clientWidth
    pxPerStop = railW / 40 || 1
    stops = [0, ...nodes.map((el) => clamp(el.offsetLeft + el.offsetWidth / 2 - viewW / 2, 0, maxScroll))]
    stopEls.forEach((el) => el.remove())
    stopEls = stops.map((s, i) => {
      const el = document.createElement("span")
      el.className = "slider-stop"
      el.textContent = String(i).padStart(2, "0")
      el.style.left = `${scrollToKnob(s).toFixed(2)}px`
      e.stops.appendChild(el)
      return el
    })
    activeIndex = -1
    index = Math.min(index, stops.length - 1)
    scroll = target = stops[index]
    scrollV = 0
    knob = knobTarget = scrollToKnob(scroll)
    knobV = 0
    aria()
    render()
  }

  function snapTo(i) {
    index = clamp(i, 0, stops.length - 1)
    target = stops[index]
    aria()
    kick()
  }

  function frame(now) {
    const dt = lastT ? Math.min((now - lastT) / 1000, 1 / 30) : 1 / 60
    lastT = now
    if (!dragging) knobTarget = clamp(scrollToKnob(target), 0, railW)
    if (reduced.matches) {
      scroll = target
      scrollV = 0
      if (!dragging) {
        knob = knobTarget
        knobV = 0
      }
    }
    const touching = !!touch?.active
    if (touching) scroll = target
    let left = dt
    while (left > 1e-6) {
      const step = Math.min(left, 1 / 240)
      if (!reduced.matches && !touching) {
        ;[scroll, scrollV] = spring(scroll, scrollV, target, M, step)
      }
      if (!reduced.matches || dragging) {
        ;[knob, knobV] = spring(knob, knobV, knobTarget, dragging ? T : S, step)
      }
      if (knob < 0 || knob > railW) {
        knob = clamp(knob, 0, railW)
        knobV = 0
      }
      left -= step
    }
    render()
    const moving =
      Math.abs(target - scroll) > 0.05 ||
      Math.abs(scrollV) > 0.05 ||
      Math.abs(knobTarget - knob) > 0.05 ||
      Math.abs(knobV) > 0.05 ||
      dragging ||
      touch?.active
    if (moving) raf = requestAnimationFrame(frame)
    else {
      scroll = target
      knob = knobTarget
      scrollV = knobV = 0
      render()
      raf = 0
      lastT = 0
      delete document.documentElement.dataset.sliding
    }
  }

  function kick() {
    if (!raf) {
      lastT = 0
      if (coarse.matches) document.documentElement.dataset.sliding = ""
      raf = requestAnimationFrame(frame)
    }
  }

  const railX = (ev) => ev.clientX - e.rail.getBoundingClientRect().left

  function onSliderDown(ev) {
    if (ev.button !== 0) return
    ev.preventDefault()
    e.slider.setPointerCapture(ev.pointerId)
    e.slider.focus({ preventScroll: true })
    const x = railX(ev)
    const offset = Math.abs(x - knob) < e.knob.offsetWidth ? knob - x : 0
    dragging = { id: ev.pointerId, offset, samples: [{ t: performance.now(), p: x + offset }] }
    e.slider.setAttribute("data-active", "")
    knobTarget = magnet(clamp(x + offset, 0, railW))
    target = knobToScroll(knobTarget)
    kick()
  }

  function onSliderMove(ev) {
    if (!dragging || ev.pointerId !== dragging.id) return
    const x = railX(ev) + dragging.offset
    dragging.samples.push({ t: performance.now(), p: x })
    if (dragging.samples.length > 12) dragging.samples.shift()
    knobTarget = magnet(clamp(x, 0, railW))
    target = knobToScroll(knobTarget)
    kick()
  }

  function onSliderUp(ev) {
    if (!dragging || ev.pointerId !== dragging.id) return
    const x = clamp(railX(ev) + dragging.offset + 0.12 * velocity(dragging.samples), 0, railW)
    dragging = null
    e.slider.removeAttribute("data-active")
    snapTo(nearestIndex(knobToScroll(x)))
  }

  function onKey(ev) {
    const last = stops.length - 1
    const map = {
      ArrowRight: index + 1,
      ArrowUp: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index - 1,
      Home: 0,
      End: last,
      PageUp: index + 1,
      PageDown: index - 1,
    }
    const next = map[ev.key]
    if (next === undefined) return
    ev.preventDefault()
    snapTo(next)
  }

  function onWheel(ev) {
    if (document.documentElement.dataset.intro === "on") return
    const intro = e.intro
    if (
      index === 0 &&
      scroll < 1 &&
      Math.abs(ev.deltaY) > Math.abs(ev.deltaX) &&
      intro.scrollHeight > intro.clientHeight + 1 &&
      !(ev.deltaY > 0 ? intro.scrollTop + intro.clientHeight >= intro.scrollHeight - 1 : intro.scrollTop <= 0)
    ) {
      return
    }
    ev.preventDefault()
    const scale = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? viewW : 1
    const delta = (Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY) * scale
    target = clamp(target + delta, 0, maxScroll)
    clearTimeout(snapTimer)
    snapTimer = window.setTimeout(() => snapTo(nearestIndex(target)), 180)
    kick()
  }

  function onWindowKey(ev) {
    const root = document.documentElement
    if (root.dataset.intro === "on" || root.dataset.project === "open" || root.dataset.resume === "open") return
    if (ev.defaultPrevented) return
    if (
      ev.target instanceof HTMLElement &&
      (ev.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName))
    ) {
      return
    }
    if (ev.target !== e.slider) onKey(ev)
  }

  function onTouchDown(ev) {
    if (ev.pointerType !== "touch" || dragging || e.slider.contains(ev.target)) return
    touch = { id: ev.pointerId, x0: ev.clientX, start: scroll, active: false, samples: [] }
  }

  function onTouchMove(ev) {
    if (!touch || ev.pointerId !== touch.id) return
    const dx = ev.clientX - touch.x0
    if (!touch.active && Math.abs(dx) > 8) {
      touch.active = true
      scrollV = 0
      e.root.setPointerCapture(ev.pointerId)
    }
    if (!touch.active) return
    const next = touch.start - dx
    target = next < 0 ? -rubber(-next, 160) : next > maxScroll ? maxScroll + rubber(next - maxScroll, 160) : next
    touch.samples.push({ t: performance.now(), p: target })
    if (touch.samples.length > 12) touch.samples.shift()
    kick()
  }

  function onTouchUp(ev) {
    if (!touch || ev.pointerId !== touch.id) return
    const was = touch.active
    const v = velocity(touch.samples)
    const dest = clamp(target + 0.12 * v * 1.5, 0, maxScroll)
    touch = null
    if (!was) return
    scrollV = v
    suppressClick = true
    setTimeout(() => {
      suppressClick = false
    }, 0)
    snapTo(nearestIndex(dest))
  }

  function onClick(ev) {
    const card = ev.target.closest("[data-card]")
    if (!card) return
    if (card.hasAttribute("data-external")) {
      if (suppressClick) ev.preventDefault()
      return
    }
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return
    ev.preventDefault()
    if (suppressClick) return
    const media = card.querySelector(".card-media")
    if (!media) return
    const i = Array.from(e.track.querySelectorAll("[data-card]")).indexOf(card)
    dispatchEvent(new CustomEvent("project:open", { detail: { index: i, image: media } }))
  }

  e.slider.addEventListener("pointerdown", onSliderDown)
  e.slider.addEventListener("pointermove", onSliderMove)
  e.slider.addEventListener("pointerup", onSliderUp)
  e.slider.addEventListener("pointercancel", onSliderUp)
  e.slider.addEventListener("keydown", onKey)
  e.root.addEventListener("wheel", onWheel, { passive: false })
  e.root.addEventListener("pointerdown", onTouchDown)
  e.root.addEventListener("pointermove", onTouchMove)
  e.root.addEventListener("pointerup", onTouchUp)
  e.root.addEventListener("pointercancel", onTouchUp)
  e.track.addEventListener("click", onClick)
  window.addEventListener("keydown", onWindowKey)
  window.addEventListener("resize", measure)
  document.fonts?.ready.then(measure)

  measure()

  return () => {
    cancelAnimationFrame(raf)
    delete document.documentElement.dataset.sliding
    clearTimeout(snapTimer)
    e.slider.removeEventListener("pointerdown", onSliderDown)
    e.slider.removeEventListener("pointermove", onSliderMove)
    e.slider.removeEventListener("pointerup", onSliderUp)
    e.slider.removeEventListener("pointercancel", onSliderUp)
    e.slider.removeEventListener("keydown", onKey)
    e.root.removeEventListener("wheel", onWheel)
    e.root.removeEventListener("pointerdown", onTouchDown)
    e.root.removeEventListener("pointermove", onTouchMove)
    e.root.removeEventListener("pointerup", onTouchUp)
    e.root.removeEventListener("pointercancel", onTouchUp)
    e.track.removeEventListener("click", onClick)
    window.removeEventListener("keydown", onWindowKey)
    window.removeEventListener("resize", measure)
  }
}
