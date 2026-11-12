import "./globals.css"

export const metadata = {
  title: "Vishnu Kumar | Full Stack Developer",
  description:
    "Vishnu Kumar is a full stack developer and SDE 2 at Meta. Founder of Shivank Tech and WorkSquare. Shipped 25+ production apps.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="vbml_G_variable EGX1Hq_variable" data-intro="on" style={{ "--sig-end": "1.991s" }}>
      <body>{children}</body>
    </html>
  )
}
