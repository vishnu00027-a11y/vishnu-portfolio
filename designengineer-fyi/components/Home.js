"use client"

import { useEffect, useRef, useState } from "react"
import { CARDS, cardMedia } from "../lib/cards"
import { loadIntroRuntime } from "../lib/boot-intro"
import { loadPondRuntime } from "../lib/boot-pond"
import { INTRO_SCREEN } from "../lib/intro-screen"
import { mountStage } from "../lib/stage"
import { TREE_COLS, frameAt, restFrame, treeLabel } from "../lib/tree"
import studies from "../lib/studies.json"

const BOT = /bot|crawl|spider|slurp|lighthouse|inspectiontool|bingpreview|facebookexternalhit|embedly|preview/i

function paintFilm(canvas) {
  if (!canvas) return
  const smooth = (v) => {
    const x = Math.min(1, Math.max(0, v))
    return x * x * (3 - 2 * x)
  }
  const w = Math.max(1, Math.round(innerWidth))
  const h = Math.max(1, Math.round(innerHeight))
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const image = ctx.createImageData(w, h)
  const data = image.data
  const [cr, cg, cb] = [236, 241, 248]
  for (let y = 0; y < h; y++) {
    const e = (y / h - 0) / 0.7
    const f = (y / h - 0.45) / 1.1
    for (let x = 0; x < w; x++) {
      const k = (x / w - 0.5) / 0.9
      const l = (x / w - 0.5) / 1.4
      const m = 0.03 * (1 - smooth(Math.sqrt(k * k + e * e)))
      const n = 0.42 * smooth((Math.sqrt(l * l + f * f) - 0.5) / 0.5)
      const o = 1 - (1 - m) * (1 - n)
      const p = o > 0 ? (m * (1 - n)) / o : 0
      const q = (y * w + x) * 4
      data[q] = cr * p
      data[q + 1] = cg * p
      data[q + 2] = cb * p
      const r = o > 0.001 ? Math.min(24, 255 / Math.max(8, Math.abs(cg * p - 18))) : 0
      data[q + 3] = 255 * o + (Math.random() + Math.random() - 1) * r
    }
  }
  ctx.putImageData(image, 0, 0)
}

function OutIcon() {
  return (
    <svg className="card-out" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </svg>
  )
}

function RowIcon({ children }) {
  return (
    <span className="contact-row-icon">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </span>
  )
}

