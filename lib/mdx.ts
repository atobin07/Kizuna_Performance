// Server-only: relies on the Node fs/path APIs, so it must never be imported
// into a Client Component.
import fs from 'node:fs'
import path from 'node:path'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export type PostFrontmatter = {
  title: string
  date: string
  excerpt: string
  tags: string[]
}

export type PostMeta = PostFrontmatter & { slug: string }

/** Minimal `---` delimited frontmatter parser (no gray-matter dependency). */
function parseFrontmatter(raw: string): {
  frontmatter: PostFrontmatter
  content: string
} {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw)

  const defaults: PostFrontmatter = {
    title: 'Untitled',
    date: new Date().toISOString().slice(0, 10),
    excerpt: '',
    tags: [],
  }

  if (!match) {
    return { frontmatter: defaults, content: raw }
  }

  const [, block, content] = match
  const fm: PostFrontmatter = { ...defaults }

  for (const line of block.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()

    // Strip surrounding quotes.
    value = value.replace(/^["']|["']$/g, '')

    if (key === 'title') fm.title = value
    else if (key === 'date') fm.date = value
    else if (key === 'excerpt') fm.excerpt = value
    else if (key === 'tags') {
      // Supports: [a, b, c] or comma-separated a, b, c
      fm.tags = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    }
  }

  return { frontmatter: fm, content: content.trim() }
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
    const { frontmatter } = parseFrontmatter(raw)
    return { slug, ...frontmatter }
  })

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getPostBySlug(
  slug: string
): { frontmatter: PostFrontmatter; content: string } | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf8')
  return parseFrontmatter(raw)
}
