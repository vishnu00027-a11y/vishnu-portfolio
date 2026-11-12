import { readFileSync } from "node:fs"
import { join } from "node:path"

export const introMarkup = readFileSync(join(process.cwd(), "public/intro/mac.svg"), "utf8")
