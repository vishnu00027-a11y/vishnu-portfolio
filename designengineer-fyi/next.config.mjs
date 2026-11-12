/** @type {import('next').NextConfig} */
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  images: { unoptimized: true },
  outputFileTracingRoot: root,
}

export default nextConfig
