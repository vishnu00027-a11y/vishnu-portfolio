export const CARDS = [
  {
    title: "AI Agent Builder",
    kind: "Sense",
    href: "/projects/ai-agent-builder",
    slug: "ai-agent-builder",
    video: "/projects/sense/thumb-loop.av1.mp4",
    poster: "/projects/sense/thumb-loop-poster.jpg",
  },
  {
    title: "People of Bengaluru",
    kind: "built with Claude",
    href: "https://peopleofbengaluru.com/",
    external: true,
    eyebrow: "~/live · things nobody asked for",
    video: "/projects/vibecoded/people-of-bengaluru.av1.mp4",
    poster: "/projects/vibecoded/people-of-bengaluru-poster.jpg",
  },
  {
    title: "Tapaway",
    kind: "built with Claude",
    href: "https://tapaway.today/",
    external: true,
    eyebrow: "~/live · things nobody asked for",
    video: "/projects/vibecoded/tapaway.mp4",
    poster: "/projects/vibecoded/tapaway-poster.jpg",
  },
  {
    title: "Quote Builder",
    kind: "Freshworks",
    href: "/projects/quote-builder",
    slug: "quote-builder",
    video: "/projects/quote-builder/thumb-loop.av1.mp4",
    poster: "/projects/quote-builder/thumb-loop-poster.jpg",
  },
  {
    title: "Designfolio",
    kind: "Founder",
    href: "/projects/designfolio",
    slug: "designfolio",
    image: "/projects/designfolio/thumb.webp",
  },
  {
    title: "Onboarding",
    kind: "MyCaptain",
    href: "/projects/mycaptain-onboarding",
    slug: "mycaptain-onboarding",
    image: "/projects/mycaptain/thumb.webp",
  },
  {
    title: "Soul Design System",
    kind: "MyCaptain",
    href: "/projects/soul-design-system",
    slug: "soul-design-system",
    image: "/projects/soul-design-system/thumb.webp",
  },
  {
    title: "Damnnnn",
    kind: "Founder",
    href: "/projects/damnnnn",
    slug: "damnnnn",
    image: "/projects/damnnnn/thumb.webp",
  },
  {
    title: "Gamified LMS",
    kind: "MyCaptain",
    href: "/projects/gamified-lms",
    slug: "gamified-lms",
    image: "/projects/gamification/thumb.webp",
  },
]

export function cardMedia(card) {
  return card.image || card.poster
}
