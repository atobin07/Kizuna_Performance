import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Training principles, recovery science, and notes on mastery from Kizuna Performance.',
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <section className="bg-sumi py-20 md:py-28">
      <div className="container max-w-3xl">
        <div className="mb-14">
          <p className="tracked-caps mb-4 text-xs font-medium text-kin">
            The Journal
          </p>
          <h1 className="text-4xl font-black tracking-tight text-washi sm:text-6xl">
            Notes on the craft.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Principles, science, and philosophy from the training room.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts yet. Check back soon.
          </p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {posts.map((post) => (
              <li key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`} className="block py-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <time
                      dateTime={post.date}
                      className="tracked-caps text-xs text-muted-foreground"
                    >
                      {formatDate(post.date)}
                    </time>
                    {post.tags.slice(0, 1).map((tag) => (
                      <span
                        key={tag}
                        className="tracked-caps text-xs text-kin"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-washi transition-colors group-hover:text-kin">
                    {post.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
