import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export function generateMetadata({
  params,
}: {
  params: Params
}): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Post not found' }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      type: 'article',
    },
  }
}

// Dark editorial prose — gold headings/links on sumi.
const proseComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-12 text-2xl font-black tracking-tight text-kin sm:text-3xl"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-10 text-xl font-bold tracking-tight text-washi"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-6 text-lg leading-relaxed text-muted-foreground" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-kin underline underline-offset-4 hover:text-kin/80"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="mt-6 list-disc space-y-2 pl-6 text-lg leading-relaxed text-muted-foreground marker:text-kin"
      {...props}
    />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      className="mt-6 list-decimal space-y-2 pl-6 text-lg leading-relaxed text-muted-foreground marker:text-kin"
      {...props}
    />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="pl-1" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-washi" {...props} />
  ),
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-6 border-l-2 border-kin pl-6 text-lg italic text-washi/90"
      {...props}
    />
  ),
}

export default function BlogPostPage({ params }: { params: Params }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const { frontmatter, content } = post

  return (
    <article className="bg-sumi py-20 md:py-28">
      <div className="container max-w-3xl">
        <Link
          href="/blog"
          className="tracked-caps text-xs text-muted-foreground transition-colors hover:text-kin"
        >
          &larr; Back to Journal
        </Link>

        <header className="mt-8 border-b border-border pb-10">
          <div className="flex flex-wrap items-center gap-3">
            <time
              dateTime={frontmatter.date}
              className="tracked-caps text-xs text-muted-foreground"
            >
              {formatDate(frontmatter.date)}
            </time>
            {frontmatter.tags.map((tag) => (
              <span key={tag} className="tracked-caps text-xs text-kin">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-washi sm:text-5xl">
            {frontmatter.title}
          </h1>
          <p className="mt-5 text-xl leading-relaxed text-muted-foreground">
            {frontmatter.excerpt}
          </p>
        </header>

        <div className="pb-4">
          <MDXRemote source={content} components={proseComponents} />
        </div>
      </div>
    </article>
  )
}
