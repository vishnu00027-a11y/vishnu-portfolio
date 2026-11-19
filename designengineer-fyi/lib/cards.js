export const CARDS = [
  {
    title: "WorkSquare",
    kind: "Founder",
    href: "/projects/worksquare",
    slug: "worksquare",
    eyebrow: "~/founder · worksquare.co",
    image: "/projects/worksquare/thumb-loop-poster.webp",
    poster: "/projects/worksquare/thumb-loop-poster.jpg",
    video: "/projects/worksquare/thumb-loop.mp4",
    videoWebm: "/projects/worksquare/thumb-loop.webm",
  },
  {
    title: "TradeFlock",
    kind: "Network",
    href: "/projects/tradeflock",
    slug: "tradeflock",
    eyebrow: "~/network · tradeflock.net",
    image: "/projects/tradeflock/thumb-loop-poster.webp",
    poster: "/projects/tradeflock/thumb-loop-poster.jpg",
    video: "/projects/tradeflock/thumb-loop.mp4",
    videoWebm: "/projects/tradeflock/thumb-loop.webm",
  },
  {
    title: "People of LA",
    kind: "Live site",
    href: "/projects/peopleofla",
    slug: "peopleofla",
    eyebrow: "~/build · peopleofla.online",
    image: "/projects/peopleofla/thumb-loop-poster.webp",
    poster: "/projects/peopleofla/thumb-loop-poster.jpg",
    video: "/projects/peopleofla/thumb-loop.mp4",
    videoWebm: "/projects/peopleofla/thumb-loop.webm",
  },
  {
    title: "Documento",
    kind: "Documents",
    href: "/projects/documento",
    slug: "documento",
    image: "/projects/documento/thumb-loop-poster.webp",
    poster: "/projects/documento/thumb-loop-poster.jpg",
    video: "/projects/documento/thumb-loop.mp4",
    videoWebm: "/projects/documento/thumb-loop.webm",
  },
  {
    title: "Canvas",
    kind: "Editor",
    href: "/projects/canvas",
    slug: "canvas",
    image: "/projects/canvas/poster.svg",
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
