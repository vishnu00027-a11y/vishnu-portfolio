export const CARDS = [
  {
    title: "WorkSquare",
    kind: "Founder",
    href: "/projects/worksquare",
    slug: "worksquare",
    eyebrow: "~/founder · worksquare.co",
    image: "/projects/worksquare/poster.svg",
  },
  {
    title: "TradeFlock",
    kind: "Network",
    href: "/projects/tradeflock",
    slug: "tradeflock",
    eyebrow: "~/network · tradeflock.net",
    image: "/projects/tradeflock/poster.svg",
  },
  {
    title: "Nymph",
    kind: "Dating",
    href: "/projects/nymph",
    slug: "nymph",
    image: "/projects/nymph/poster.svg",
  },
  {
    title: "Canvas",
    kind: "Editor",
    href: "/projects/canvas",
    slug: "canvas",
    image: "/projects/canvas/poster.svg",
  },
  {
    title: "Documento",
    kind: "Documents",
    href: "/projects/documento",
    slug: "documento",
    image: "/projects/documento/poster.svg",
  },
  {
    title: "Booking systems",
    kind: "Appointments",
    href: "/projects/booking-systems",
    slug: "booking-systems",
    eyebrow: "~/build · dentists, clinics, trades",
    image: "/projects/booking/poster.svg",
  },
]

export function cardMedia(card) {
  return card.image || card.poster
}