function Chevron() {
  return (
    <svg className="contact-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  )
}

export default function Home({ markup }) {
  const rootRef = useRef(null)
  const introRef = useRef(null)
  const trackRef = useRef(null)
  const sliderRef = useRef(null)
  const railRef = useRef(null)
  const knobRef = useRef(null)
  const stopsRef = useRef(null)
  const treeRef = useRef(null)
  const mascotRef = useRef(null)
  const mascotBodyRef = useRef(null)
  const mascotPhotoRef = useRef(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const [project, setProject] = useState(null)

  useEffect(() => {
    const canvas = document.getElementById("film-light")
    const draw = () => paintFilm(canvas)
    draw()
    window.addEventListener("resize", draw)
    return () => window.removeEventListener("resize", draw)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const overlay = document.querySelector(".intro-overlay")
    if (!overlay) return
    let stop = () => {}
    let cancelled = false
    const finish = () => overlay.remove()
    const failOpen = () => {
      root.dataset.intro = "done"
      overlay.setAttribute("data-stage", "fade")
      window.setTimeout(() => overlay.remove(), 450)
    }
    if (BOT.test(navigator.userAgent)) {
      root.dataset.intro = "done"
      overlay.remove()
      return
    }
    loadIntroRuntime()
      .then((intro) => {
        if (cancelled) return
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
        const svg = () => {
          delete overlay.dataset.mode
          stop = intro.runSvg(overlay, INTRO_SCREEN, finish) || (() => {})
        }
        if (reduced || !intro.canRun3D()) {
          svg()
          return
        }
        try {
          stop = intro.run3D(overlay, finish) || (() => {})
        } catch {
          overlay.querySelectorAll(".intro-3d, .intro-vignette").forEach((node) => node.remove())
          svg()
        }
      })
      .catch(failOpen)
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  useEffect(() => {
    const canvas = document.querySelector("canvas.pond")
    if (!canvas) return
    const root = document.documentElement
    let stop = () => {}
    let cancelled = false
    const start = () => {
      if (cancelled || root.dataset.intro === "on") return
      loadPondRuntime()
        .then((pond) => {
          if (cancelled || !pond.canRunPond()) return
          stop = pond.mountPond(canvas) || (() => {})
        })
        .catch(() => {})
    }
    const observer = new MutationObserver(start)
    observer.observe(root, { attributes: true, attributeFilter: ["data-intro"] })
    start()
    return () => {
      cancelled = true
      observer.disconnect()
      stop()
    }
  }, [])

  useEffect(() => {
    const el = mascotRef.current
    const photo = mascotPhotoRef.current
    if (!el || !photo) return
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches
    if (fine) {
      const onMove = (event) => {
        const box = el.getBoundingClientRect()
        const dx = event.clientX - (box.left + box.width / 2)
        const dy = event.clientY - (box.top + box.height / 2)
        const dist = Math.hypot(dx, dy)
        if (dist < 70) {
          photo.style.transform = "translate(0px, 0px)"
          return
        }
        const mag = Math.min(5, dist / 80)
        photo.style.transform = `translate(${((dx / dist) * mag).toFixed(2)}px, ${((dy / dist) * mag * 0.55).toFixed(2)}px)`
      }
      addEventListener("pointermove", onMove, { passive: true })
      return () => removeEventListener("pointermove", onMove)
    }
    const path = [4, 2, -2, -4, -2, 2]
    let index = 0
    let timer = 0
    let visible = false
    const step = () => {
      if (visible && !document.hidden) {
        const x = path[index % path.length]
        index += 1
        photo.style.transform = `translate(${x}px, 0px)`
      }
      timer = window.setTimeout(step, 1100 + Math.random() * 500)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
    })
    observer.observe(el)
    timer = window.setTimeout(step, 900)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const node = treeRef.current
    if (!node) return
    const root = document.documentElement
    let raf = 0
    let start = 0
    const play = (t) => {
      if (!start) start = t
      node.textContent = frameAt((t - start) / 1000)
      raf = requestAnimationFrame(play)
    }
    const startPlay = () => {
      if (root.dataset.intro === "on" || raf) return
      raf = requestAnimationFrame(play)
    }
    const observer = new MutationObserver(startPlay)
    observer.observe(root, { attributes: true, attributeFilter: ["data-intro"] })
    startPlay()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const refs = {
      root: rootRef.current,
      intro: introRef.current,
      track: trackRef.current,
      slider: sliderRef.current,
      rail: railRef.current,
      knob: knobRef.current,
      stops: stopsRef.current,
    }
    if (Object.values(refs).some((node) => !node)) return
    return mountStage(refs)
  }, [])

  useEffect(() => {
    const open = (event) => {
      const card = CARDS[event.detail.index]
      if (!card || card.external) return
      const study = studies.find((item) => item.title === card.title)
      document.documentElement.dataset.projectMotion = ""
      document.documentElement.dataset.project = "open"
      setProject({ card, study })
      if (card.slug) history.pushState({ pv: event.detail.index }, "", `/projects/${card.slug}`)
    }
    const onPop = () => {
      if (!location.pathname.startsWith("/projects/")) closeProject()
    }
    addEventListener("project:open", open)
    addEventListener("popstate", onPop)
    const slug = location.pathname.split("/projects/")[1]
    if (slug) {
      const card = CARDS.find((item) => item.slug === decodeURIComponent(slug))
      const study = card && studies.find((item) => item.title === card.title)
      if (card && study) {
        document.documentElement.dataset.project = "open"
        setProject({ card, study })
      }
    }
    return () => {
      removeEventListener("project:open", open)
      removeEventListener("popstate", onPop)
    }
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      const root = document.documentElement
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (root.dataset.intro === "on") return
      if (event.key === "Escape") {
        if (root.dataset.project === "open") closeProject()
        else if (root.dataset.resume === "open") closeResume()
        else if (contactOpen) setContactOpen(false)
        return
      }
      if (root.dataset.project === "open" || root.dataset.resume === "open" || contactOpen) return
      const key = event.key.toLowerCase()
      if (key === "l") window.open("https://www.linkedin.com/in/vishnu-jaiswal-528905162", "_blank", "noopener")
      if (key === "r") openResume()
      if (key === "c") copyEmail()
      if (key === "x") window.open("https://www.x.com/drsunlocked", "_blank", "noopener")
      if (key === "g") window.open("https://github.com/vishnu00027-a11y", "_blank", "noopener")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [contactOpen])

  function closeProject() {
    delete document.documentElement.dataset.project
    delete document.documentElement.dataset.projectMotion
    setProject(null)
    if (location.pathname.startsWith("/projects/")) history.pushState({}, "", "/")
  }

  function openResume() {
    document.documentElement.dataset.resumeMotion = ""
    document.documentElement.dataset.resume = "open"
    setResumeOpen(true)
    setContactOpen(false)
  }

  function closeResume() {
    delete document.documentElement.dataset.resume
    delete document.documentElement.dataset.resumeMotion
    setResumeOpen(false)
  }

  function boop() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    mascotBodyRef.current?.animate(
      [
        { transform: "scale(1, 1)", easing: "ease-in" },
        { transform: "scale(1.08, 0.9)", offset: 0.18, easing: "ease-out" },
        { transform: "scale(0.96, 1.06)", offset: 0.45, easing: "ease-in-out" },
        { transform: "scale(1.02, 0.98)", offset: 0.72, easing: "ease-in-out" },
        { transform: "scale(1, 1)" },
      ],
      { duration: 420, easing: "linear" },
    )
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("Vishnu00027@gmail.com")
    } catch {
      /* clipboard can be blocked */
    }
    setCopied(true)
    setContactOpen(false)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <>
      <canvas id="film-light" className="film-light" aria-hidden="true" />
      <div className="iso intro-overlay" data-theme="dark" role="status" aria-label="Loading" dangerouslySetInnerHTML={{ __html: markup }} />
      <main className="page" ref={rootRef}>
        <canvas className="pond" aria-hidden="true" />
        <div className="intro-layer" ref={introRef}>
          <section className="intro">
            <svg className="signature" viewBox="80 20 1240 330" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M250 70 C270 150 300 240 255 310" />
              <path d="M270 130 C330 70 360 160 410 190 C455 218 420 262 475 238 C540 200 560 145 620 172 C675 198 650 255 715 228 C790 190 840 145 910 175 C980 205 1020 155 1100 148" />
            </svg>
            <header className="header">
              <button type="button" className="mascot" ref={mascotRef} aria-label="Boop Vishnu" style={{ width: 104, height: 104 }} onClick={boop}>
                <span className="mascot-body" ref={mascotBodyRef}>
                  <img ref={mascotPhotoRef} className="mascot-photo" src="/mascot/vishnu.webp" alt="" />
                </span>
              </button>
              <div>
                <h1 className="name">Vishnu Kumar</h1>
                <p className="tagline">
                  Full Stack Developer / <span className="nowrap">SDE 2 at Meta</span>
                </p>
              </div>
            </header>
            <p className="bio">
              Seasoned development professional. Shipped{" "}
              <span className="pill">25+ production apps</span>, doing{" "}
              <span className="pill">$10K+ MRR</span>, founder of{" "}
              <span className="pill">Shivank Tech</span> and{" "}
              <span className="pill">WorkSquare</span>.
            </p>
            <pre className="tree" ref={treeRef} role="img" aria-label={treeLabel} style={{ "--cols": TREE_COLS }}>
              {restFrame()}
            </pre>
          </section>
        </div>
        <div className="stage-light" aria-hidden="true" />
        <div className="projects" ref={trackRef}>
          {CARDS.map((card, i) => (
            <a
              key={card.title}
              className="card"
              href={card.href}
              data-card="true"
              draggable="false"
              style={{ "--i": i }}
              {...(card.external ? { target: "_blank", rel: "noopener", "data-external": "" } : {})}
            >
              <span className="card-body">
                {card.eyebrow ? <span className="card-eyebrow">{card.eyebrow}</span> : null}
                <span className="card-media">
                  {card.video ? (
                    <span className="loop-video">
                      <video poster={card.poster} muted autoPlay loop playsInline preload="none" aria-label={card.title}>
                        {card.videoWebm ? <source src={card.videoWebm} type="video/webm" /> : null}
                        <source src={card.video} type="video/mp4" />
                      </video>
                    </span>
                  ) : (
                    <img alt={card.title} draggable="false" src={card.image} />
                  )}
                </span>
                <span className="card-floor" aria-hidden="true">
                  <img className="card-reflection" src={cardMedia(card)} alt="" draggable="false" />
                </span>
                <span className="card-meta">
                  <span className="card-title" data-mini="text">{card.title}</span>
                  <span className="card-kind" data-mini="text">
                    {card.kind}
                    {card.external ? <OutIcon /> : null}
                  </span>
                </span>
              </span>
            </a>
          ))}
        </div>
        <nav className="contact" aria-label="Contact">
          <div className="contact-cap" data-open={contactOpen ? "" : undefined}>
            <button
              type="button"
              className="contact-head"
              aria-expanded={contactOpen}
              aria-controls="contact-ways"
              onClick={() => setContactOpen((open) => !open)}
            >
              <span className="contact-label">
                <span className="contact-face" aria-hidden={copied}>contact</span>
                <span className="contact-face contact-face-done" aria-hidden={!copied}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5 10 17.5 19 7" />
                  </svg>
                  copied
                </span>
              </span>
              <Chevron />
            </button>
            {contactOpen ? (
              <div className="contact-ways">
                <ul id="contact-ways" className="contact-list">
                  <li>
                    <a className="contact-row" href="https://www.linkedin.com/in/vishnu-jaiswal-528905162" target="_blank" rel="noopener">
                      <RowIcon>
                        <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
                        <path d="M8 10.5V16M8 7.75v.01M11.5 16v-5.5M11.5 13c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v3" />
                      </RowIcon>
                      <span className="contact-row-label">LinkedIn</span>
                      <kbd className="contact-kbd">L</kbd>
                    </a>
                  </li>
                  <li>
                    <button type="button" className="contact-row" onClick={openResume}>
                      <RowIcon>
                        <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8Z" />
                        <path d="M14 3.5V8h4.5M9 12.5h6M9 16h4" />
                      </RowIcon>
                      <span className="contact-row-label">Resume</span>
                      <kbd className="contact-kbd">R</kbd>
                    </button>
                  </li>
                  <li>
                    <button type="button" className="contact-row" onClick={copyEmail}>
                      <RowIcon>
                        <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5" />
                        <path d="M15.5 8.5V6.5a2.5 2.5 0 0 0-2.5-2.5H6.5A2.5 2.5 0 0 0 4 6.5V13a2.5 2.5 0 0 0 2.5 2.5h2" />
                      </RowIcon>
                      <span className="contact-row-label">Email</span>
                      <kbd className="contact-kbd">C</kbd>
                    </button>
                  </li>
                  <li>
                    <a className="contact-row" href="https://www.x.com/drsunlocked" target="_blank" rel="noopener">
                      <RowIcon>
                        <path d="M5 5.5 19 18.5M19 5.5 5 18.5" />
                      </RowIcon>
                      <span className="contact-row-label">X</span>
                      <kbd className="contact-kbd">X</kbd>
                    </a>
                  </li>
                  <li>
                    <a className="contact-row" href="https://github.com/vishnu00027-a11y" target="_blank" rel="noopener">
                      <RowIcon>
                        <path d="M9 19c-4 1.5-4-2.5-6-3m12 6v-3.9a3.1 3.1 0 0 0-.9-2.4c3-.3 6.1-1.5 6.1-6.6a5.1 5.1 0 0 0-1.4-3.5 4.8 4.8 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a12.1 12.1 0 0 0-6.2 0C6.4 2.8 5.3 3.1 5.3 3.1a4.8 4.8 0 0 0-.1 3.5 5.1 5.1 0 0 0-1.4 3.6c0 5 3.1 6.2 6.1 6.6a3.1 3.1 0 0 0-.9 2.4V22" />
                      </RowIcon>
                      <span className="contact-row-label">GitHub</span>
                      <kbd className="contact-kbd">G</kbd>
                    </a>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
          <span className="contact-status" role="status" aria-live="polite">{copied ? "Email copied" : ""}</span>
        </nav>
        <div
          className="slider"
          ref={sliderRef}
          role="slider"
          tabIndex={0}
          aria-label="Scroll through projects"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-valuetext="Intro"
        >
          <div className="slider-well">
            <span className="slider-groove" />
            <div className="slider-rail" ref={railRef}>
              <div className="slider-knob" ref={knobRef}>
                <span className="slider-cap" />
              </div>
            </div>
          </div>
          <div className="slider-stops" ref={stopsRef} />
        </div>
      </main>
      {project ? (
        <div className="pv" data-revealed="" data-static="">
          <div className="pv-scroll" onClick={(event) => { if (event.target === event.currentTarget) closeProject() }}>
            <div className="pv-topbar">
              <button type="button" onClick={closeProject}>close</button>
              <span>{project.card.kind}</span>
            </div>
            <div className="pv-column">
              <div className="pv-hero" data-landed="">
                {project.card.video ? (
                  <video poster={project.card.poster} muted autoPlay loop playsInline preload="none">
                    {project.card.videoWebm ? <source src={project.card.videoWebm} type="video/webm" /> : null}
                    <source src={project.card.video} type="video/mp4" />
                  </video>
                ) : (
                  <img src={project.card.image} alt={project.card.title} />
                )}
              </div>
              <div className="pv-head">
                <p>
                  <span>{project.card.kind}</span>
                  {project.study?.year ? <span>{project.study.year}</span> : null}
                </p>
                <h2>{project.study?.headline || project.card.title}</h2>
                {project.study?.summary ? <p className="pv-summary">{project.study.summary}</p> : null}
              </div>
              {project.study?.details?.length ? (
                <dl className="pv-details">
                  {project.study.details.map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <div className="pv-foot">
                <button type="button" onClick={closeProject}>back</button>
                {project.study?.link ? (
                  <a href={project.study.link} target="_blank" rel="noopener">{project.study.linkLabel}</a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {resumeOpen ? (
        <div className="rs" data-mode={typeof window !== "undefined" && matchMedia("(max-width: 640px)").matches ? "sheet" : undefined}>
          <div className="rs-backdrop" onClick={closeResume} />
          <div className="rs-window" style={{ left: "max(32px, calc(50vw - 410px))", top: 32, width: "min(820px, calc(100vw - 64px))", height: "min(1060px, calc(100vh - 64px))" }}>
            <div className="rs-bar">
              <button type="button" className="rs-close" onClick={closeResume} aria-label="Close resume">esc</button>
              <span className="rs-title">resume.pdf</span>
              <span className="rs-actions">
                <a className="rs-action" href="/resume/vishnu-resume.pdf" download>download</a>
              </span>
            </div>
            <div className="rs-body">
              <div className="rs-page">
                <img src="/resume/vishnu-resume-1.webp" alt="Resume, page 1" />
              </div>
              <div className="rs-page">
                <img src="/resume/vishnu-resume-2.webp" alt="Resume, page 2" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
