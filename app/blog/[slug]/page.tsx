import ReactMarkdown from 'react-markdown';
import { getPostBySlug, getPostSlugs } from '@/lib/posts';
import Navbar from '@/components/Navbar';
import GridBackground from '@/components/ui/grid-background';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = getPostSlugs();
  return posts.map((slug) => ({
    slug: slug.replace(/\.md$/, ''),
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <main className="min-h-screen relative bg-background text-foreground overflow-hidden">
      <GridBackground />
      <Navbar />
      
      <div className="relative z-10 container mx-auto px-4 py-24 max-w-3xl">
        <Link 
          href="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </Link>

        <article>
          <header className="mb-10 text-center">
            <time className="text-sm text-muted-foreground font-mono mb-2 block">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              {post.title}
            </h1>
          </header>

          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-primary prose-pre:bg-card prose-pre:border prose-pre:border-border">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  );
}
