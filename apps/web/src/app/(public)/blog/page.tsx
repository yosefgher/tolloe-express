import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Blog & News' };

async function getPosts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/blog/posts?limit=12`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return (await res.json()).data?.items || [];
  } catch { return []; }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Blog & News</h1>
          <p className="text-gray-500 mt-2">Latest updates from TOLLOE EXPRESS</p>
        </div>
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No posts published yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: { slug: string; title: string; excerpt: string; publishedAt: string; author: { profile: { firstName: string; lastName: string } }; tags: string[] }) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card p-5 hover:shadow-md transition-shadow group">
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags?.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="badge bg-brand-50 text-brand-700 text-xs">{tag}</span>
                  ))}
                </div>
                <h2 className="font-bold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors line-clamp-2">{post.title}</h2>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author?.profile?.firstName}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
