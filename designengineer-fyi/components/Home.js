"use client"

import { useEffect, useRef, useState } from "react"
import { CARDS, cardMedia } from "../lib/cards"
import { loadIntroRuntime } from "../lib/boot-intro"
import { INTRO_SCREEN } from "../lib/intro-screen"
import { mountStage } from "../lib/stage"
import { TREE_COLS, frameAt, restFrame, treeLabel } from "../lib/tree"
import studies from "../lib/studies.json"

const FRAMES = ["0% 0%", "50% 0%", "100% 0%", "0% 50%", "50% 50%", "100% 50%", "0% 100%", "50% 100%", "100% 100%"]

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
  const [frame, setFrame] = useState(4)
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
      if (key === "l") window.open("https://www.linkedin.com/in/shaiii/", "_blank", "noopener")
      if (key === "r") openResume()
      if (key === "c") copyEmail()
      if (key === "m") window.open("https://topmate.io/shai", "_blank", "noopener")
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

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("heyfromshai@gmail.com")
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
              <path d="M300 40 C285 135 250 235 215 330" style={{ "--len": "302.7", "--dur": "0.178s", "--delay": "0.350s" }} />
              <path d="M560 45 C470 85 360 140 278 172 C338 190 395 225 432 258 C447 272 462 258 472 238 C484 213 492 190 507 178 C520 168 530 180 540 186 C552 192 567 186 580 178 C588 198 592 220 606 218 C620 216 630 196 638 180 C644 168 660 164 668 172 C678 183 664 202 648 212 C672 214 696 204 714 190 C752 150 795 85 820 44 C832 24 816 18 802 38 C780 75 762 150 748 222 C764 196 784 174 804 174 C822 174 820 200 828 216 C834 228 854 222 872 208 C960 175 1100 168 1300 175" style={{ "--len": "1976.5", "--dur": "1.163s", "--delay": "0.628s" }} />
            </svg>
            <header className="header">
              <button type="button" className="mascot" aria-label="Boop Krish" style={{ width: 104, height: 104 }} onClick={() => setFrame((n) => (n + 1) % FRAMES.length)}>
                <span className="mascot-body">
                  <span className="mascot-frames" style={{ backgroundImage: "url(/mascot/krish-directions.webp)", backgroundPosition: FRAMES[frame] }} />
                </span>
              </button>
              <div>
                <h1 className="name">Shai Krishna</h1>
                <p className="tagline">
                  Staff Product Designer & <span className="nowrap">Design Engineer</span>
                </p>
              </div>
            </header>
            <p className="bio">
              I{" "}
              <span className="pill">
                <svg className="pill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--icon)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 20l1.2-4.3L15.6 5.3a2.1 2.1 0 0 1 3 3L8.3 18.8 4 20Z" />
                  <path d="M13.6 7.3l3 3" />
                </svg>
                design products
              </span>
              ,{" "}
              <span className="pill">
                <svg className="pill-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--icon)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8.5 7 3.5 12l5 5" />
                  <path d="m15.5 7 5 5-5 5" />
                </svg>
                write code
              </span>
              , and occasionally build things with{" "}
              <span className="pill">
                <svg className="pill-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="var(--text-strong)" d="M10 3c.7 4.4 2.6 6.3 7 7-4.4.7-6.3 2.6-7 7-.7-4.4-2.6-6.3-7-7 4.4-.7 6.3-2.6 7-7Z" />
                  <path fill="var(--text-strong)" fillOpacity="0.75" d="M18 14c.35 2.1 1.15 2.9 3.25 3.25-2.1.35-2.9 1.15-3.25 3.25-.35-2.1-1.15-2.9-3.25-3.25 2.1-.35 2.9-1.15 3.25-3.25Z" />
                </svg>
                AI
              </span>{" "}
              that nobody asked for.
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
                      <video poster={card.poster} muted autoPlay loop playsInline preload="none" aria-label={card.title} src={card.video} />
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
                    <a className="contact-row" href="https://www.linkedin.com/in/shaiii/" target="_blank" rel="noopener">
                      <span className="contact-row-label">linkedin</span>
                      <span className="contact-kbd">L</span>
                    </a>
                  </li>
                  <li>
                    <button type="button" className="contact-row" onClick={openResume}>
                      <span className="contact-row-label">resume</span>
                      <span className="contact-kbd">R</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" className="contact-row" onClick={copyEmail}>
                      <span className="contact-row-label">copy email</span>
                      <span className="contact-kbd">C</span>
                    </button>
                  </li>
                  <li>
                    <a className="contact-row" href="https://topmate.io/shai" target="_blank" rel="noopener">
                      <span className="contact-row-label">1:1 mentorship</span>
                      <span className="contact-kbd">M</span>
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
                  <video src={project.card.video} poster={project.card.poster} muted autoPlay loop playsInline />
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
                <a className="rs-action" href="/resume/shai-resume.pdf" download>download</a>
              </span>
            </div>
            <div className="rs-body">
              <div className="rs-page">
                <img src="/resume/shai-resume.png" alt="Shai Krishna resume" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
