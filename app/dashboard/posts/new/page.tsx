// app/dashboard/posts/new/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser, requireContributor } from "@/lib/auth";
import { PostForm } from "@/components/dashboard/post-form";

export default async function NewPostPage() {
  const user = await requireContributor();

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create New Post</h1>
        <p className="text-muted-foreground">Write and publish a new blog post</p>
      </div>

      <PostForm user={user} />
    </div>
  );
}