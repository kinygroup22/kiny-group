/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/blog/[slug]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  User, 
  MessageCircle, 
  Heart, 
  Share2, 
  ArrowLeft,
  Clock,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  TrendingUp,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
  Link2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  authorId?: string;
  likes: number;
  comments: number;
  category: string;
  categoryId?: string;
  readTime: string;
  featured: boolean;
  imageUrl: string;
  slug: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  views?: number;
  authorImage?: string;
}

interface Comment {
  id: string;
  author: string;
  authorImage?: string;
  content: string;
  createdAt: string;
  parentId?: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { theme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState({ content: "" });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  // Fetch blog post data
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/blog/${resolvedParams.slug}`);
        
        if (!response.ok) {
          throw new Error('Blog post not found');
        }
        
        const data = await response.json();
        
        const transformedPost: BlogPost = {
          id: data.id,
          title: data.title,
          excerpt: data.excerpt || data.content?.substring(0, 150) + '...' || '',
          content: data.content,
          date: new Date(data.createdAt || data.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          author: data.author || 'Admin',
          authorId: data.authorId,
          authorImage: data.authorImage,
          likes: data.likes || 0,
          comments: data.comments || 0,
          views: data.views || 0,
          category: data.category || 'Uncategorized',
          categoryId: data.categoryId,
          readTime: data.readTime || `${Math.ceil((data.content?.length || 0) / 1000)} menit baca`,
          featured: data.featured || false,
          imageUrl: data.imageUrl || data.featuredImage || '/placeholder-blog.jpg',
          slug: data.slug || data.id,
          published: data.published,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          tags: data.tags || []
        };
        
        setBlogPost(transformedPost);
        
        // Fetch related posts
        const relatedResponse = await fetch(`/api/blog?category=${transformedPost.category}&limit=3`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          const filteredRelatedPosts = relatedData.filter((post: any) => post.id !== transformedPost.id).slice(0, 3);
          setRelatedPosts(filteredRelatedPosts.map((post: any) => ({
            ...post,
            imageUrl: post.imageUrl || post.featuredImage || '/placeholder-blog.jpg'
          })));
        }
        
        // Fetch comments
        const commentsResponse = await fetch(`/api/blog/${resolvedParams.slug}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData.comments || []);
        }
        
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Artikel tidak ditemukan atau terjadi kesalahan saat memuat artikel.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogPost();
  }, [resolvedParams.slug]);

  // Check if user has liked the post (using localStorage for non-logged in users)
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (blogPost) {
        try {
          // For non-logged in users, get or create anonymousId from localStorage
          if (!session?.user) {
            let storedAnonymousId = localStorage.getItem('anonymousId');
            if (!storedAnonymousId) {
              // Generate a unique ID for this browser
              storedAnonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              localStorage.setItem('anonymousId', storedAnonymousId);
            }
            setAnonymousId(storedAnonymousId);
          }

          // Get the like status from API
          const response = await fetch(`/api/blog/${blogPost.slug}/like`);
          if (response.ok) {
            const data = await response.json();
            
            // Update like count from server
            setBlogPost(prev => prev ? {
              ...prev,
              likes: data.likes
            } : null);
            
            // Set liked status from server
            setLiked(data.liked);
            
            // Store anonymousId if provided by server
            if (data.anonymousId && !session?.user) {
              setAnonymousId(data.anonymousId);
            }
          }
        } catch (err) {
          console.error('Error checking like status:', err);
        }
      }
    };

    checkLikeStatus();
  }, [session, blogPost?.slug]);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLike = async () => {
    if (!blogPost || likePending) return;
    
    setLikePending(true);
    
    try {
      const response = await fetch(`/api/blog/${blogPost.slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Send anonymousId for non-authenticated users
          anonymousId: !session?.user ? anonymousId : undefined
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update liked status
        setLiked(data.liked);
        
        // Update like count from server
        setBlogPost(prev => prev ? { 
          ...prev, 
          likes: data.likes
        } : null);
        
        // Store/update anonymousId if provided
        if (data.anonymousId && !session?.user) {
          setAnonymousId(data.anonymousId);
          localStorage.setItem('anonymousId', data.anonymousId);
        }
        
        showSuccessToast(data.liked ? "Artikel disukai!" : "Batal menyukai");
      } else {
        const errorData = await response.json();
        console.error('Error from server:', errorData);
        showSuccessToast("Terjadi kesalahan, coba lagi");
      }
    } catch (err) {
      console.error('Error liking post:', err);
      showSuccessToast("Terjadi kesalahan, coba lagi");
    } finally {
      setLikePending(false);
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    showSuccessToast(bookmarked ? "Bookmark dihapus" : "Artikel di-bookmark!");
  };

  const handleShare = async (platform?: string) => {
  const url = window.location.href;
  const text = blogPost?.title || '';

  if (platform === 'facebook') {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  } else if (platform === 'twitter') {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  } else if (platform === 'linkedin') {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  } else {
    // Copy link to clipboard
    try {
      // Check if the Clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        showSuccessToast("Link berhasil disalin!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            showSuccessToast("Link berhasil disalin!");
          } else {
            throw new Error('Copy command failed');
          }
        } catch (err) {
          showSuccessToast("Gagal menyalin link. Silakan salin secara manual.");
          console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      showSuccessToast("Gagal menyalin link. Silakan salin secara manual.");
      console.error('Error copying link:', err);
    }
  }
};

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (!commentForm.content.trim() || !blogPost) return;
    
    setSubmittingComment(true);
    
    try {
      const response = await fetch(`/api/blog/${blogPost.slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentForm.content })
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setCommentForm({ content: "" });
        setBlogPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
        showSuccessToast("Komentar berhasil ditambahkan!");
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Artikel Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6 text-center">{error || 'Artikel yang Anda cari tidak ditemukan.'}</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
          <Card className="border-green-500 bg-green-50 dark:bg-green-950 shadow-lg">
            <CardContent className="flex items-center gap-2 py-3 px-4">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                {successMessage}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-31.25 overflow-hidden">
        <Image 
          src={blogPost.imageUrl} 
          alt={blogPost.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />
        
        <div className="absolute inset-0 container mx-auto px-4 flex items-end pb-12">
          <div className="max-w-4xl">
            <Button variant="ghost" asChild className="mb-6 text-white hover:bg-white/20">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Blog
              </Link>
            </Button>
            
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl flex flex-col">
              <Badge className="mb-4 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg text-sm px-4 py-1">
                {blogPost.category}
              </Badge>
              {blogPost.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90">
              <div className="flex items-center gap-2">
                {blogPost.authorImage ? (
                  <Image 
                    src={blogPost.authorImage} 
                    alt={blogPost.author}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white/50">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="font-medium">{blogPost.author}</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-white/30" />
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {blogPost.date}
              </div>
              <Separator orientation="vertical" className="h-4 bg-white/30" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {blogPost.readTime}
              </div>
              <Separator orientation="vertical" className="h-4 bg-white/30" />
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {blogPost.views?.toLocaleString() || 0} views
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Content Card */}
          <Card className="border-0 shadow-2xl overflow-hidden mb-8">
            {blogPost.excerpt && (
              <CardHeader className="bg-linear-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border-b py-6">
                <p className="text-lg md:text-xl text-muted-foreground italic border-l-4 border-primary pl-6 py-3 leading-relaxed">
                  {blogPost.excerpt}
                </p>
              </CardHeader>
            )}

            <CardContent className="p-6 md:p-10 space-y-8">
              {/* Floating Action Bar */}
              <div className="sticky top-4 float-right ml-4 mb-4 flex flex-col gap-2 z-20">
                <Button
                  size="icon"
                  variant={liked ? "default" : "outline"}
                  onClick={handleLike}
                  disabled={likePending}
                  className={`shadow-lg ${liked ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-background'}`}
                  title="Suka"
                >
                  {likePending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  )}
                </Button>
                
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleBookmark}
                  className={`shadow-lg ${bookmarked ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background'}`}
                  title="Bookmark"
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleShare()}
                  className="shadow-lg bg-background"
                  title="Salin Link"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Rich Text Content - Using custom styles matching the rich text editor */}
              <div 
                className="rich-text-content min-h-75 p-4 focus:outline-none max-w-none"
                dangerouslySetInnerHTML={{ __html: blogPost.content }} 
              />

              {/* Tags */}
              {blogPost.tags && blogPost.tags.length > 0 && (
                <div className="pt-8 border-t border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blogPost.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 border-primary/30 dark:border-primary/50 text-primary dark:text-primary/80 px-3 py-1 text-sm transition-colors cursor-pointer"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats & Actions */}
              <div className="pt-8 border-t border-border">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={liked ? "default" : "outline"} 
                        size="lg"
                        onClick={handleLike}
                        disabled={likePending}
                        className={`${liked 
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" 
                          : "border-2 border-primary/30 dark:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/20"}`}
                      >
                        {likePending ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <Heart className={`mr-2 h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                        )}
                        <span className="font-semibold">{blogPost.likes.toLocaleString()}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="lg"
                        asChild
                        className="border-2 border-border hover:bg-muted"
                      >
                        <a href="#comments">
                          <MessageCircle className="mr-2 h-5 w-5" />
                          <span className="font-semibold">{blogPost.comments}</span>
                        </a>
                      </Button>

                      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-sm">{blogPost.views?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">Bagikan:</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleShare('facebook')}
                      className="hover:bg-blue-50 hover:border-blue-500 dark:hover:bg-blue-950/20"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleShare('twitter')}
                      className="hover:bg-sky-50 hover:border-sky-500 dark:hover:bg-sky-950/20"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleShare('linkedin')}
                      className="hover:bg-blue-50 hover:border-blue-700 dark:hover:bg-blue-950/20"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleShare()}
                      className="hover:bg-primary/10 hover:border-primary dark:hover:bg-primary/20"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div id="comments" className="scroll-mt-20 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-primary" />
              Komentar <span className="text-primary">({blogPost.comments})</span>
            </h3>
            
            {/* Comment Form */}
            <Card className="mb-8 border-0 shadow-lg pt-6">
              <CardHeader>
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Tinggalkan Komentar
                </h4>
                {!session && (
                  <p className="text-sm text-muted-foreground">
                    Anda harus <Link href="/login" className="text-primary hover:underline font-medium">login</Link> untuk berkomentar
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Textarea
                    placeholder={session ? "Bagikan pemikiran Anda..." : "Login untuk berkomentar"}
                    rows={4}
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ content: e.target.value })}
                    disabled={!session}
                    className="resize-none border-2 focus-visible:ring-primary"
                    required
                  />
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 shadow-lg"
                    disabled={submittingComment || !session}
                    size="lg"
                  >
                    {submittingComment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Kirim Komentar
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg">
                          {comment.authorImage ? (
                            <Image 
                              src={comment.authorImage} 
                              alt={comment.author}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-primary-foreground font-semibold">
                              {comment.author.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <h4 className="font-semibold text-lg">{comment.author}</h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">Belum ada komentar</p>
                  <p className="text-muted-foreground">
                    Jadilah yang pertama berkomentar pada artikel ini!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                Artikel Terkait
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <Link href={`/blog/${post.slug}`} key={post.id}>
                    <Card className="group border-0 shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 h-full">
                      <div className="relative h-48 overflow-hidden">
                        <Image 
                          src={post.imageUrl} 
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardHeader className="pb-3">
                        <Badge className="w-fit bg-primary hover:bg-primary/90 mb-3 text-xs">
                          {post.category}
                        </Badge>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {post.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </div>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 group-hover:shadow-lg transition-all" size="sm">
                          Baca Artikel
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom styles to match the rich text editor */}
      <style jsx global>{`
        .rich-text-content {
          color: hsl(var(--foreground));
          background-color: hsl(var(--background));
          min-height: 300px;
        }
        
        .rich-text-content:focus {
          outline: none;
        }
        
        .rich-text-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          color: hsl(var(--foreground));
        }
        
        .rich-text-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5em;
        }
        
        .rich-text-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
          color: hsl(var(--foreground));
        }
        
        .rich-text-content p {
          margin: 1rem 0;
          line-height: 1.5;
          color: hsl(var(--muted-foreground));
        }
        
        .rich-text-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          color: hsl(var(--muted-foreground));
          background-color: hsl(var(--muted) / 0.5);
          padding: 1rem;
          border-radius: 0.375rem;
        }
        
        .rich-text-content pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: monospace;
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
        }
        
        .rich-text-content ul,
        .rich-text-content ol {
          padding-left: 2rem;
          margin: 1rem 0;
          color: hsl(var(--muted-foreground));
          list-style-position: outside;
        }
        
        .rich-text-content ul {
          list-style-type: disc;
        }
        
        .rich-text-content ol {
          list-style-type: decimal;
        }
        
        .rich-text-content li {
          margin: 0.5rem 0;
          display: list-item;
        }
        
        .rich-text-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          font-weight: 500;
        }
        
        .rich-text-content a:hover {
          color: hsl(var(--primary) / 0.8);
        }
        
        .rich-text-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem 0;
          border-radius: 0.375rem;
          border: 1px solid hsl(var(--border));
        }
        
        .rich-text-content code {
          color: hsl(var(--primary));
          background-color: hsl(var(--muted) / 0.5);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        
        .rich-text-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        
        .rich-text-content th {
          background-color: hsl(var(--muted));
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border: 1px solid hsl(var(--border));
        }
        
        .rich-text-content td {
          padding: 0.75rem;
          border: 1px solid hsl(var(--border));
        }
        
        .rich-text-content hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}