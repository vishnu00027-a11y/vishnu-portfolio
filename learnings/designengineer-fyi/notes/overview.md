# designengineer.fyi

Next.js app, single fixed viewport (no document scroll). Viewport used for capture: 1200×830.

- `html[data-intro=on]` hides `.page` (opacity 0) under a fixed loader (`--loader-bg: #1a1d21`). The loader is a Three.js scene (`data-mode="3d"` hides `.intro-svg`). It does not advance in a background task space, so scroll-0 screenshots are the dark loader. Reveal is `data-stage="fade"` then `data-intro="done"`, which starts the signature stroke, card-in stagger (`--sig-end: 1.991s`), and contact-in.
- Stage physics lives in the homepage chunk. Springs: track `{k:170,c:26}`, knob drag `{k:1400,c:75}`, knob release `{k:420,c:41}`. Cards: `perspective(1500px) translateZ(-70*|n|) rotateY(clamp(-22*n, -34, 34))` plus shade/lift/glint/rim/blur. Intro column scales to 0.92 and blurs as the track leaves index 0.
- Cards are mounted in order: AI Agent Builder, People of Bengaluru, Tapaway, Quote Builder, Designfolio, Onboarding, Soul Design System, Damnnnn, Gamified LMS. Live cards are external links with the eyebrow `~/live · things nobody asked for`. Video src is chosen at intersection time: `.av1.mp4` when the codec map includes av1, otherwise the plain `.mp4` (Tapaway).
- Experience tree rest frame is `~/experience` with every company collapsed, `--cols: 52`. It plays only after intro ends.
- Fonts: Geist and Geist Mono variable, latin subset plus Geist Mono box-drawing.
- Project open is a custom event, not a navigation: `project:open` sets `data-project=open` and pushes `/projects/<slug>`.
