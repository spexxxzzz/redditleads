import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogTestimonials } from "@/components/blog/BlogTestimonials";
import { BlogNewsletter } from "@/components/blog/BlogNewsletter";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black">
      <BlogHeader />
      <BlogGrid />
      <BlogTestimonials />
      <BlogNewsletter />
    </div>
  );
}
