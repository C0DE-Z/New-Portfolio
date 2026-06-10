import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import Navbar from '@/components/Navbar';
import GridBackground from '@/components/ui/grid-background';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen relative bg-background text-foreground overflow-hidden">
      <GridBackground />
      <Navbar />
      
      <div className="relative z-10 container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          Blog
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 backdrop-blur-sm"
            >
              <article className="flex flex-col h-full">
                <div className="mb-4">
                  <time className="text-sm text-muted-foreground font-mono">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground line-clamp-3 flex-grow">
                  {post.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Read more 
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m-4-4h18" />
                  </svg>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
