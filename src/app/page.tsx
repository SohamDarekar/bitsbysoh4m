import { getSortedPostsData } from '@/lib/posts';
import BlogCard from '@/components/BlogCard';
import NewsLetterForm from '@/components/NewsLetterForm';

export default async function HomePage() {
  const posts = getSortedPostsData();

  return (
    <>
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Welcome to bitsbysoh4m</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          A weekly journal of gratitude, learning, favourites, and personal reflections.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Latest Posts</h2>
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </section>

      <NewsLetterForm />
    </>
  );
}
